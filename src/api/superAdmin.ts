import axios from 'axios'
import type { SuperAdminBusiness, FeatureRequest } from '@/types/featureRequest'
import { useAuthStore } from '@/store/authStore'

// Super-admin calls use a separate key header and bypass the regular apiClient.
const superAdminClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: { 'Content-Type': 'application/json' },
})

superAdminClient.interceptors.request.use((config) => {
  const { token, role } = useAuthStore.getState()
  if (token && role === 'super_admin') {
    config.headers['Authorization'] = `Bearer ${token}`
  } else {
    const key = import.meta.env.VITE_SUPER_ADMIN_KEY
    if (key) config.headers['X-Super-Admin-Key'] = key
  }
  return config
})

// ── Response: on 401, clear auth and redirect to super-admin login ───────────
superAdminClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const { token, clearAuth } = useAuthStore.getState()
      if (token) {
        clearAuth()
        window.location.replace('/super-admin/login?expired=1')
      }
    }
    return Promise.reject(error)
  },
)

export const superAdminApi = {
  // Businesses + entitlements
  listBusinesses: () =>
    superAdminClient.get<SuperAdminBusiness[]>('/super-admin/businesses').then((r) => r.data),

  getBusiness: (slug: string) =>
    superAdminClient.get<SuperAdminBusiness>(`/super-admin/businesses/${slug}`).then((r) => r.data),

  createBusiness: (payload: { slug: string; name: string; timezone?: string; plan?: string; description?: string }) =>
    superAdminClient.post<SuperAdminBusiness>('/super-admin/businesses', payload).then((r) => r.data),

  setPlan: (slug: string, plan: string) =>
    superAdminClient.patch<SuperAdminBusiness>(`/super-admin/businesses/${slug}/plan`, { plan }).then((r) => r.data),

  setOverrides: (slug: string, overrides: Record<string, unknown>) =>
    superAdminClient.patch<SuperAdminBusiness>(`/super-admin/businesses/${slug}/overrides`, { overrides }).then((r) => r.data),

  getPlanDefaults: () =>
    superAdminClient.get<Record<string, Record<string, unknown>>>('/super-admin/businesses/plans/defaults').then((r) => r.data),

  setStatus: (slug: string, status: string) =>
    superAdminClient.patch<SuperAdminBusiness>(`/super-admin/businesses/${slug}/status`, { status }).then((r) => r.data),

  // Feature requests
  listRequests: (status?: string) =>
    superAdminClient.get<FeatureRequest[]>('/super-admin/feature-requests', { params: status ? { status } : {} }).then((r) => r.data),

  reviewRequest: (id: string, payload: { status: 'approved' | 'denied'; notes?: string }) =>
    superAdminClient.patch<FeatureRequest>(`/super-admin/feature-requests/${id}`, payload).then((r) => r.data),

  // Audit log
  listAuditLog: (limit = 100) =>
    superAdminClient.get<{ id: string; business_id: string; business_slug: string; action: string; details: Record<string, unknown>; performed_by: string; created_at: string }[]>(
      '/super-admin/audit-log', { params: { limit } }
    ).then((r) => r.data),

  // Super-admin AI chat (stateless — client manages history)
  chat: (payload: {
    message: string
    history: { role: string; content: string }[]
    model?: string
  }) =>
    superAdminClient
      .post<{ reply: string; tools_used: string[] }>('/super-admin/chat', payload)
      .then((r) => r.data),

  // Plan definitions
  getPlanHints: () =>
    superAdminClient
      .get<Record<string, {
        type: 'boolean' | 'number' | 'array'
        description: string
        min?: number
        max?: number
        suggestions?: { value: string; label: string; provider?: string }[]
      }>>('/super-admin/plans/hints')
      .then((r) => r.data),

  updatePlanDefinition: (planName: string, flags: Record<string, unknown>) =>
    superAdminClient
      .patch<{ plan_name: string; flags: Record<string, unknown>; updated_by: string | null; updated_at: string }>(
        `/super-admin/plans/${planName}`,
        { flags },
      )
      .then((r) => r.data),
}
