import apiClient from './client'
import type { SupportTicket, UpdateTicketPayload, ListTicketsParams } from '@/types/support'

export const supportApi = {
  list: (slug: string, params?: ListTicketsParams) =>
    apiClient.get<SupportTicket[]>(`/admin/${slug}/support`, { params }).then((r) => r.data),

  get: (slug: string, reference: string) =>
    apiClient.get<SupportTicket>(`/admin/${slug}/support/${reference}`).then((r) => r.data),

  update: (slug: string, reference: string, payload: UpdateTicketPayload) =>
    apiClient
      .patch<SupportTicket>(`/admin/${slug}/support/${reference}`, payload)
      .then((r) => r.data),
}
