export type RequestStatus = 'pending' | 'approved' | 'denied'

export interface FeatureRequest {
  id: string
  business_id: string
  business_slug: string
  feature: string
  reason: string | null
  status: RequestStatus
  reviewed_by: string | null
  notes: string | null
  created_at: string
}

export interface FeatureRequestIn {
  feature: string
  reason?: string
}

export interface SuperAdminBusiness {
  business_id: string
  business_name: string
  business_slug: string
  plan: string
  overrides: Record<string, unknown>
  resolved: Record<string, unknown>
  granted_by: string | null
}
