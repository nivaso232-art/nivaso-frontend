import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { useTicket, useUpdateTicket } from '@/hooks/useSupport'
import { useAppStore } from '@/store/appStore'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { TICKET_PRIORITY_COLORS, TICKET_STATUS_LABELS } from '@/utils/constants'
import type { TicketStatus, TicketPriority } from '@/types/support'

const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'WAITING_CUSTOMER', label: 'Waiting Customer' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
]

const PRIORITY_OPTIONS: { value: TicketPriority; label: string }[] = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
]

export function TicketDetail() {
  const { reference } = useParams<{ reference: string }>()
  const { selectedBusinessSlug } = useAppStore()
  const { data: ticket, isLoading } = useTicket(selectedBusinessSlug, reference ?? '')
  const { mutate: update, isPending } = useUpdateTicket(selectedBusinessSlug, reference ?? '')

  const [status, setStatus] = useState<TicketStatus | ''>('')
  const [priority, setPriority] = useState<TicketPriority | ''>('')
  const [assignedTo, setAssignedTo] = useState('')
  const [resolution, setResolution] = useState('')
  const [saved, setSaved] = useState(false)

  if (isLoading) return <Spinner />
  if (!ticket) return <p className="text-gray-500">Ticket not found.</p>

  const effectiveStatus = (status || ticket.status) as TicketStatus

  const handleSave = () => {
    const payload: Record<string, string | undefined> = {}
    if (status) payload.status = status
    if (priority) payload.priority = priority
    if (assignedTo.trim()) payload.assigned_to = assignedTo.trim()
    if (effectiveStatus === 'RESOLVED' && resolution.trim()) {
      payload.resolution = resolution.trim()
    }
    if (Object.keys(payload).length === 0) return
    update(payload as any, {
      onSuccess: () => {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
        setStatus('')
        setPriority('')
        setAssignedTo('')
        setResolution('')
      },
    })
  }

  return (
    <div className="max-w-2xl space-y-4">
      <Link
        to="/support"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      {/* Detail card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <p className="font-mono text-sm text-gray-500">{ticket.reference}</p>
            <h2 className="text-lg font-semibold text-gray-900">
              {ticket.reason.replace(/_/g, ' ')}
            </h2>
          </div>
          <div className="flex gap-2">
            <Badge colorClass={TICKET_PRIORITY_COLORS[ticket.priority]}>
              {ticket.priority}
            </Badge>
            <Badge>{TICKET_STATUS_LABELS[ticket.status]}</Badge>
          </div>
        </div>

        <p className="mb-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
          {ticket.summary}
        </p>

        <div className="grid grid-cols-2 gap-4 text-sm">
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

      {/* Workflow form */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-gray-700">Update Ticket</h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Status"
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as TicketStatus)}
              placeholder={TICKET_STATUS_LABELS[ticket.status]}
              options={STATUS_OPTIONS}
            />
            <Select
              label="Priority"
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TicketPriority)}
              placeholder={ticket.priority}
              options={PRIORITY_OPTIONS}
            />
          </div>

          <Input
            label="Assign To"
            id="assigned_to"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            placeholder={ticket.assigned_to ?? 'agent@company.com'}
          />

          {effectiveStatus === 'RESOLVED' && (
            <Textarea
              label="Resolution Note"
              id="resolution"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="Describe how this was resolved…"
              rows={3}
            />
          )}

          <div className="flex items-center gap-3">
            <Button onClick={handleSave} loading={isPending}>
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
            {saved && (
              <span className="text-sm text-green-600 font-medium">Saved!</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
