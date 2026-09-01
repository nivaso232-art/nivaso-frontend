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
} from 'lucide-react'
import { fetchMetrics } from '@/api/metrics'
import { useAppStore } from '@/store/appStore'
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

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-gray-700">{title}</h2>
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

// ── Dashboard ─────────────────────────────────────────────────────────────────

export function Dashboard() {
  const slug = useAppStore((s) => s.selectedBusinessSlug)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['metrics', slug],
    queryFn: () => fetchMetrics(slug),
    enabled: !!slug,
    refetchInterval: 60_000,
  })

  // No business selected
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

  // Loading
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <SkeletonChart height={240} />
          <SkeletonChart height={240} />
          <SkeletonChart height={240} />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <SkeletonChart height={200} />
          <SkeletonChart height={200} />
        </div>
      </div>
    )
  }

  // Error
  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50 py-12 text-center">
        <AlertTriangle className="mb-2 h-8 w-8 text-red-400" />
        <p className="text-sm font-medium text-red-700">Failed to load metrics</p>
        <p className="mt-1 text-xs text-red-500">Make sure the backend is running.</p>
      </div>
    )
  }

  const { tickets, products, knowledge, customers, agent_runs, sessions } = data

  const urgentCount = tickets.by_priority['URGENT'] ?? 0
  const outOfStock = products.by_status['out_of_stock'] ?? 0
  const cost = agent_runs.today.estimated_cost_usd
  const costStr = cost < 0.01 ? '<$0.01' : `$${cost.toFixed(3)}`
  const avgLatency = agent_runs.today.avg_latency_ms
  const latencyStr =
    avgLatency >= 1000
      ? `${(avgLatency / 1000).toFixed(1)}s avg`
      : `${avgLatency}ms avg`

  // Chart data prep
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

  return (
    <div className="space-y-4">

      {/* ── Stat Cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Open Tickets"
          value={tickets.total_open}
          sub={urgentCount ? `${urgentCount} urgent` : 'No urgent issues'}
          icon={TicketCheck}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          accent={urgentCount > 0 ? 'red' : undefined}
        />
        <StatCard
          label="Active Sessions"
          value={sessions.active}
          sub={`${sessions.total} total`}
          icon={MessageSquare}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          label="Active Products"
          value={products.total_active}
          sub={
            outOfStock
              ? `${outOfStock} out of stock`
              : `${products.total} total`
          }
          icon={Package}
          iconBg="bg-green-50"
          iconColor="text-green-600"
          accent={outOfStock > 0 ? 'amber' : undefined}
        />
        <StatCard
          label="Agent Runs Today"
          value={agent_runs.today.count}
          sub={`${costStr} est. cost`}
          icon={Bot}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
        />
        <StatCard
          label="Customers"
          value={customers.total}
          sub={`+${customers.new_last_7d} this week`}
          icon={Users}
          iconBg="bg-cyan-50"
          iconColor="text-cyan-600"
        />
        <StatCard
          label="Published Articles"
          value={knowledge.total_published}
          sub={`${knowledge.by_status['draft'] ?? 0} drafts`}
          icon={BookOpen}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
        />
      </div>

      {/* ── Top Charts Row ─────────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">

        {/* Agent runs — area chart */}
        <ChartCard title="Agent Runs — Last 7 Days">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={agent_runs.by_day}
              margin={{ top: 4, right: 4, left: -22, bottom: 0 }}
            >
              <defs>
                <linearGradient id="runsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_BLUE} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={CHART_BLUE} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
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

        {/* Ticket status — horizontal bar */}
        <ChartCard title="Support Tickets by Status">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={ticketStatusData}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 4, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
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
                  <Cell
                    key={i}
                    fill={TICKET_STATUS_COLORS[entry.rawStatus] ?? '#6b7280'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Product status — donut */}
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
                  <Cell
                    key={i}
                    fill={PRODUCT_STATUS_COLORS[entry.name] ?? '#6b7280'}
                  />
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
      </div>

      {/* ── Bottom Charts Row ──────────────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">

        {/* Token usage — area chart */}
        <ChartCard title={`Token Usage — Last 7 Days  ·  ${latencyStr} latency today`}>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart
              data={agent_runs.by_day}
              margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="tokGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_VIOLET} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={CHART_VIOLET} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) =>
                  v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                }
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

        {/* Open ticket priority — vertical bar */}
        <ChartCard title="Open Ticket Priority Distribution">
          {priorityData.length === 0 ? (
            <div className="flex h-44 items-center justify-center text-sm text-gray-400">
              No open tickets — all clear!
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={priorityData}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="priority"
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9ca3af' }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
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
      </div>
    </div>
  )
}
