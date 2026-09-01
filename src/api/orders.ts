import apiClient from './client'
import type { Order, ListOrdersParams } from '@/types/order'

export const ordersApi = {
  list: (slug: string, params?: ListOrdersParams) =>
    apiClient.get<Order[]>(`/admin/${slug}/orders`, { params }).then((r) => r.data),
}
