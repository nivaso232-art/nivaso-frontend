import { Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCustomers } from '@/hooks/useCustomers'
import { useAppStore } from '@/store/appStore'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'

export function CustomerList() {
  const { selectedBusinessSlug } = useAppStore()
  const { data: customers, isLoading } = useCustomers(selectedBusinessSlug)

  if (isLoading) return <Spinner />

  return (
    <div>
      <div className="mb-4">
        <p className="text-sm text-gray-500">{customers?.length ?? 0} customers</p>
      </div>

      {customers?.length === 0 ? (
        <EmptyState icon={Users} title="No customers yet" description="Customers appear here once they message your business." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Email</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers?.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <Link to={`/customers/${c.id}`} className="font-medium text-blue-600 hover:underline">
                      {c.name ?? 'Unknown'}
                    </Link>
                  </td>
                  <td className="px-5 py-3 font-mono text-gray-600">{c.phone ?? '—'}</td>
                  <td className="px-5 py-3 text-gray-600">{c.email ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
