import { Building2, Package, TicketCheck, Users, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'

const cards = [
  { to: '/businesses', label: 'Businesses', icon: Building2, description: 'Manage tenants and their settings' },
  { to: '/products', label: 'Products', icon: Package, description: 'Add and manage product catalog' },
  { to: '/support', label: 'Support Tickets', icon: TicketCheck, description: 'View and resolve open tickets' },
  { to: '/customers', label: 'Customers', icon: Users, description: 'Browse customer records' },
  { to: '/knowledge', label: 'Knowledge Base', icon: BookOpen, description: 'Manage AI help articles' },
]

export function Dashboard() {
  return (
    <div>
      <p className="mb-6 text-sm text-gray-500">
        Welcome to Nivaso Admin — manage your AI-powered sales &amp; support platform.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ to, label, icon: Icon, description }) => (
          <Link
            key={to}
            to={to}
            className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="rounded-lg bg-blue-50 p-2.5">
              <Icon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{label}</p>
              <p className="mt-0.5 text-sm text-gray-500">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
