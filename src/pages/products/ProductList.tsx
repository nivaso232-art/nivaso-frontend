import { useState, useMemo, useCallback } from 'react'
import { Package, Plus, Search, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useProducts, useCreateProduct } from '@/hooks/useProducts'
import { useTenantSlug } from '@/hooks/useTenantSlug'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { PRODUCT_STATUS_COLORS } from '@/utils/constants'
import { formatCurrency } from '@/utils/formatters'
import { cn } from '@/utils/cn'
import type { ProductStatus, CreateProductPayload } from '@/types/product'
import { useEntitlementStore } from '@/store/entitlementStore'
import { flagLimit, Flag } from '@/types/entitlements'

const STATUS_TABS: { value: ProductStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'out_of_stock', label: 'Out of Stock' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'archived', label: 'Archived' },
]

const CURRENCY_OPTIONS = [
  { value: 'INR', label: 'INR ₹' },
  { value: 'USD', label: 'USD $' },
]

const STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'out_of_stock', label: 'Out of Stock' },
]

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i} className="px-5 py-3">
          <div className="h-4 rounded bg-gray-200" />
        </td>
      ))}
    </tr>
  )
}

export function ProductList() {
  const slug = useTenantSlug()
  const { data: products, isLoading } = useProducts(slug)
  const { mutate: create, isPending: creating } = useCreateProduct(slug)

  const entitlements = useEntitlementStore((s) => s.entitlements)
  const productLimit = flagLimit(entitlements, Flag.PRODUCTS_LIMIT)
  const atLimit = productLimit !== null && (products?.length ?? 0) >= productLimit

  const [search, setSearch] = useState('')
  const [statusTab, setStatusTab] = useState<ProductStatus | 'all'>('all')
  const [catFilter, setCatFilter] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  // Create form state
  const [form, setForm] = useState<CreateProductPayload>({
    name: '',
    price: '',
    currency: 'INR',
    sku: '',
    category: '',
    description: '',
    status: 'active',
  })
  const [formError, setFormError] = useState('')

  // Derived categories from product list
  const categories = useMemo(() => {
    const cats = new Set<string>()
    products?.forEach((p) => { if (p.category) cats.add(p.category) })
    return Array.from(cats).sort()
  }, [products])

  // Client-side filtering
  const filtered = useMemo(() => {
    let list = products ?? []
    if (statusTab !== 'all') list = list.filter((p) => p.status === statusTab)
    if (catFilter) list = list.filter((p) => p.category === catFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.sku ?? '').toLowerCase().includes(q) ||
          (p.description ?? '').toLowerCase().includes(q),
      )
    }
    return list
  }, [products, statusTab, catFilter, search])

  const handleCreate = useCallback(() => {
    if (!form.name.trim()) { setFormError('Name is required'); return }
    if (!form.price || isNaN(parseFloat(form.price))) { setFormError('Valid price is required'); return }
    setFormError('')
    const payload: CreateProductPayload = {
      name: form.name.trim(),
      price: form.price,
      currency: form.currency || 'INR',
      status: form.status || 'active',
    }
    if (form.sku?.trim()) payload.sku = form.sku.trim()
    if (form.category?.trim()) payload.category = form.category.trim()
    if (form.description?.trim()) payload.description = form.description.trim()
    create(payload, {
      onSuccess: () => {
        setShowCreate(false)
        setForm({ name: '', price: '', currency: 'INR', sku: '', category: '', description: '', status: 'active' })
      },
    })
  }, [form, create])

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {productLimit !== null && (
              <span className="text-xs text-gray-400">
                {products?.length ?? 0} / {productLimit}
              </span>
            )}
            <Button size="sm" onClick={() => setShowCreate(true)} disabled={atLimit}>
              <Plus className="h-4 w-4" />
              New Product
            </Button>
          </div>
        </div>

        {/* Status tabs */}
        <div className="flex items-center gap-1 border-b border-gray-200">
          {STATUS_TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setStatusTab(t.value)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium transition-colors',
                statusTab === t.value
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700',
              )}
            >
              {t.label}
            </button>
          ))}

          {/* Category pills */}
          {categories.length > 0 && (
            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={() => setCatFilter('')}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                  !catFilter ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                )}
              >
                All categories
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCatFilter(c === catFilter ? '' : c)}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                    catFilter === c
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 && !isLoading ? (
        <EmptyState
          icon={Package}
          title={search ? 'No results' : 'No products'}
          description={search ? `No products match "${search}"` : 'Add products to your catalog.'}
          action={
            !search && !atLimit ? (
              <Button size="sm" onClick={() => setShowCreate(true)}>
                <Plus className="h-4 w-4" /> New Product
              </Button>
            ) : undefined
          }
        />
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
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                : filtered.map((p) => (
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

      {/* Create modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New Product">
        <div className="space-y-3">
          <Input
            label="Name *"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Grand Theft Auto V - PC"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Price *"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              placeholder="229.00"
              type="number"
              min="0"
              step="0.01"
            />
            <Select
              label="Currency"
              value={form.currency ?? 'INR'}
              onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
              options={CURRENCY_OPTIONS}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="SKU"
              value={form.sku ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
              placeholder="GAME-GTA5-PC-001"
            />
            <Input
              label="Category"
              value={form.category ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              placeholder="Game"
            />
          </div>
          <Textarea
            label="Description"
            value={form.description ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Brief product description…"
            rows={2}
          />
          <Select
            label="Status"
            value={form.status ?? 'active'}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ProductStatus }))}
            options={STATUS_OPTIONS}
          />
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={creating}>Create Product</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
