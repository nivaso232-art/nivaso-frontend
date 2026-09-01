export type OrderStatus =
  | 'DRAFT'
  | 'PENDING_CONFIRMATION'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_FAILED'
  | 'PAID'
  | 'FULFILLED'
  | 'CANCELLED'
  | 'REFUNDED'

export interface OrderItem {
  id: string
  product_name: string
  product_sku: string | null
  unit_price: string
  quantity: number
  total: string
}

export interface Order {
  id: string
  reference: string
  status: OrderStatus
  currency: string
  subtotal: string
  discount: string
  total: string
  customer_id: string
  conversation_id: string | null
  items: OrderItem[]
  created_at: string
}

export interface ListOrdersParams {
  status?: OrderStatus
  limit?: number
  offset?: number
}
