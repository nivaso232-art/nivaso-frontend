import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { useBusiness, useUpdateBusiness } from '@/hooks/useBusinesses'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { BUSINESS_STATUS_COLORS } from '@/utils/constants'
import { cn } from '@/utils/cn'
import type { BusinessStatus } from '@/types/business'

const STATUS_OPTIONS: { value: BusinessStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'inactive', label: 'Inactive' },
]

type Tab = 'overview' | 'settings'

export function BusinessDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { data: business, isLoading } = useBusiness(slug ?? '')
  const { mutate: update, isPending: saving } = useUpdateBusiness(slug ?? '')

  const [tab, setTab] = useState<Tab>('overview')
  const [saved, setSaved] = useState(false)
  const [confirmStatus, setConfirmStatus] = useState<BusinessStatus | null>(null)

  // Overview form
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [timezone, setTimezone] = useState('')

  // Settings form
  const [agentTone, setAgentTone] = useState('')
  const [startHour, setStartHour] = useState('')
  const [endHour, setEndHour] = useState('')
  const [razorpayEnabled, setRazorpayEnabled] = useState(false)

  useEffect(() => {
    if (!business) return
    setName(business.name)
    setDescription(business.description ?? '')
    setTimezone(business.timezone)
    const s = business.settings as Record<string, unknown>
    setAgentTone((s.agent_tone as string) ?? '')
    const bh = s.business_hours as Record<string, string> | undefined
    setStartHour(bh?.start ?? '')
    setEndHour(bh?.end ?? '')
    setRazorpayEnabled((s.razorpay_enabled as boolean) ?? false)
  }, [business])

  if (isLoading) return <Spinner />
  if (!business) return <p className="text-gray-500">Business not found.</p>

  const doSave = (payload: object) => {
    update(payload as any, {
      onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 2000) },
    })
  }

  const handleSaveOverview = () => {
    doSave({
      name: name.trim() || business.name,
      description: description.trim() || undefined,
      timezone: timezone.trim() || business.timezone,
    })
  }

  const handleSaveSettings = () => {
    const existing = business.settings as Record<string, unknown>
    doSave({
      settings: {
        ...existing,
        agent_tone: agentTone.trim() || undefined,
        razorpay_enabled: razorpayEnabled,
        business_hours: startHour || endHour
          ? { ...((existing.business_hours as object) ?? {}), start: startHour, end: endHour }
          : existing.business_hours,
      },
    })
  }

  const handleStatusChange = (newStatus: BusinessStatus) => {
    if (newStatus === 'active') {
      update({ status: newStatus })
    } else {
      setConfirmStatus(newStatus)
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <Link to="/businesses" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {(['overview', 'settings'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 text-sm font-medium capitalize transition-colors',
              tab === t ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-mono text-sm text-gray-500">{business.slug}</p>
              <h2 className="text-xl font-semibold text-gray-900">{business.name}</h2>
            </div>
            <div className="flex items-center gap-2">
              <Badge colorClass={BUSINESS_STATUS_COLORS[business.status]}>{business.status}</Badge>
              <Select
                value=""
                onChange={(e) => handleStatusChange(e.target.value as BusinessStatus)}
                options={STATUS_OPTIONS.filter((o) => o.value !== business.status)}
                placeholder="Change status…"
                className="text-xs"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Textarea
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
            <Input label="Timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} />
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleSaveOverview} loading={saving}><Save className="h-4 w-4" /> Save</Button>
            {saved && <span className="text-sm font-medium text-green-600">Saved!</span>}
          </div>
        </div>
      )}

      {tab === 'settings' && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Agent Settings</h3>

          <Input
            label="Agent Tone"
            value={agentTone}
            onChange={(e) => setAgentTone(e.target.value)}
            placeholder="friendly_casual"
          />

          <div>
            <p className="mb-1 text-sm font-medium text-gray-700">Business Hours</p>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Open"
                value={startHour}
                onChange={(e) => setStartHour(e.target.value)}
                placeholder="09:00"
              />
              <Input
                label="Close"
                value={endHour}
                onChange={(e) => setEndHour(e.target.value)}
                placeholder="22:00"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Razorpay Payments</p>
              <p className="text-xs text-gray-500">Enable Razorpay payment links for orders</p>
            </div>
            <button
              onClick={() => setRazorpayEnabled((v) => !v)}
              className={cn(
                'relative h-6 w-11 rounded-full transition-colors',
                razorpayEnabled ? 'bg-blue-600' : 'bg-gray-300',
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                  razorpayEnabled ? 'translate-x-5' : 'translate-x-0.5',
                )}
              />
            </button>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-500">All Settings (raw)</p>
            <pre className="rounded-lg bg-gray-50 p-3 text-xs text-gray-700 overflow-auto max-h-40">
              {JSON.stringify(business.settings, null, 2)}
            </pre>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleSaveSettings} loading={saving}><Save className="h-4 w-4" /> Save Settings</Button>
            {saved && <span className="text-sm font-medium text-green-600">Saved!</span>}
          </div>
        </div>
      )}

      {/* Status change confirmation */}
      <Modal
        open={!!confirmStatus}
        onClose={() => setConfirmStatus(null)}
        title={`Set business to ${confirmStatus}?`}
      >
        <p className="mb-4 text-sm text-gray-600">
          This will change <strong>{business.name}</strong> to <strong>{confirmStatus}</strong>.
          {confirmStatus === 'suspended' && ' The AI agent will stop accepting orders.'}
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmStatus(null)}>Cancel</Button>
          <Button
            variant="danger"
            onClick={() => {
              if (confirmStatus) update({ status: confirmStatus }, { onSuccess: () => setConfirmStatus(null) })
            }}
            loading={saving}
          >
            Confirm
          </Button>
        </div>
      </Modal>
    </div>
  )
}
