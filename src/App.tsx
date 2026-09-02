import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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
import { OrderList } from '@/pages/orders/OrderList'
import { WebhookEventList } from '@/pages/webhooks/WebhookEventList'
import { AgentRunList } from '@/pages/agent-runs/AgentRunList'
import { ChatTest } from '@/pages/chat/ChatTest'
// WhatsApp-style admin demo (talks to the real agent), lives inside the admin layout
import { ChatDemo } from '@/pages/chat/ChatDemo'
// Customer-facing chat — standalone page, no admin chrome
import { CustomerChat } from '@/pages/chat/CustomerChat'

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
          {/* Customer-facing chat — one URL per business slug, no admin layout */}
          <Route path="/chat/:slug" element={<CustomerChat />} />

          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />

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

            <Route path="orders" element={<OrderList />} />
            <Route path="webhooks" element={<WebhookEventList />} />
            <Route path="agent-runs" element={<AgentRunList />} />

            <Route path="chat" element={<ChatTest />} />
            {/* Static /chat/demo outranks the dynamic /chat/:slug below */}
            <Route path="chat/demo" element={<ChatDemo />} />
          </Route>

          {/* Unknown paths fall back to the dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
