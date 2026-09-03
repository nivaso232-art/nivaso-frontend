export type Plan = 'free' | 'starter' | 'pro' | 'enterprise'

export interface Entitlements {
  plan: Plan
  flags: Record<string, boolean | number | string[] | null>
}

// Typed accessors — keep in sync with app/entitlements/flags.py
export const Flag = {
  AI_MODELS:              'ai.models',
  AI_CUSTOM_MODEL_PICKER: 'ai.custom_model_picker',
  AI_MAX_ITERATIONS:      'ai.max_iterations',
  AI_TOOLS:               'ai.tools',
  CHANNEL_WEB:            'channel.web',
  CHANNEL_WHATSAPP:       'channel.whatsapp',
  CHANNEL_TELEGRAM:       'channel.telegram',
  CHANNEL_PAYMENTS:       'channel.payments',
  PRODUCTS_LIMIT:         'catalog.products_limit',
  KNOWLEDGE_LIMIT:        'knowledge.articles_limit',
  ORDERS_ENABLED:         'orders.enabled',
  SUPPORT_TICKETS:        'support.tickets_enabled',
  CREDENTIALS:            'credentials.enabled',
  UI_AGENT_RUNS:          'ui.agent_runs',
  UI_WEBHOOK_EVENTS:      'ui.webhook_events',
  UI_DASHBOARD_CUSTOMIZE: 'ui.dashboard_customize',
  UI_DASHBOARD_WIDGETS:   'ui.dashboard_widgets',
} as const

export type FlagKey = typeof Flag[keyof typeof Flag]

export function flagEnabled(ents: Entitlements | null, flag: FlagKey): boolean {
  // null = entitlements not yet loaded (or migration pending) — allow access
  if (ents === null) return true
  return Boolean(ents.flags[flag])
}

export function flagLimit(ents: Entitlements | null, flag: FlagKey): number | null {
  if (!ents) return null
  const v = ents.flags[flag]
  return typeof v === 'number' ? v : null
}

/** Array-type flag value, or null meaning "unrestricted / all allowed". */
export function flagArray(ents: Entitlements | null, flag: FlagKey): string[] | null {
  if (!ents) return null
  const v = ents.flags[flag]
  return Array.isArray(v) ? v : null
}
