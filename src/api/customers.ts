import apiClient from './client'
import type { Customer, CustomerChannel, ListCustomersParams } from '@/types/customer'

export const customersApi = {
  list: (slug: string, params?: ListCustomersParams) =>
    apiClient.get<Customer[]>(`/admin/${slug}/customers`, { params }).then((r) => r.data),

  get: (slug: string, customerId: string) =>
    apiClient.get<Customer>(`/admin/${slug}/customers/${customerId}`).then((r) => r.data),

  channels: (slug: string, customerId: string) =>
    apiClient
      .get<CustomerChannel[]>(`/admin/${slug}/customers/${customerId}/channels`)
      .then((r) => r.data),
}
