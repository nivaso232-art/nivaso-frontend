import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  TicketCheck,
  MessageSquare,
  Package,
  Bot,
  Users,
  BookOpen,
  AlertTriangle,
  TrendingUp,
  Truck,
  Settings2,
  X,
} from 'lucide-react'
import { fetchMetrics } from '@/api/metrics'
import { useDashboardConfig, useUpdateDashboardConfig } from '@/hooks/useDashboardConfig'
import { useTenantSlug } from '@/hooks/useTenantSlug'
import { useEntitlementStore } from '@/store/entitlementStore'
import { Flag, flagEnabled, flagArray } from '@/types/entitlements'
import type { Entitlements } from '@/types/entitlements'
import { WIDGET_CATALOG, WIDGET_DEPENDENCIES } from '@/config/dashboardWidgets'
import type { RevenuePoint } from '@/types/metrics'
import { cn } from '@/utils/cn'

// ── Colours ──────────────────────────────────────────────────────────────────

const TICKET_STATUS_COLORS: Record<string, string> = {
  OPEN: '#f59e0b',
  IN_PROGRESS: '#3b82f6',
  WAITING_CUSTOMER: '#8b5cf6',
  RESOLVED: '#22c55e',
  CLOSED: '#6b7280',
}

const PRODUCT_STATUS_COLORS: Record<string, string> = {
  active: '#22c55e',
  inactive: '#6b7280',
  out_of_stock: '#f59e0b',
  archived: '#ef4444',
}

const CHART_BLUE = '#3b82f6'
const CHART_VIOLET = '#8b5cf6'
const CHART_GREEN = '#22c55e'

// ── Stat card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
  accent?: 'amber' | 'red'
}

function StatCard({ label, value, sub, icon: Icon, iconBg, iconColor, accent }: StatCardProps) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className={cn('rounded-lg p-2.5 shrink-0', iconBg)}>
        <Icon className={cn('h-5 w-5', iconColor)} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="mt-0.5 text-2xl font-bold text-gray-900">{value}</p>
        {sub && (
          <p
            className={cn(
              'mt-0.5 text-xs',
              accent === 'red'
                ? 'text-red-600'
                : accent === 'amber'
                  ? 'text-amber-600'
                  : 'text-gray-400',
            )}
          >
            {sub}
          </p>
        )}
      </div>
    </div>
  )
}

// ── Chart card wrapper ────────────────────────────────────────────────────────

function ChartCard({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  )
}

// ── Custom tooltips ───────────────────────────────────────────────────────────

function AgentTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md text-xs">
      <p className="mb-1 font-medium text-gray-700">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name === 'runs'
            ? `Runs: ${p.value}`
            : `Tokens: ${p.value.toLocaleString()}`}
        </p>
      ))}
    </div>
  )
}

function SimpleTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md text-xs">
      <p className="font-medium text-gray-700">
        {label ?? payload[0]?.name}: {payload[0]?.value}
      </p>
    </div>
  )
}

function RevenueTooltip({ active, payload, label, currency }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md text-xs">
      <p className="font-medium text-gray-700">
        {label}: {currency} {Number(payload[0]?.value).toLocaleString()}
      </p>
    </div>
  )
}

// ── Skeletons ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm animate-pulse">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-lg bg-gray-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-20 rounded bg-gray-200" />
          <div className="h-7 w-14 rounded bg-gray-200" />
          <div className="h-2.5 w-28 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  )
}

function SkeletonChart({ height = 220 }: { height?: number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm animate-pulse">
      <div className="mb-4 h-4 w-40 rounded bg-gray-200" />
      <div className="rounded bg-gray-100" style={{ height }} />
    </div>
  )
}

// ── Revenue chart ─────────────────────────────────────────────────────────────

const REVENUE_RANGES: { value: 'by_week' | 'by_month' | 'by_year'; label: string }[] = [
  { value: 'by_week', label: 'Week' },
  { value: 'by_month', label: 'Month' },
  { value: 'by_year', label: 'Year' },
]

