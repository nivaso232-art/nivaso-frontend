import { useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAppStore } from '@/store/appStore'
import { ordersApi } from '@/api/orders'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import type { OrderStatus } from '@/types/order'

const STATUS_COLORS: Record<OrderStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  PENDING_CONFIRMATION: 'bg-yellow-100 text-yellow-700',
  PAYMENT_PENDING: 'bg-amber-100 text-amber-700',
  PAYMENT_FAILED: 'bg-red-100 text-red-700',
  PAID: 'bg-blue-100 text-blue-700',
  FULFILLED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
  REFUNDED: 'bg-purple-100 text-purple-700',
}

const STATUS_TABS: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'PAYMENT_PENDING', label: 'Pending Payment' },
  { value: 'PAID', label: 'Paid' },
  { value: 'FULFILLED', label: 'Fulfilled' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-5 py-3"><div className="h-4 rounded bg-gray-200" /></td>
      ))}
    </tr>
  )
}

export function OrderList() {
  const { selectedBusinessSlug: slug } = useAppStore()
  const [tab, setTab] = useState<OrderStatus | 'all'>('all')

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', slug, tab],
    queryFn: () => ordersApi.list(slug, tab === 'all' ? { limit: 100 } : { status: tab, limit: 100 }),
    enabled: !!slug,
  })

  return (
    <div>
      {/* Tabs */}
      <div className="mb-4 flex items-center gap-1 border-b border-gray-200">
        {STATUS_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              'px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap',
              tab === t.value ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {orders?.length === 0 && !isLoading ? (
        <EmptyState icon={ShoppingCart} title="No orders" description="Orders will appear here as customers purchase." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-3">Reference</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Items</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Discount</th>
                <th className="px-5 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                : orders?.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-mono font-medium text-gray-900">{o.reference}</td>
                      <td className="px-5 py-3">
                        <Badge colorClass={STATUS_COLORS[o.status]}>{o.status.replace('_', ' ')}</Badge>
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        {o.items.map((i) => `${i.product_name} ×${i.quantity}`).join(', ')}
                      </td>
                      <td className="px-5 py-3 font-medium text-gray-900">
                        {formatCurrency(o.total, o.currency)}
                      </td>
                      <td className="px-5 py-3 text-gray-600">
                        {parseFloat(o.discount) > 0 ? formatCurrency(o.discount, o.currency) : '—'}
                      </td>
                      <td className="px-5 py-3 text-gray-500">{formatDate(o.created_at)}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
