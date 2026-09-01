import { Building2, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useBusinesses } from '@/hooks/useBusinesses'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { BUSINESS_STATUS_COLORS } from '@/utils/constants'

export function BusinessList() {
  const { data: businesses, isLoading } = useBusinesses()

  if (isLoading) return <Spinner />

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">{businesses?.length ?? 0} businesses</p>
        <Link to="/businesses/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            New Business
          </Button>
        </Link>
      </div>

      {businesses?.length === 0 ? (
        <EmptyState icon={Building2} title="No businesses yet" description="Create your first business to get started." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Slug</th>
                <th className="px-5 py-3">Timezone</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {businesses?.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <Link to={`/businesses/${b.slug}`} className="font-medium text-blue-600 hover:underline">
                      {b.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 font-mono text-gray-600">{b.slug}</td>
                  <td className="px-5 py-3 text-gray-600">{b.timezone}</td>
                  <td className="px-5 py-3">
                    <Badge colorClass={BUSINESS_STATUS_COLORS[b.status]}>{b.status}</Badge>
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
