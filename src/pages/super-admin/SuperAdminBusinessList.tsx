import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ChevronRight, Plus, X, ShieldCheck } from 'lucide-react'
import { superAdminApi } from '@/api/superAdmin'
import { cn } from '@/utils/cn'

const PLANS = ['free', 'starter', 'pro', 'enterprise']

const PLAN_COLORS: Record<string, string> = {
  free:       'bg-gray-700 text-gray-300',
  starter:    'bg-blue-900 text-blue-300',
  pro:        'bg-violet-900 text-violet-300',
  enterprise: 'bg-amber-900 text-amber-300',
}

const STATUS_COLORS: Record<string, string> = {
  active:    'bg-green-900 text-green-300',
  suspended: 'bg-red-900 text-red-300',
  inactive:  'bg-gray-700 text-gray-400',
}

function CreateModal({ onClose, onCreated }: { onClose: () => void; onCreated: (creds: { username: string; password: string }) => void }) {
  const qc = useQueryClient()
  const [slug, setSlug] = useState('')
  const [name, setName] = useState('')
  const [timezone, setTimezone] = useState('Asia/Kolkata')
  const [plan, setPlan] = useState('free')
  const [error, setError] = useState('')

  const { mutate: create, isPending } = useMutation({
    mutationFn: () => superAdminApi.createBusiness({ slug, name, timezone, plan }),
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ['super-admin-businesses'] })
      onClose()
      onCreated({ username: data.admin_username, password: data.admin_password })
    },
    onError: (e: any) => setError(e?.response?.data?.error?.message ?? 'Failed to create business'),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="w-full max-w-md rounded-2xl border border-gray-700 bg-gray-900 p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">New Business</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300"><X className="h-4 w-4" /></button>
        </div>

        <div className="space-y-3">
          {[
            { label: 'Slug (unique ID)', value: slug, set: setSlug, placeholder: 'dental-clinic-mumbai' },
            { label: 'Name', value: name, set: setName, placeholder: 'Bright Smile Dental' },
            { label: 'Timezone', value: timezone, set: setTimezone, placeholder: 'Asia/Kolkata' },
          ].map(({ label, value, set, placeholder }) => (
            <div key={label}>
              <label className="mb-1 block text-xs font-medium text-gray-400">{label}</label>
              <input
                value={value}
                onChange={(e) => set(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:border-violet-500 focus:outline-none"
              />
            </div>
          ))}

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-400">Initial Plan</label>
            <div className="flex gap-2">
              {PLANS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPlan(p)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-medium capitalize border transition-colors',
                    plan === p ? 'border-violet-500 bg-violet-900 text-violet-200' : 'border-gray-700 bg-gray-800 text-gray-400',
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            onClick={() => create()}
            disabled={!slug || !name || isPending}
            className="w-full rounded-lg bg-violet-700 py-2 text-sm font-medium text-white hover:bg-violet-600 disabled:opacity-50"
          >
            {isPending ? 'Creating…' : 'Create Business'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function SuperAdminBusinessList() {
  const [showCreate, setShowCreate] = useState(false)
  const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(null)
  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ['super-admin-businesses'],
    queryFn: superAdminApi.listBusinesses,
  })

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-xl bg-gray-800 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div>
      {showCreate && (
        <CreateModal
          onClose={() => setShowCreate(false)}
          onCreated={(creds) => setCredentials(creds)}
        />
      )}

      {credentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-md rounded-2xl border border-gray-700 bg-gray-900 p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-400" />
              <h2 className="text-sm font-semibold text-white">Business Created — Save Credentials</h2>
            </div>
            <p className="mb-4 text-xs text-gray-400">
              Share these credentials with the business owner. The password is shown <strong className="text-gray-300">once only</strong> and cannot be recovered.
            </p>
            <div className="space-y-3 rounded-lg border border-gray-700 bg-gray-800 p-4">
              <div>
                <p className="text-xs font-medium text-gray-500">Username</p>
                <p className="mt-0.5 font-mono text-sm text-gray-200">{credentials.username}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Password (one-time)</p>
                <p className="mt-0.5 font-mono text-sm font-bold text-green-400">{credentials.password}</p>
              </div>
            </div>
            <button
              onClick={() => setCredentials(null)}
              className="mt-4 w-full rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition-colors"
            >
              I've saved these credentials
            </button>
          </div>
        </div>
      )}

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Businesses</h1>
          <p className="text-sm text-gray-400">Manage plan tiers and feature entitlements for every client.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 rounded-lg bg-violet-700 px-3 py-2 text-sm font-medium text-white hover:bg-violet-600"
        >
          <Plus className="h-4 w-4" /> New Business
        </button>
      </div>

      <div className="space-y-2">
        {businesses.map((biz) => (
          <Link
            key={biz.business_id}
            to={`/super-admin/businesses/${biz.business_slug}`}
            className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900 px-5 py-4 hover:border-gray-700 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">{biz.business_name}</p>
              <p className="text-xs text-gray-500 font-mono">{biz.business_slug}</p>
            </div>

            <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', STATUS_COLORS[biz.business_status] ?? STATUS_COLORS.inactive)}>
              {biz.business_status}
            </span>

            <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', PLAN_COLORS[biz.plan] ?? PLAN_COLORS.free)}>
              {biz.plan}
            </span>

            {Object.keys(biz.overrides).length > 0 && (
              <span className="text-xs text-amber-500">{Object.keys(biz.overrides).length} override{Object.keys(biz.overrides).length > 1 ? 's' : ''}</span>
            )}

            <ChevronRight className="h-4 w-4 text-gray-600 shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  )
}
