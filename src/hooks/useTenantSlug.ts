import { useAuthStore } from '@/store/authStore'
import { useAppStore } from '@/store/appStore'

/**
 * The tenant slug to scope business data to.
 *
 * For an authenticated business-admin session, this is ALWAYS the
 * business_slug claim from the JWT — never client-editable state — so a
 * logged-in admin can't be redirected to another tenant's data by tampering
 * with localStorage. Only falls back to the (dev/CI, no-login) app-store
 * selection when there's no authenticated admin session.
 */
export function useTenantSlug(): string {
  const token = useAuthStore((s) => s.token)
  const role = useAuthStore((s) => s.role)
  const authSlug = useAuthStore((s) => s.businessSlug)
  const appSlug = useAppStore((s) => s.selectedBusinessSlug)

  if (token && role === 'admin' && authSlug) return authSlug
  return appSlug
}
