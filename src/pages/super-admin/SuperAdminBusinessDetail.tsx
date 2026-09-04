import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save, AlertTriangle, Info } from 'lucide-react'
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

// Impact map — what enabling/disabling each flag affects
const FLAG_IMPACT: Record<string, { tools?: string[]; ui?: string[]; note: string }> = {
  'orders.enabled': {
    tools: ['create_order', 'list_my_orders', 'get_order_status', 'cancel_order', 'get_fulfillment_details'],
    ui: ['Orders page in admin sidebar'],
    note: 'Disabling blocks all order creation. Required before payments can be used.',
  },
  'channel.payments': {
    tools: ['create_payment_link', 'check_payment_status', 'get_order_payment_history', 'retry_payment'],
    note: 'Disabling removes all payment link generation. orders.enabled must also be on.',
  },
  'support.tickets_enabled': {
    tools: ['create_support_ticket', 'list_open_tickets', 'update_support_ticket'],
    ui: ['Support Tickets page'],
    note: 'Disabling removes the AI escalation path. Customers cannot reach humans via chat.',
  },
  'credentials.enabled': {
    tools: ['get_my_credentials', 'check_product_availability'],
    note: 'Required for digital delivery (game accounts, software keys). Enables credential vault.',
  },
  'channel.whatsapp': {
    note: 'Enables WhatsApp Business channel. Customers can chat via WhatsApp.',
  },
  'channel.telegram': {
    note: 'Enables Telegram Bot channel. Customers can chat via Telegram.',
  },
  'channel.web': {
    note: 'Disabling blocks the web chat embed. Customer-facing widget stops working.',
  },
  'ai.custom_model_picker': {
    ui: ['AI Model Selection section in Business Settings'],
    note: 'Shown automatically when plan has 2+ models. This flag is now secondary to model count.',
  },
  'ui.agent_runs': {
    ui: ['Agent Runs log page'],
    note: 'Business admin can see AI conversation logs, token usage, and latency.',
  },
  'ui.webhook_events': {
    ui: ['Webhook Events page'],
    note: 'Business admin can monitor incoming WhatsApp/Telegram/Razorpay webhooks.',
  },
  'ui.dashboard_customize': {
    ui: ['Customize Dashboard button'],
    note: 'Business admin can rearrange which widgets appear on their dashboard.',
  },
}

// Flags grouped for the UI
const BOOLEAN_FLAGS = [
  { key: 'channel.web',              label: 'Web chat channel' },
  { key: 'channel.whatsapp',         label: 'WhatsApp channel' },
  { key: 'channel.telegram',         label: 'Telegram channel' },
  { key: 'channel.payments',         label: 'Razorpay payments' },
  { key: 'orders.enabled',           label: 'Order management' },
  { key: 'support.tickets_enabled',  label: 'Support tickets' },
  { key: 'credentials.enabled',      label: 'Credential vault' },
  { key: 'ai.custom_model_picker',   label: 'Custom model picker' },
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
          <div className="space-y-3">
            {BOOLEAN_FLAGS.map(({ key, label }) => {
              const effective = biz.resolved[key]  // current live value
              const override = overrides[key]
              const hasOverride = key in overrides
              const impact = FLAG_IMPACT[key]

              // What will the value be after saving overrides?
              const pendingValue = hasOverride ? override : effective

              return (
                <div key={key} className="rounded-lg border border-gray-800 p-3 space-y-2">
                  <div className="flex items-center gap-3">
                    {/* Label + current state */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-300">{label}</span>
                        <span className={cn(
                          'rounded-full px-1.5 py-0.5 text-[10px] font-medium',
                          effective === true  ? 'bg-green-900 text-green-300' :
                          effective === false ? 'bg-red-900 text-red-400'    :
                          'bg-gray-700 text-gray-400',
                        )}>
                          {effective === null ? '∞' : effective === true ? 'on' : effective === false ? 'off' : String(effective)}
                        </span>
                        {hasOverride && (
                          <span className="rounded-full bg-amber-900 px-1.5 py-0.5 text-[10px] text-amber-300">
                            overridden
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[10px] font-mono text-gray-600">{key}</p>
                    </div>

                    {/* Three-state toggle */}
                    <div className="flex gap-1 shrink-0">
                      {(['default', 'on', 'off'] as const).map((opt) => (
                        <button
                          key={opt}
                          onClick={() =>
                            setBoolOverride(key, opt === 'default' ? undefined : opt === 'on')
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

                  {/* Impact hint */}
                  {impact && (
                    <div className="flex items-start gap-1.5 text-[10px] text-gray-500">
                      <Info className="h-3 w-3 shrink-0 mt-0.5 text-gray-600" />
                      <div className="space-y-0.5">
                        <p>{impact.note}</p>
                        {pendingValue === false && impact.tools && impact.tools.length > 0 && (
                          <p className="text-red-500">
                            Disabling removes AI tools: {impact.tools.join(', ')}
                          </p>
                        )}
                        {pendingValue === true && impact.tools && impact.tools.length > 0 && (
                          <p className="text-green-500">
                            Enabling unlocks AI tools: {impact.tools.join(', ')}
                          </p>
                        )}
                        {impact.ui && (
                          <p className="text-blue-500/70">
                            UI: {impact.ui.join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
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
