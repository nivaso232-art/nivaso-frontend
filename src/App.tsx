import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from '@/components/layout/Layout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { SuperAdminLoginPage } from '@/pages/auth/SuperAdminLoginPage'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { RequireSuperAdmin } from '@/components/auth/RequireSuperAdmin'
import { Dashboard } from '@/pages/Dashboard'
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
import { ChatDemo } from '@/pages/chat/ChatDemo'
import { CustomerChat } from '@/pages/chat/CustomerChat'
import { SuperAdminLayout } from '@/pages/super-admin/SuperAdminLayout'
import { SuperAdminBusinessList } from '@/pages/super-admin/SuperAdminBusinessList'
import { SuperAdminBusinessDetail } from '@/pages/super-admin/SuperAdminBusinessDetail'
import { SuperAdminFeatureRequests } from '@/pages/super-admin/SuperAdminFeatureRequests'
import { SuperAdminPlanDefaults } from '@/pages/super-admin/SuperAdminPlanDefaults'
import { SuperAdminAuditLog } from '@/pages/super-admin/SuperAdminAuditLog'
import { SuperAdminPlaybook } from '@/pages/super-admin/SuperAdminPlaybook'
import { SuperAdminChat } from '@/pages/super-admin/SuperAdminChat'

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
          <Route path="login" element={<LoginPage />} />
          <Route path="super-admin/login" element={<SuperAdminLoginPage />} />

          {/* Customer-facing chat — one URL per business slug, no admin layout */}
          <Route path="/chat/:slug" element={<CustomerChat />} />

          <Route element={<RequireAuth><Layout /></RequireAuth>}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />

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

          {/* Super-admin — dark themed, separate layout, own key */}
          <Route path="super-admin" element={<RequireSuperAdmin><SuperAdminLayout /></RequireSuperAdmin>}>
            <Route index element={<Navigate to="businesses" replace />} />
            <Route path="businesses"            element={<SuperAdminBusinessList />} />
            <Route path="businesses/:slug"      element={<SuperAdminBusinessDetail />} />
            <Route path="requests"              element={<SuperAdminFeatureRequests />} />
            <Route path="plans"                 element={<SuperAdminPlanDefaults />} />
            <Route path="audit"                 element={<SuperAdminAuditLog />} />
            <Route path="playbook"              element={<SuperAdminPlaybook />} />
            <Route path="chat"                  element={<SuperAdminChat />} />
          </Route>

          {/* Unknown paths fall back to the dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
