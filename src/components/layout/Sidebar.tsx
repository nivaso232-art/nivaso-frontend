import { NavLink } from 'react-router-dom'
import {
  Building2,
  Package,
  TicketCheck,
  Users,
  BookOpen,
  MessageSquare,
  LayoutDashboard,
  Gauge,
} from 'lucide-react'
import { cn } from '@/utils/cn'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/businesses', label: 'Businesses', icon: Building2 },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/support', label: 'Support Tickets', icon: TicketCheck },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/knowledge', label: 'Knowledge Base', icon: BookOpen },
  { to: '/chat', label: 'Chat Tester', icon: MessageSquare },
  { to: '/dashboard', label: 'Live Dashboard', icon: Gauge },
]

export function Sidebar() {
  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <span className="text-xl font-bold text-blue-600">Nivaso</span>
        <span className="ml-2 text-sm text-gray-500">Admin</span>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                  )
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}
