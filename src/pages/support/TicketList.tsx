import { TicketCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTickets } from '@/hooks/useSupport'
import { useAppStore } from '@/store/appStore'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { TICKET_PRIORITY_COLORS, TICKET_STATUS_LABELS } from '@/utils/constants'

export function TicketList() {
  const { selectedBusinessSlug } = useAppStore()
  const { data: tickets, isLoading } = useTickets(selectedBusinessSlug)

  if (isLoading) return <Spinner />

  return (
    <div>
      <div className="mb-4">
        <p className="text-sm text-gray-500">{tickets?.length ?? 0} open tickets</p>
      </div>

      {tickets?.length === 0 ? (
        <EmptyState icon={TicketCheck} title="No open tickets" description="All support tickets have been resolved." />
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
              {tickets?.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <Link to={`/support/${t.reference}`} className="font-mono font-medium text-blue-600 hover:underline">
                      {t.reference}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-gray-600">
                    {t.reason.replace(/_/g, ' ')}
                  </td>
                  <td className="px-5 py-3">
                    <Badge colorClass={TICKET_PRIORITY_COLORS[t.priority]}>{t.priority}</Badge>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{TICKET_STATUS_LABELS[t.status]}</td>
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
