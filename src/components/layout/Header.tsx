import { ShieldCheck, LogOut } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { businessesApi } from '@/api/businesses'
import { useBusinesses, useBusiness } from '@/hooks/useBusinesses'
import { useAppStore } from '@/store/appStore'
import { useAuthStore } from '@/store/authStore'

interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  const navigate = useNavigate()
  const { token, role, businessSlug: authSlug, username, clearAuth } = useAuthStore()
  const isAuthedAdmin = !!token && role === 'admin'

  // Authenticated business admins are always locked to their own tenant —
  // never fetch or show the cross-tenant picker for them.
  const { data: businesses } = useBusinesses(!isAuthedAdmin)
  const { data: ownBusiness } = useBusiness(isAuthedAdmin ? authSlug ?? '' : '')
  const { selectedBusinessSlug, setSelectedBusinessSlug } = useAppStore()

  const handleLogout = () => {
    clearAuth()
    navigate('/login', { replace: true })
  }

  const isLocked = isAuthedAdmin || businessesApi.isLocked()
  const canAccessSuperAdmin = role === 'super_admin' || !!import.meta.env.VITE_SUPER_ADMIN_KEY

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      <div className="flex items-center gap-3">
        {/* Super Admin link: hidden when locked to a single business */}
        {canAccessSuperAdmin && !isLocked && (
          <Link
            to="/super-admin/businesses"
            className="flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 hover:bg-violet-100 transition-colors"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Super Admin
          </Link>
        )}

        {/* Business selector: show multi-picker only when NOT locked */}
        {isAuthedAdmin ? (
          /* Authenticated business admin: own business name, non-interactive */
          ownBusiness && (
            <span className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700">
              {ownBusiness.name}
            </span>
          )
        ) : (
          businesses && businesses.length > 0 && (
            <div className="flex items-center gap-2">
              {isLocked ? (
                /* Locked: display business name as non-interactive label */
                <span className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700">
                  {businesses[0]?.name}
                </span>
              ) : (
                <>
                  <span className="text-sm text-gray-500">Business:</span>
                  <select
                    value={selectedBusinessSlug}
                    onChange={(e) => setSelectedBusinessSlug(e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    {businesses.map((b) => (
                      <option key={b.slug} value={b.slug}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>
          )
        )}

        {token && (
          <button
            onClick={handleLogout}
            title={`Logged in as ${username ?? 'user'} — click to sign out`}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-500 hover:border-red-300 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        )}
      </div>
    </header>
  )
}
