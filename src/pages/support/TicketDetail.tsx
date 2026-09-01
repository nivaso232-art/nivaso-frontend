import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useTicket } from '@/hooks/useSupport'
import { useAppStore } from '@/store/appStore'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { TICKET_PRIORITY_COLORS, TICKET_STATUS_LABELS } from '@/utils/constants'

export function TicketDetail() {
  const { reference } = useParams<{ reference: string }>()
  const { selectedBusinessSlug } = useAppStore()
  const { data: ticket, isLoading } = useTicket(selectedBusinessSlug, reference ?? '')

  if (isLoading) return <Spinner />
  if (!ticket) return <p className="text-gray-500">Ticket not found.</p>

  return (
    <div className="max-w-2xl">
      <Link to="/support" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="font-mono text-sm text-gray-500">{ticket.reference}</p>
            <h2 className="text-lg font-semibold text-gray-900">
              {ticket.reason.replace(/_/g, ' ')}
            </h2>
          </div>
          <div className="flex gap-2">
            <Badge colorClass={TICKET_PRIORITY_COLORS[ticket.priority]}>{ticket.priority}</Badge>
          </div>
        </div>

        <p className="mb-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">{ticket.summary}</p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-500">Status</p>
            <p className="text-gray-900">{TICKET_STATUS_LABELS[ticket.status]}</p>
          </div>
          <div>
            <p className="font-medium text-gray-500">Assigned To</p>
            <p className="text-gray-900">{ticket.assigned_to ?? 'Unassigned'}</p>
          </div>
          <div>
            <p className="font-medium text-gray-500">Customer ID</p>
            <p className="truncate font-mono text-xs text-gray-900">{ticket.customer_id}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
