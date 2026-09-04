import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { entitlementsApi } from '@/api/entitlements'
import { useTenantSlug } from '@/hooks/useTenantSlug'
import { useEntitlementStore } from '@/store/entitlementStore'

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
  '/chat': 'Agent Chat',
}

export function Layout() {
  const { pathname } = useLocation()
  const base = '/' + pathname.split('/')[1]
  const title = pageTitles[base] ?? 'Admin Portal'

  const slug = useTenantSlug()
  const setEntitlements = useEntitlementStore((s) => s.setEntitlements)
  const setLoaded = useEntitlementStore((s) => s.setLoaded)

  const { data, status } = useQuery({
    queryKey: ['entitlements', slug],
    queryFn: () => entitlementsApi.get(slug),
    enabled: !!slug,
    staleTime: 15_000,
    retry: 1,
  })

  useEffect(() => {
    if (!slug) {
      setEntitlements(null)
      setLoaded(true)
      return
    }
    if (status === 'pending') {
      setLoaded(false)
      return
    }
    if (status === 'success') {
      setEntitlements(data)
    } else {
      setEntitlements(null)  // fail-open on error
    }
    setLoaded(true)
  }, [slug, status, data, setEntitlements, setLoaded])

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
