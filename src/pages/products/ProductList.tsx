import { Package, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useProducts } from '@/hooks/useProducts'
import { useAppStore } from '@/store/appStore'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { PRODUCT_STATUS_COLORS } from '@/utils/constants'
import { formatCurrency } from '@/utils/formatters'

export function ProductList() {
  const { selectedBusinessSlug } = useAppStore()
  const { data: products, isLoading } = useProducts(selectedBusinessSlug)

  if (isLoading) return <Spinner />

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">{products?.length ?? 0} products</p>
        <Link to="/products/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            New Product
          </Button>
        </Link>
      </div>

      {products?.length === 0 ? (
        <EmptyState icon={Package} title="No products" description="Add products to your catalog." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">SKU</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products?.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <Link to={`/products/${p.id}`} className="font-medium text-blue-600 hover:underline">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 font-mono text-gray-500">{p.sku ?? '—'}</td>
                  <td className="px-5 py-3 text-gray-600">{p.category ?? '—'}</td>
                  <td className="px-5 py-3 font-medium text-gray-900">
                    {formatCurrency(p.price, p.currency)}
                  </td>
                  <td className="px-5 py-3">
                    <Badge colorClass={PRODUCT_STATUS_COLORS[p.status]}>{p.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
