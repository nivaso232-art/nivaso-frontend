import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useProduct } from '@/hooks/useProducts'
import { useAppStore } from '@/store/appStore'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { PRODUCT_STATUS_COLORS } from '@/utils/constants'
import { formatCurrency } from '@/utils/formatters'

export function ProductDetail() {
  const { productId } = useParams<{ productId: string }>()
  const { selectedBusinessSlug } = useAppStore()
  const { data: product, isLoading } = useProduct(selectedBusinessSlug, productId ?? '')

  if (isLoading) return <Spinner />
  if (!product) return <p className="text-gray-500">Product not found.</p>

  return (
    <div className="max-w-2xl">
      <Link to="/products" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{product.name}</h2>
            {product.sku && <p className="font-mono text-sm text-gray-500">SKU: {product.sku}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Badge colorClass={PRODUCT_STATUS_COLORS[product.status]}>{product.status}</Badge>
          </div>
        </div>

        {product.description && (
          <p className="mb-4 text-sm text-gray-600">{product.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-500">Price</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(product.price, product.currency)}</p>
          </div>
          <div>
            <p className="font-medium text-gray-500">Category</p>
            <p className="text-gray-900">{product.category ?? '—'}</p>
          </div>
        </div>

        {Object.keys(product.attributes).length > 0 && (
          <div className="mt-4">
            <p className="mb-1 text-sm font-medium text-gray-500">Attributes</p>
            <pre className="rounded-lg bg-gray-50 p-3 text-xs text-gray-700">
              {JSON.stringify(product.attributes, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
