import apiClient from './client'
import type { Entitlements } from '@/types/entitlements'
import type { FeatureRequest, FeatureRequestIn } from '@/types/featureRequest'

export const entitlementsApi = {
  get: (slug: string) =>
    apiClient.get<Entitlements>(`/admin/businesses/${slug}/entitlements`).then((r) => r.data),

  submitRequest: (slug: string, body: FeatureRequestIn) =>
    apiClient.post<FeatureRequest>(`/admin/businesses/${slug}/feature-requests`, body).then((r) => r.data),

  listRequests: (slug: string) =>
    apiClient.get<FeatureRequest[]>(`/admin/businesses/${slug}/feature-requests`).then((r) => r.data),
}
