/**
 * Resolve which tenant (business account) this dashboard is showing.
 *
 * In production the dashboard is served per-tenant on a subdomain, e.g.
 * `gamer.nivaso.ai/dashboard` → account `gamer`. The subdomain label *is* the
 * business slug, so one build scales to every customer with no per-tenant code.
 *
 * Resolution order (first match wins):
 *   1. `?account=` / `?slug=` query override  — handy for local testing
 *   2. the leftmost DNS label on a real host   — `gamer.nivaso.ai` → `gamer`
 *   3. `VITE_DEFAULT_BUSINESS_SLUG`             — local dev / apex fallback
 */

// Labels that are the app itself, never a tenant.
const RESERVED = new Set([
  'www',
  'app',
  'admin',
  'dashboard',
  'api',
  'staging',
  'localhost',
  'nivaso',
])

export function resolveTenantSlug(): string {
  if (typeof window === 'undefined') {
    return import.meta.env.VITE_DEFAULT_BUSINESS_SLUG || 'default'
  }

  const params = new URLSearchParams(window.location.search)
  const override = params.get('account') || params.get('slug')
  if (override) return override

  const host = window.location.hostname
  // Ignore raw IPs and single-label hosts (localhost).
  const isIp = /^[\d.]+$/.test(host)
  if (!isIp) {
    const [label, ...rest] = host.split('.')
    // Only treat it as a tenant subdomain when there's a real domain behind it
    // (label.domain.tld) and the label isn't one of the app's own hostnames.
    if (rest.length >= 2 && label && !RESERVED.has(label)) {
      return label
    }
  }

  return import.meta.env.VITE_DEFAULT_BUSINESS_SLUG || 'default'
}
