import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Bot, User } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useCustomer } from '@/hooks/useCustomers'
import { useAppStore } from '@/store/appStore'
import { Spinner } from '@/components/ui/Spinner'
import { customersApi } from '@/api/customers'
import { chatApi } from '@/api/chat'
import { cn } from '@/utils/cn'

export function CustomerDetail() {
  const { customerId } = useParams<{ customerId: string }>()
  const { selectedBusinessSlug: slug } = useAppStore()
  const { data: customer, isLoading } = useCustomer(slug, customerId ?? '')

  // Fetch channels to find the web external_user_id
  const { data: channels = [] } = useQuery({
    queryKey: ['customer-channels', slug, customerId],
    queryFn: () => customersApi.channels(slug, customerId ?? ''),
    enabled: !!slug && !!customerId,
  })
  const webChannel = channels.find((c) => c.channel === 'web')

  // Fetch conversation history if there is a web channel
  const { data: history = [], isLoading: historyLoading } = useQuery({
    queryKey: ['customer-history', webChannel?.external_user_id, slug],
    queryFn: () => chatApi.history({ user_id: webChannel!.external_user_id, business_slug: slug }),
    enabled: !!webChannel,
  })

  if (isLoading) return <Spinner />
  if (!customer) return <p className="text-gray-500">Customer not found.</p>

  return (
    <div className="max-w-2xl space-y-4">
      <Link to="/customers" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      {/* Info card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">{customer.name ?? 'Unknown Customer'}</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="font-medium text-gray-500">ID</p>
            <p className="truncate font-mono text-xs text-gray-900">{customer.id}</p>
          </div>
          <div>
            <p className="font-medium text-gray-500">Phone</p>
            <p className="text-gray-900">{customer.phone ?? '—'}</p>
          </div>
          <div>
            <p className="font-medium text-gray-500">Email</p>
            <p className="text-gray-900">{customer.email ?? '—'}</p>
          </div>
          <div>
            <p className="font-medium text-gray-500">Channels</p>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {channels.length === 0 ? (
                <span className="text-gray-400">—</span>
              ) : (
                channels.map((ch) => (
                  <span key={ch.id} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-700">
                    {ch.channel}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Conversation history */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">Web Conversation History</h3>

        {!webChannel ? (
          <p className="text-sm text-gray-400">No web channel sessions for this customer.</p>
        ) : historyLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={cn('flex gap-3 animate-pulse', i % 2 ? 'flex-row-reverse' : '')}>
                <div className="h-8 w-8 rounded-full bg-gray-200 shrink-0" />
                <div className="h-10 flex-1 rounded-2xl bg-gray-100" />
              </div>
            ))}
          </div>
        ) : history.length === 0 ? (
          <p className="text-sm text-gray-400">No messages in this session yet.</p>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {history.map((m, i) => (
              <div
                key={i}
                className={cn('flex gap-3', m.role === 'user' ? 'flex-row-reverse' : '')}
              >
                <div
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                    m.role === 'user' ? 'bg-blue-600' : 'bg-gray-200',
                  )}
                >
                  {m.role === 'user'
                    ? <User className="h-4 w-4 text-white" />
                    : <Bot className="h-4 w-4 text-gray-600" />}
                </div>
                <div
                  className={cn(
                    'max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed',
                    m.role === 'user'
                      ? 'rounded-tr-sm bg-blue-600 text-white'
                      : 'rounded-tl-sm bg-gray-100 text-gray-800',
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
