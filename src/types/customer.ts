export interface Customer {
  id: string
  name: string | null
  phone: string | null
  email: string | null
}

export interface ListCustomersParams {
  limit?: number
  offset?: number
}
