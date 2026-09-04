import { useState } from 'react'
import { TicketCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTickets } from '@/hooks/useSupport'
import { useTenantSlug } from '@/hooks/useTenantSlug'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { TICKET_PRIORITY_COLORS, TICKET_STATUS_LABELS } from '@/utils/constants'
import { cn } from '@/utils/cn'
import type { TicketStatus } from '@/types/support'

const STATUS_TABS: { value: TicketStatus | 'open'; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'WAITING_CUSTOMER', label: 'Waiting' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
]

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i} className="px-5 py-3">
          <div className="h-4 rounded bg-gray-200" />
        </td>
      ))}
    </tr>
  )
}

export function TicketList() {
  const selectedBusinessSlug = useTenantSlug()
  const [tab, setTab] = useState<TicketStatus | 'open'>('open')
  const { data: tickets, isLoading } = useTickets(
    selectedBusinessSlug,
    tab === 'open' ? undefined : { status: tab as TicketStatus },
  )

  const displayed = tab === 'open'
    ? tickets?.filter((t) => ['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER'].includes(t.status))
    : tickets

  return (
    <div>
      {/* Status tabs */}
      <div className="mb-4 flex items-center gap-1 border-b border-gray-200">
        {STATUS_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors',
              tab === t.value
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {displayed?.length === 0 && !isLoading ? (
        <EmptyState
          icon={TicketCheck}
          title="No tickets"
          description="No support tickets in this category."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-3">Reference</th>
                <th className="px-5 py-3">Reason</th>
                <th className="px-5 py-3">Priority</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Assigned To</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                : displayed?.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <Link
                          to={`/support/${t.reference}`}
                          className="font-mono font-medium text-blue-600 hover:underline"
                        >
                          {t.reference}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        {t.reason.replace(/_/g, ' ')}
                      </td>
                      <td className="px-5 py-3">
                        <Badge colorClass={TICKET_PRIORITY_COLORS[t.priority]}>
                          {t.priority}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        {TICKET_STATUS_LABELS[t.status]}
                      </td>
                      <td className="px-5 py-3 text-gray-600">{t.assigned_to ?? '—'}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
