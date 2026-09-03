import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react'
import { superAdminApi } from '@/api/superAdmin'
import { cn } from '@/utils/cn'

const PLANS = ['free', 'starter', 'pro', 'enterprise']

const PLAN_COLORS: Record<string, string> = {
  free:       'bg-gray-700 text-gray-300',
  starter:    'bg-blue-900 text-blue-300',
  pro:        'bg-violet-900 text-violet-300',
  enterprise: 'bg-amber-900 text-amber-300',
}

const STATUS_COLORS: Record<string, string> = {
  active:    'bg-green-900 text-green-300',
  suspended: 'bg-red-900 text-red-300',
  inactive:  'bg-gray-700 text-gray-400',
}

// Flags grouped for the UI
const BOOLEAN_FLAGS = [
  { key: 'ai.custom_model_picker',   label: 'Custom model picker' },
  { key: 'channel.web',              label: 'Web chat' },
  { key: 'channel.whatsapp',         label: 'WhatsApp' },
  { key: 'channel.telegram',         label: 'Telegram' },
  { key: 'channel.payments',         label: 'Razorpay payments' },
  { key: 'orders.enabled',           label: 'Order management' },
  { key: 'support.tickets_enabled',  label: 'Support tickets' },
  { key: 'credentials.enabled',      label: 'Credential vault' },
  { key: 'ui.dashboard_customize',   label: 'Dashboard customization' },
  { key: 'ui.agent_runs',            label: 'Agent runs log' },
  { key: 'ui.webhook_events',        label: 'Webhook events log' },
]

const NUMERIC_FLAGS = [
  { key: 'catalog.products_limit',   label: 'Max products',       unit: 'products' },
  { key: 'knowledge.articles_limit', label: 'Max articles',       unit: 'articles' },
  { key: 'ai.max_iterations',        label: 'Max agent iterations', unit: 'turns' },
]

