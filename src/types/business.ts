export type BusinessStatus = 'active' | 'suspended' | 'inactive'

export interface Business {
  id: string
  slug: string
  name: string
  description: string | null
  timezone: string
  status: BusinessStatus
  settings: Record<string, unknown>
}

export interface CreateBusinessPayload {
  slug: string
  name: string
  description?: string
  timezone?: string
  settings?: Record<string, unknown>
}

export interface UpdateBusinessPayload {
  name?: string
  description?: string
  timezone?: string
  status?: BusinessStatus
  settings?: Record<string, unknown>
}