function RevenueChart({ revenue }: { revenue: { currency: string; by_week: RevenuePoint[]; by_month: RevenuePoint[]; by_year: RevenuePoint[] } }) {
  const [range, setRange] = useState<'by_week' | 'by_month' | 'by_year'>('by_week')
  const data = revenue[range]

  return (
    <ChartCard
      title="Revenue"
      action={
        <div className="flex gap-1 rounded-lg bg-gray-100 p-0.5">
          {REVENUE_RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                range === r.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      }
    >
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
          <YAxis
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
          />
          <Tooltip content={<RevenueTooltip currency={revenue.currency} />} cursor={{ fill: '#f9fafb' }} />
          <Bar dataKey="amount" fill={CHART_GREEN} radius={[4, 4, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// ── Customize panel ───────────────────────────────────────────────────────────

function CustomizePanel({
  allowedKeys,
  selected,
  onSave,
  onClose,
  saving,
}: {
  allowedKeys: Set<string>
  selected: string[]
  onSave: (widgets: string[]) => void
  onClose: () => void
  saving: boolean
}) {
  const [draft, setDraft] = useState<string[]>(selected)

  useEffect(() => setDraft(selected), [selected])

  const toggle = (key: string) => {
    setDraft((d) => (d.includes(key) ? d.filter((k) => k !== key) : [...d, key]))
  }

  const options = WIDGET_CATALOG.filter((w) => allowedKeys.has(w.key))

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">Customize Dashboard</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="h-4 w-4" />
        </button>
      </div>
      {options.length === 0 ? (
        <p className="text-sm text-gray-400">No widgets are available on your plan.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {options.map((w) => (
            <label
              key={w.key}
              className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={draft.includes(w.key)}
                onChange={() => toggle(w.key)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              {w.label}
            </label>
          ))}
        </div>
      )}
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={() => onSave(draft)}
          disabled={saving}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">
          Cancel
        </button>
      </div>
    </div>
  )
}

// ── Allowed-set helper ────────────────────────────────────────────────────────

function buildAllowedSet(entitlements: Entitlements | null): Set<string> {
  const allowedWidgets = flagArray(entitlements, Flag.UI_DASHBOARD_WIDGETS)
  const planAllowed =
    allowedWidgets === null
      ? new Set(WIDGET_CATALOG.map((w) => w.key))
      : new Set(allowedWidgets)

  return new Set(
    WIDGET_CATALOG.map((w) => w.key).filter((key) => {
      if (!planAllowed.has(key)) return false
      const dep = WIDGET_DEPENDENCIES[key]
      return dep == null || flagEnabled(entitlements, dep)
    }),
  )
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export function Dashboard() {
  const slug = useTenantSlug()
  return <DashboardInner slug={slug} />
}

function DashboardInner({ slug }: { slug: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['metrics', slug],
    queryFn: () => fetchMetrics(slug),
    enabled: !!slug,
    refetchInterval: 60_000,
  })

  const entitlements = useEntitlementStore((s) => s.entitlements)
  const canCustomize = flagEnabled(entitlements, Flag.UI_DASHBOARD_CUSTOMIZE)
  const allowedSet = buildAllowedSet(entitlements)

  const { data: config, isLoading: configLoading, isError: configError } = useDashboardConfig(slug)
  const { mutate: saveConfig, isPending: saving } = useUpdateDashboardConfig(slug)
  const [customizing, setCustomizing] = useState(false)

  // If config fails to load, fall back to showing everything the plan allows.
  const activeWidgets = configError
    ? new Set([...allowedSet])
    : new Set(config?.widgets ?? [])

  // Convenience: true when widget is both in saved selection and plan-allowed.
  const show = (key: string) => activeWidgets.has(key) && allowedSet.has(key)

  if (!slug) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <TrendingUp className="mb-3 h-10 w-10 text-gray-300" />
        <p className="text-sm text-gray-500">
          Select a business from the sidebar to view dashboard metrics.
        </p>
      </div>
    )
  }

  if (isLoading || configLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <SkeletonChart height={220} />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50 py-12 text-center">
        <AlertTriangle className="mb-2 h-8 w-8 text-red-400" />
        <p className="text-sm font-medium text-red-700">Failed to load metrics</p>
        <p className="mt-1 text-xs text-red-500">Make sure the backend is running.</p>
      </div>
    )
  }

  const { tickets, products, knowledge, customers, agent_runs, sessions, products_delivered, revenue } = data

  const urgentCount = tickets.by_priority['URGENT'] ?? 0
  const outOfStock = products.by_status['out_of_stock'] ?? 0
  const cost = agent_runs.today.estimated_cost_usd
  const costStr = cost < 0.01 ? '<$0.01' : `$${cost.toFixed(3)}`
  const avgLatency = agent_runs.today.avg_latency_ms
  const latencyStr =
    avgLatency >= 1000
      ? `${(avgLatency / 1000).toFixed(1)}s avg`
      : `${avgLatency}ms avg`

  const ticketStatusData = Object.entries(tickets.by_status).map(([status, count]) => ({
    status: status.replace('_', ' '),
    rawStatus: status,
    count,
  }))

  const productPieData = Object.entries(products.by_status).map(([status, count]) => ({
    name: status,
    value: count,
  }))

  const priorityData = Object.entries(tickets.by_priority).map(([p, c]) => ({
    priority: p,
    count: c,
  }))

  // Which basic stat cards are visible?
  const showBasicStatRow =
    show('stat.products') ||
    show('stat.customers') ||
    show('stat.open_tickets') ||
    show('stat.products_delivered')

  // Which advanced stat cards are visible?
  const showAdvancedStatRow =
    show('stat.active_sessions') ||
    show('stat.agent_runs_today') ||
    show('stat.published_articles')

  return (
    <div className="space-y-4">

      {/* ── Basic stat cards ─────────────────────────────────────────────── */}
      {showBasicStatRow && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {show('stat.products') && (
            <StatCard
              label="Active Products"
              value={products.total_active}
              sub={outOfStock ? `${outOfStock} out of stock` : `${products.total} total`}
              icon={Package}
              iconBg="bg-green-50"
              iconColor="text-green-600"
              accent={outOfStock > 0 ? 'amber' : undefined}
            />
          )}
          {show('stat.customers') && (
            <StatCard
              label="Customers"
              value={customers.total}
              sub={`+${customers.new_last_7d} this week`}
              icon={Users}
              iconBg="bg-cyan-50"
              iconColor="text-cyan-600"
            />
          )}
          {show('stat.open_tickets') && (
            <StatCard
              label="Open Tickets"
              value={tickets.total_open}
              sub={urgentCount ? `${urgentCount} urgent` : 'No urgent issues'}
              icon={TicketCheck}
              iconBg="bg-amber-50"
              iconColor="text-amber-600"
              accent={urgentCount > 0 ? 'red' : undefined}
            />
          )}
          {show('stat.products_delivered') && (
            <StatCard
              label="Products Delivered"
              value={products_delivered}
              icon={Truck}
              iconBg="bg-indigo-50"
              iconColor="text-indigo-600"
            />
          )}
        </div>
      )}

      {/* ── Revenue chart ─────────────────────────────────────────────────── */}
      {show('chart.revenue') && <RevenueChart revenue={revenue} />}

      {/* ── Customize control ─────────────────────────────────────────────── */}
      {canCustomize && (
        customizing ? (
          <CustomizePanel
            allowedKeys={allowedSet}
            selected={config?.widgets ?? []}
            saving={saving}
            onClose={() => setCustomizing(false)}
            onSave={(widgets) => saveConfig(widgets, { onSuccess: () => setCustomizing(false) })}
          />
        ) : (
          <button
            onClick={() => setCustomizing(true)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50"
          >
            <Settings2 className="h-4 w-4" />
            Customize Dashboard
          </button>
        )
      )}

      {/* ── Advanced stat cards ───────────────────────────────────────────── */}
      {showAdvancedStatRow && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {show('stat.active_sessions') && (
            <StatCard
              label="Active Sessions"
              value={sessions.active}
              sub={`${sessions.total} total`}
              icon={MessageSquare}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
            />
          )}
          {show('stat.agent_runs_today') && (
            <StatCard
              label="Agent Runs Today"
              value={agent_runs.today.count}
              sub={`${costStr} est. cost`}
              icon={Bot}
              iconBg="bg-violet-50"
              iconColor="text-violet-600"
            />
          )}
          {show('stat.published_articles') && (
            <StatCard
              label="Published Articles"
              value={knowledge.total_published}
              sub={`${knowledge.by_status['draft'] ?? 0} drafts`}
              icon={BookOpen}
              iconBg="bg-indigo-50"
              iconColor="text-indigo-600"
            />
          )}
        </div>
      )}

      {/* ── Chart widgets ─────────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {show('chart.agent_runs_7d') && (
          <ChartCard title="Agent Runs — Last 7 Days">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={agent_runs.by_day} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="runsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_BLUE} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={CHART_BLUE} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<AgentTooltip />} />
                <Area
                  type="monotone"
                  dataKey="runs"
                  name="runs"
                  stroke={CHART_BLUE}
                  strokeWidth={2}
                  fill="url(#runsGrad)"
                  dot={{ r: 3, fill: CHART_BLUE, strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {show('chart.ticket_status') && (
          <ChartCard title="Support Tickets by Status">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={ticketStatusData} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="status"
                  tick={{ fontSize: 10, fill: '#6b7280' }}
                  tickLine={false}
                  axisLine={false}
                  width={96}
                />
                <Tooltip content={<SimpleTooltip />} cursor={{ fill: '#f9fafb' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={18}>
                  {ticketStatusData.map((entry, i) => (
                    <Cell key={i} fill={TICKET_STATUS_COLORS[entry.rawStatus] ?? '#6b7280'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {show('chart.product_catalog') && (
          <ChartCard title="Product Catalog Breakdown">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={productPieData}
                  cx="50%"
                  cy="44%"
                  innerRadius={50}
                  outerRadius={78}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {productPieData.map((entry, i) => (
                    <Cell key={i} fill={PRODUCT_STATUS_COLORS[entry.name] ?? '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip content={<SimpleTooltip />} />
                <Legend
                  iconSize={8}
                  formatter={(v) => (
                    <span className="text-xs capitalize text-gray-600">
                      {String(v).replace('_', ' ')}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {show('chart.token_usage') && (
          <ChartCard title={`Token Usage — Last 7 Days  ·  ${latencyStr} latency today`}>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={agent_runs.by_day} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="tokGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_VIOLET} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={CHART_VIOLET} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
                />
                <Tooltip content={<AgentTooltip />} />
                <Area
                  type="monotone"
                  dataKey="tokens"
                  name="tokens"
                  stroke={CHART_VIOLET}
                  strokeWidth={2}
                  fill="url(#tokGrad)"
                  dot={{ r: 3, fill: CHART_VIOLET, strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {show('chart.ticket_priority') && (
          <ChartCard title="Open Ticket Priority Distribution">
            {priorityData.length === 0 ? (
              <div className="flex h-44 items-center justify-center text-sm text-gray-400">
                No open tickets — all clear!
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={priorityData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="priority" tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip content={<SimpleTooltip />} cursor={{ fill: '#f9fafb' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={44}>
                    {priorityData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={
                          entry.priority === 'URGENT'
                            ? '#ef4444'
                            : entry.priority === 'HIGH'
                              ? '#f97316'
                              : entry.priority === 'MEDIUM'
                                ? '#3b82f6'
                                : '#6b7280'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        )}
      </div>
    </div>
  )
}