export function SuperAdminBusinessDetail() {
  const { slug } = useParams<{ slug: string }>()
  const qc = useQueryClient()

  const { data: biz, isLoading } = useQuery({
    queryKey: ['super-admin-business', slug],
    queryFn: () => superAdminApi.getBusiness(slug!),
    enabled: !!slug,
  })

  // Local override state — mirrors the resolved flags with user edits
  const [overrides, setOverrides] = useState<Record<string, unknown>>({})
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (biz) setOverrides(biz.overrides)
  }, [biz])

  const [planError, setPlanError] = useState('')

  const { mutate: savePlan, isPending: planPending } = useMutation({
    mutationFn: (plan: string) => superAdminApi.setPlan(slug!, plan),
    onSuccess: () => {
      setPlanError('')
      qc.invalidateQueries({ queryKey: ['super-admin-business', slug] })
    },
    onError: (e: any) => setPlanError(e?.response?.data?.error?.message ?? 'Failed to update plan'),
  })

  const { mutate: saveOverrides, isPending: saving } = useMutation({
    mutationFn: () => superAdminApi.setOverrides(slug!, overrides),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['super-admin-business', slug] })
      setDirty(false)
    },
  })

  const { mutate: setStatus } = useMutation({
    mutationFn: (status: string) => superAdminApi.setStatus(slug!, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['super-admin-business', slug] }),
  })

  const setBoolOverride = (key: string, value: boolean | undefined) => {
    setDirty(true)
    if (value === undefined) {
      const { [key]: _, ...rest } = overrides
      setOverrides(rest)
    } else {
      setOverrides((o) => ({ ...o, [key]: value }))
    }
  }

  const setNumOverride = (key: string, raw: string) => {
    setDirty(true)
    if (raw === '' || raw === 'unlimited') {
      const { [key]: _, ...rest } = overrides
      setOverrides(rest)
    } else {
      setOverrides((o) => ({ ...o, [key]: Number(raw) }))
    }
  }

  if (isLoading || !biz) {
    return <div className="h-32 animate-pulse rounded-xl bg-gray-800" />
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Link to="/super-admin/businesses" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300">
        <ArrowLeft className="h-4 w-4" /> All Businesses
      </Link>

      {/* Header */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-xs text-gray-500">{biz.business_slug}</p>
            <h1 className="text-lg font-bold text-white">{biz.business_name}</h1>
            <p className="text-xs text-gray-500 mt-0.5">{biz.business_timezone}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', PLAN_COLORS[biz.plan] ?? PLAN_COLORS.free)}>
              {biz.plan}
            </span>
            <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', STATUS_COLORS[biz.business_status] ?? STATUS_COLORS.inactive)}>
              {biz.business_status}
            </span>
          </div>
        </div>

        {/* Status controls */}
        <div className="mt-4 flex gap-2">
          {biz.business_status !== 'active' && (
            <button onClick={() => setStatus('active')} className="rounded-lg bg-green-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-600">
              Reactivate
            </button>
          )}
          {biz.business_status === 'active' && (
            <button onClick={() => setStatus('suspended')} className="rounded-lg bg-red-900 px-3 py-1.5 text-xs font-medium text-red-200 hover:bg-red-800">
              Suspend
            </button>
          )}
          {biz.business_status !== 'inactive' && (
            <button onClick={() => setStatus('inactive')} className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-400 hover:border-gray-600">
              Deactivate
            </button>
          )}
        </div>
      </div>

      {/* Plan assignment */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
        <p className="mb-3 text-sm font-semibold text-white">Plan Tier</p>
        <div className="flex gap-2 flex-wrap">
          {PLANS.map((p) => (
            <button
              key={p}
              onClick={() => savePlan(p)}
              disabled={planPending || biz.plan === p}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-medium capitalize border transition-colors disabled:cursor-not-allowed disabled:opacity-60',
                biz.plan === p
                  ? 'border-violet-500 bg-violet-900 text-violet-200'
                  : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600',
              )}
            >
              {p}
            </button>
          ))}
        </div>
        {planError && <p className="mt-2 text-xs text-red-400">{planError}</p>}
      </div>

      {/* Feature flag overrides */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5 space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Feature Flag Overrides</p>
          <p className="text-xs text-gray-500">Empty = use plan default</p>
        </div>

        {/* Boolean flags */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-600">Access Flags</p>
          <div className="space-y-2">
            {BOOLEAN_FLAGS.map(({ key, label }) => {
              const planDefault = biz.resolved[key]
              const override = overrides[key]
              const hasOverride = key in overrides
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="flex-1 text-xs text-gray-400">{label}</span>
                  <span className="text-xs text-gray-600">
                    Plan: {planDefault === null ? '∞' : String(planDefault)}
                  </span>
                  {/* Three-state: default / force-on / force-off */}
                  <div className="flex gap-1">
                    {(['default', 'on', 'off'] as const).map((opt) => (
                      <button
                        key={opt}
                        onClick={() =>
                          setBoolOverride(
                            key,
                            opt === 'default' ? undefined : opt === 'on'
                          )
                        }
                        className={cn(
                          'rounded px-2 py-0.5 text-xs transition-colors',
                          (opt === 'default' && !hasOverride) ||
                          (opt === 'on' && override === true) ||
                          (opt === 'off' && override === false)
                            ? 'bg-violet-700 text-white'
                            : 'bg-gray-800 text-gray-500 hover:bg-gray-700',
                        )}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Numeric flags */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-600">Limits</p>
          <div className="space-y-2">
            {NUMERIC_FLAGS.map(({ key, label, unit }) => {
              const planDefault = biz.resolved[key]
              const overrideVal = overrides[key]
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="flex-1 text-xs text-gray-400">{label}</span>
                  <span className="text-xs text-gray-600">
                    Plan: {planDefault === null ? '∞' : String(planDefault)} {unit}
                  </span>
                  <input
                    type="number"
                    min={0}
                    placeholder="plan default"
                    value={overrideVal !== undefined ? String(overrideVal) : ''}
                    onChange={(e) => setNumOverride(key, e.target.value)}
                    className="w-28 rounded-lg border border-gray-700 bg-gray-800 px-2 py-1 text-xs text-gray-200 placeholder-gray-600 focus:border-violet-500 focus:outline-none"
                  />
                </div>
              )
            })}
          </div>
        </div>

        {dirty && (
          <div className="flex items-center gap-3 pt-2 border-t border-gray-800">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
            <p className="text-xs text-amber-400 flex-1">Unsaved override changes</p>
            <button
              onClick={() => saveOverrides()}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg bg-violet-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-600 disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? 'Saving…' : 'Save Overrides'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
