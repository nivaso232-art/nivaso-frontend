import { useState } from 'react'
import { Webhook } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/store/appStore'
import { webhookEventsApi } from '@/api/webhookEvents'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import type { WebhookStatus, WebhookSource } from '@/types/webhookEvent'

const STATUS_COLORS: Record<WebhookStatus, string> = {
  received: 'bg-blue-100 text-blue-700',
  processing: 'bg-yellow-100 text-yellow-700',
  processed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  ignored: 'bg-gray-100 text-gray-500',
}

const SOURCE_COLORS: Record<WebhookSource, string> = {
  whatsapp: 'bg-green-100 text-green-700',
  telegram: 'bg-blue-100 text-blue-700',
  razorpay: 'bg-purple-100 text-purple-700',
}

const SOURCE_TABS: { value: WebhookSource | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'razorpay', label: 'Razorpay' },
]

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i} className="px-5 py-3"><div className="h-4 rounded bg-gray-200" /></td>
      ))}
    </tr>
  )
}

export function WebhookEventList() {
  const { selectedBusinessSlug: slug } = useAppStore()
  const [source, setSource] = useState<WebhookSource | 'all'>('all')

  const { data: events, isLoading } = useQuery({
    queryKey: ['webhook-events', slug, source],
    queryFn: () =>
      webhookEventsApi.list(slug, { source: source === 'all' ? undefined : source, limit: 100 }),
    enabled: !!slug,
    staleTime: 15_000,
  })

  return (
    <div>
      {/* Source tabs */}
      <div className="mb-4 flex items-center gap-1 border-b border-gray-200">
        {SOURCE_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setSource(t.value)}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors',
              source === t.value ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {events?.length === 0 && !isLoading ? (
        <EmptyState icon={Webhook} title="No webhook events" description="Incoming events from WhatsApp, Telegram, and Razorpay appear here." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-3">Source</th>
                <th className="px-5 py-3">Event ID</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Attempts</th>
                <th className="px-5 py-3">Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                : events?.map((e) => (
                    <tr key={e.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <Badge colorClass={SOURCE_COLORS[e.source]}>{e.source}</Badge>
                      </td>
                      <td className="px-5 py-3 max-w-xs">
                        <p className="truncate font-mono text-xs text-gray-600">{e.external_event_id}</p>
                      </td>
                      <td className="px-5 py-3">
                        <Badge colorClass={STATUS_COLORS[e.status]}>{e.status}</Badge>
                      </td>
                      <td className="px-5 py-3 text-gray-600">{e.attempts}</td>
                      <td className="px-5 py-3 text-gray-500">{formatDate(e.created_at)}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
