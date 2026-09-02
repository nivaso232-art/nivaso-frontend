import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/businesses': 'Businesses',
  '/products': 'Products',
  '/support': 'Support Tickets',
  '/customers': 'Customers',
  '/knowledge': 'Knowledge Base',
  '/orders': 'Orders',
  '/webhooks': 'Webhook Events',
  '/agent-runs': 'Agent Runs',
  '/chat': 'Chat Tester',
}

export function Layout() {
  const { pathname } = useLocation()
  const base = '/' + pathname.split('/')[1]
  const title = pageTitles[base] ?? 'Nivaso Admin'

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header title={title} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
