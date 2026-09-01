export type ProductStatus = 'active' | 'inactive' | 'out_of_stock' | 'archived'

export interface Product {
  id: string
  sku: string | null
  name: string
  description: string | null
  price: string
  currency: string
  status: ProductStatus
  category: string | null
  attributes: Record<string, unknown>
}

export interface CreateProductPayload {
  name: string
  price: string
  currency?: string
  description?: string
  sku?: string
  category?: string
  status?: ProductStatus
  attributes?: Record<string, unknown>
}

export interface UpdateProductPayload {
  name?: string
  price?: string
  description?: string
  sku?: string
  category?: string
  status?: ProductStatus
  attributes?: Record<string, unknown>
}

export interface ListProductsParams {
  category?: string
  limit?: number
  offset?: number
  status?: ProductStatus
}
