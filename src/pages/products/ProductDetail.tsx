import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { useProduct, useUpdateProduct, useArchiveProduct } from '@/hooks/useProducts'
import { useAppStore } from '@/store/appStore'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Spinner } from '@/components/ui/Spinner'
import { Modal } from '@/components/ui/Modal'
import { PRODUCT_STATUS_COLORS } from '@/utils/constants'
import { formatCurrency } from '@/utils/formatters'
import type { ProductStatus, UpdateProductPayload } from '@/types/product'

const STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'out_of_stock', label: 'Out of Stock' },
]

export function ProductDetail() {
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const { selectedBusinessSlug: slug } = useAppStore()
  const { data: product, isLoading } = useProduct(slug, productId ?? '')
  const { mutate: update, isPending: saving } = useUpdateProduct(slug, productId ?? '')
  const { mutate: archive, isPending: archiving } = useArchiveProduct(slug)

  const [editing, setEditing] = useState(false)
  const [confirmArchive, setConfirmArchive] = useState(false)
  const [form, setForm] = useState<UpdateProductPayload>({})

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        price: product.price,
        sku: product.sku ?? '',
        category: product.category ?? '',
        description: product.description ?? '',
        status: product.status,
      })
    }
  }, [product])

  if (isLoading) return <Spinner />
  if (!product) return <p className="text-gray-500">Product not found.</p>

  const handleSave = () => {
    const payload: UpdateProductPayload = {}
    if (form.name !== product.name) payload.name = form.name
    if (form.price !== product.price) payload.price = form.price
    if ((form.sku || '') !== (product.sku || '')) payload.sku = form.sku
    if ((form.category || '') !== (product.category || '')) payload.category = form.category
    if ((form.description || '') !== (product.description || '')) payload.description = form.description
    if (form.status !== product.status) payload.status = form.status
    update(payload, { onSuccess: () => setEditing(false) })
  }

  const handleArchive = () => {
    archive(product.id, { onSuccess: () => navigate('/products') })
  }

  return (
    <div className="max-w-2xl space-y-4">
      <Link to="/products" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
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
            <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
              <Pencil className="h-4 w-4" /> Edit
            </Button>
            <Button size="sm" variant="danger" onClick={() => setConfirmArchive(true)}>
              <Trash2 className="h-4 w-4" />
            </Button>
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

      {/* Edit modal */}
      <Modal open={editing} onClose={() => setEditing(false)} title="Edit Product">
        <div className="space-y-3">
          <Input
            label="Name *"
            value={form.name ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Price"
              value={form.price ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              type="number" min="0" step="0.01"
            />
            <Input
              label="SKU"
              value={form.sku ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
            />
          </div>
          <Input
            label="Category"
            value={form.category ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          />
          <Textarea
            label="Description"
            value={form.description ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={2}
          />
          <Select
            label="Status"
            value={form.status ?? product.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ProductStatus }))}
            options={STATUS_OPTIONS}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>Save</Button>
          </div>
        </div>
      </Modal>

      {/* Archive confirmation */}
      <Modal open={confirmArchive} onClose={() => setConfirmArchive(false)} title="Archive Product">
        <p className="mb-4 text-sm text-gray-600">
          Archive <strong>{product.name}</strong>? It will no longer appear in searches.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmArchive(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleArchive} loading={archiving}>Archive</Button>
        </div>
      </Modal>
    </div>
  )
}
