import apiClient from './client'
import type { Business, CreateBusinessPayload, UpdateBusinessPayload } from '@/types/business'

export const businessesApi = {
  list: () =>
    apiClient.get<Business[]>('/admin/businesses').then((r) => r.data),

  get: (slug: string) =>
    apiClient.get<Business>(`/admin/businesses/${slug}`).then((r) => r.data),

  create: (payload: CreateBusinessPayload) =>
    apiClient.post<Business>('/admin/businesses', payload).then((r) => r.data),

  update: (slug: string, payload: UpdateBusinessPayload) =>
    apiClient.patch<Business>(`/admin/businesses/${slug}`, payload).then((r) => r.data),
}
