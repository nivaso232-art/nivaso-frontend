import { NavLink } from 'react-router-dom'
import {
  Building2,
  Package,
  TicketCheck,
  Users,
  BookOpen,
  MessageSquare,
  MessageCircle,
  LayoutDashboard,
  ShoppingCart,
  Webhook,
  Activity,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { cn } from '@/utils/cn'

type NavItem = { to: string; label: string; icon: LucideIcon; end?: boolean }

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
      { to: '/orders', label: 'Orders', icon: ShoppingCart },
      { to: '/support', label: 'Support Tickets', icon: TicketCheck },
      { to: '/knowledge', label: 'Knowledge Base', icon: BookOpen },
    ],
  },
  {
    label: 'AI & Events',
    items: [
      { to: '/chat', label: 'Chat Tester', icon: MessageSquare },
      { to: '/chat/demo', label: 'Chat Demo', icon: MessageCircle },
      { to: '/agent-runs', label: 'Agent Runs', icon: Activity },
      { to: '/webhooks', label: 'Webhook Events', icon: Webhook },
    ],
  },
]

export function Sidebar() {
  return (
    <aside className="flex h-screen w-56 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center border-b border-gray-200 px-4">
        <span className="text-xl font-bold text-blue-600">Nivaso</span>
        <span className="ml-2 text-sm text-gray-500">Admin</span>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                {group.label}
              </p>
            )}
            <ul className="space-y-0.5">
              {group.items.map(({ to, label, icon: Icon, end }) => (
                <li key={to}>
                  <NavLink
                    to={to}
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
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
