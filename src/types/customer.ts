export interface Customer {
  id: string
  name: string | null
  phone: string | null
  email: string | null
}

export interface CustomerChannel {
  id: string
  channel: 'whatsapp' | 'telegram' | 'web'
  external_user_id: string
  display_name: string | null
}

export interface ListCustomersParams {
  limit?: number
  offset?: number
}
