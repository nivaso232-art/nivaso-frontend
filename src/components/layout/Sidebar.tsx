import { NavLink } from 'react-router-dom'
import {
  Building2,
  Package,
  TicketCheck,
  Users,
  BookOpen,
  MessageSquare,
  LayoutDashboard,
  ShoppingCart,
  Webhook,
  Activity,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '@/utils/cn'
import { businessesApi } from '@/api/businesses'
import { useBusiness } from '@/hooks/useBusinesses'
import { useTenantSlug } from '@/hooks/useTenantSlug'
import { useAppStore } from '@/store/appStore'
import { useAuthStore } from '@/store/authStore'
import { useEntitlementStore } from '@/store/entitlementStore'
import { flagEnabled, Flag, type FlagKey } from '@/types/entitlements'

type NavItem = { to: string; label: string; icon: LucideIcon; end?: boolean; flag?: FlagKey }

const navGroups: { label: string | null; items: NavItem[] }[] = [
  {
    label: null as string | null,
    items: [{ to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'Catalog & CRM',
    items: [
      { to: '/businesses', label: 'Businesses', icon: Building2 },
      { to: '/products', label: 'Products', icon: Package },
      { to: '/customers', label: 'Customers', icon: Users },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/orders', label: 'Orders', icon: ShoppingCart, flag: Flag.ORDERS_ENABLED },
      { to: '/support', label: 'Support Tickets', icon: TicketCheck, flag: Flag.SUPPORT_TICKETS },
      { to: '/knowledge', label: 'Knowledge Base', icon: BookOpen },
    ],
  },
  {
    label: 'AI & Events',
    items: [
      { to: '/chat', label: 'Agent Chat', icon: MessageSquare },
      { to: '/agent-runs', label: 'Agent Runs', icon: Activity, flag: Flag.UI_AGENT_RUNS },
      { to: '/webhooks', label: 'Webhook Events', icon: Webhook, flag: Flag.UI_WEBHOOK_EVENTS },
    ],
  },
]

export function Sidebar() {
  const slug = useTenantSlug()
  const { data: business } = useBusiness(slug)

  const entitlements = useEntitlementStore((s) => s.entitlements)
  const isLoaded = useEntitlementStore((s) => s.isLoaded)
  const can = (flag: FlagKey): boolean => {
    if (!isLoaded) return false
    if (entitlements === null) return true
    return flagEnabled(entitlements, flag)
  }
  const selectedSlug = useAppStore((s) => s.selectedBusinessSlug)
  const { token, role, businessSlug: authSlug } = useAuthStore()
  const isAuthedAdmin = !!token && role === 'admin'
  const isLocked = isAuthedAdmin || businessesApi.isLocked()
  const lockedSlug = isAuthedAdmin ? authSlug : businessesApi.lockedSlug()

  // When locked to one business (either an authenticated business-admin
  // session, or a single-tenant build), the Businesses link goes directly
  // to that business's settings page — never the list of all tenants.
  const businessesHref =
    isLocked && (lockedSlug || selectedSlug)
      ? `/businesses/${lockedSlug || selectedSlug}`
      : '/businesses'

  return (
    <aside className="flex h-screen w-56 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center border-b border-gray-200 px-4 min-w-0">
        <span className="text-base font-bold text-blue-600 truncate" title={business?.name}>
          {business?.name ?? 'Admin Portal'}
        </span>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {navGroups.map((group, gi) => {
          const visible = group.items.filter((item) => !item.flag || can(item.flag))
          if (visible.length === 0) return null
          return (
            <div key={gi}>
              {group.label && (
                <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {group.label}
                </p>
              )}
              <ul className="space-y-0.5">
                {visible.map(({ to, label, icon: Icon, end }) => {
                  // Redirect Businesses link to the locked business detail when scoped
                  const resolvedTo = to === '/businesses' ? businessesHref : to
                  return (
                  <li key={to}>
                    <NavLink
                      to={resolvedTo}
                      end={end}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                        )
                      }
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {label}
                    </NavLink>
                  </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </nav>
      {entitlements && (
        <div className="border-t border-gray-200 px-4 py-3">
          <span className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize',
            entitlements.plan === 'enterprise' ? 'bg-violet-100 text-violet-700' :
            entitlements.plan === 'pro'        ? 'bg-blue-100 text-blue-700' :
            entitlements.plan === 'starter'    ? 'bg-green-100 text-green-700' :
                                                 'bg-gray-100 text-gray-600',
          )}>
            {entitlements.plan} plan
          </span>
        </div>
      )}
    </aside>
  )
}
