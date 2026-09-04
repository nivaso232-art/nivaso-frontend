import apiClient from './client'
import type { Business, UpdateBusinessPayload } from '@/types/business'

// When VITE_BUSINESS_SLUG is set the deployment is locked to a single client.
// list() returns only that business so the admin panel never exposes other
// tenants' data through the business selector or the businesses page.
const LOCKED_SLUG = import.meta.env.VITE_BUSINESS_SLUG as string | undefined

export const businessesApi = {
  list: async (): Promise<Business[]> => {
    if (LOCKED_SLUG) {
      const biz = await apiClient
        .get<Business>(`/admin/businesses/${LOCKED_SLUG}`)
        .then((r) => r.data)
      return [biz]
    }
    return apiClient.get<Business[]>('/admin/businesses').then((r) => r.data)
  },

  get: (slug: string) =>
    apiClient.get<Business>(`/admin/businesses/${slug}`).then((r) => r.data),

  update: (slug: string, payload: UpdateBusinessPayload) =>
    apiClient.patch<Business>(`/admin/businesses/${slug}`, payload).then((r) => r.data),

  /** True when this deployment is locked to a single business. */
  isLocked: () => Boolean(LOCKED_SLUG),
  lockedSlug: () => LOCKED_SLUG,
}
