// Mirrors app/entitlements/flags.py DASHBOARD_WIDGET_CATALOG — keep in sync.
// Keys are stable identifiers persisted in a business's saved widget selection;
// never rename one without a migration to rewrite existing rows.
import { Flag } from '@/types/entitlements'
import type { FlagKey } from '@/types/entitlements'

export const WIDGET_CATALOG: { key: string; label: string }[] = [
  // Basics — formerly always-on, now plan-controlled like everything else
  { key: 'stat.products',           label: 'Active Products' },
  { key: 'stat.customers',          label: 'Customers' },
  { key: 'stat.open_tickets',       label: 'Open Tickets' },
  { key: 'stat.products_delivered', label: 'Products Delivered' },
  { key: 'chart.revenue',           label: 'Revenue' },
  // Advanced
  { key: 'stat.active_sessions',    label: 'Active Sessions' },
  { key: 'stat.agent_runs_today',   label: 'Agent Runs Today' },
  { key: 'stat.published_articles', label: 'Published Articles' },
  { key: 'chart.agent_runs_7d',     label: 'Agent Runs (7-day)' },
  { key: 'chart.ticket_status',     label: 'Ticket Status' },
  { key: 'chart.product_catalog',   label: 'Product Catalog Breakdown' },
  { key: 'chart.token_usage',       label: 'Token Usage (7-day)' },
  { key: 'chart.ticket_priority',   label: 'Open Ticket Priority' },
]

// Widget key → feature flag that must be enabled for the widget to appear.
// Mirrors WIDGET_DEPENDENCIES in flags.py — keep in sync.
export const WIDGET_DEPENDENCIES: Partial<Record<string, FlagKey>> = {
  'stat.open_tickets':       Flag.SUPPORT_TICKETS,
  'stat.agent_runs_today':   Flag.UI_AGENT_RUNS,
  'chart.agent_runs_7d':     Flag.UI_AGENT_RUNS,
  'chart.token_usage':       Flag.UI_AGENT_RUNS,
  'chart.ticket_status':     Flag.SUPPORT_TICKETS,
  'chart.ticket_priority':   Flag.SUPPORT_TICKETS,
}
