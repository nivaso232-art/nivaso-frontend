import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useCustomer } from '@/hooks/useCustomers'
import { useAppStore } from '@/store/appStore'
import { Spinner } from '@/components/ui/Spinner'

export function CustomerDetail() {
  const { customerId } = useParams<{ customerId: string }>()
  const { selectedBusinessSlug } = useAppStore()
  const { data: customer, isLoading } = useCustomer(selectedBusinessSlug, customerId ?? '')

  if (isLoading) return <Spinner />
  if (!customer) return <p className="text-gray-500">Customer not found.</p>

  return (
    <div className="max-w-lg">
      <Link to="/customers" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">{customer.name ?? 'Unknown Customer'}</h2>
        <div className="grid grid-cols-1 gap-3 text-sm">
          <div>
            <p className="font-medium text-gray-500">ID</p>
            <p className="truncate font-mono text-gray-900">{customer.id}</p>
          </div>
          <div>
            <p className="font-medium text-gray-500">Phone</p>
            <p className="text-gray-900">{customer.phone ?? '—'}</p>
          </div>
          <div>
            <p className="font-medium text-gray-500">Email</p>
            <p className="text-gray-900">{customer.email ?? '—'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
