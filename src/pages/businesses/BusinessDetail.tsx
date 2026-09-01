import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useBusiness } from '@/hooks/useBusinesses'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { BUSINESS_STATUS_COLORS } from '@/utils/constants'

export function BusinessDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { data: business, isLoading } = useBusiness(slug ?? '')

  if (isLoading) return <Spinner />
  if (!business) return <p className="text-gray-500">Business not found.</p>

  return (
    <div className="max-w-2xl">
      <Link to="/businesses" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{business.name}</h2>
            <p className="mt-0.5 font-mono text-sm text-gray-500">{business.slug}</p>
          </div>
          <Badge colorClass={BUSINESS_STATUS_COLORS[business.status]}>{business.status}</Badge>
        </div>

        {business.description && (
          <p className="mb-4 text-sm text-gray-600">{business.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-500">Timezone</p>
            <p className="text-gray-900">{business.timezone}</p>
          </div>
          <div>
            <p className="font-medium text-gray-500">ID</p>
            <p className="truncate font-mono text-gray-900">{business.id}</p>
          </div>
        </div>

        {Object.keys(business.settings).length > 0 && (
          <div className="mt-4">
            <p className="mb-1 text-sm font-medium text-gray-500">Settings</p>
            <pre className="rounded-lg bg-gray-50 p-3 text-xs text-gray-700">
              {JSON.stringify(business.settings, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
