import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from '@/components/layout/Layout'
import { Dashboard } from '@/pages/Dashboard'
import { BusinessList } from '@/pages/businesses/BusinessList'
import { BusinessDetail } from '@/pages/businesses/BusinessDetail'
import { ProductList } from '@/pages/products/ProductList'
import { ProductDetail } from '@/pages/products/ProductDetail'
import { TicketList } from '@/pages/support/TicketList'
import { TicketDetail } from '@/pages/support/TicketDetail'
import { CustomerList } from '@/pages/customers/CustomerList'
import { CustomerDetail } from '@/pages/customers/CustomerDetail'
import { ArticleList } from '@/pages/knowledge/ArticleList'
import { ArticleDetail } from '@/pages/knowledge/ArticleDetail'
import { ChatTest } from '@/pages/chat/ChatTest'
import { TenantDashboard } from '@/pages/dashboard/TenantDashboard'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Tenant-facing dashboard — standalone (its own dark console chrome),
              resolved per subdomain e.g. gamer.nivaso.ai/dashboard. */}
          <Route path="/dashboard" element={<TenantDashboard />} />

          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />

            <Route path="businesses" element={<BusinessList />} />
            <Route path="businesses/:slug" element={<BusinessDetail />} />

            <Route path="products" element={<ProductList />} />
            <Route path="products/:productId" element={<ProductDetail />} />

            <Route path="support" element={<TicketList />} />
            <Route path="support/:reference" element={<TicketDetail />} />

            <Route path="customers" element={<CustomerList />} />
            <Route path="customers/:customerId" element={<CustomerDetail />} />

            <Route path="knowledge" element={<ArticleList />} />
            <Route path="knowledge/:articleId" element={<ArticleDetail />} />

            <Route path="chat" element={<ChatTest />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
