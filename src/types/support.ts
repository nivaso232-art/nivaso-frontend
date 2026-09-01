export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_CUSTOMER' | 'RESOLVED' | 'CLOSED'

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export type TicketReason =
  | 'PRODUCT_ACCESS_PROBLEM'
  | 'PAYMENT_PROBLEM'
  | 'REFUND_REQUEST'
  | 'DELIVERY_DELAY'
  | 'AI_COULD_NOT_RESOLVE'
  | 'CUSTOMER_REQUESTED_HUMAN'
  | 'OTHER'

export interface SupportTicket {
  id: string
  reference: string
  status: TicketStatus
  priority: TicketPriority
  reason: TicketReason
  summary: string
  assigned_to: string | null
  customer_id: string
}

export interface UpdateTicketPayload {
  assigned_to?: string
  status?: TicketStatus
  resolution?: string
}

export interface ListTicketsParams {
  priority?: TicketPriority
  limit?: number
}
