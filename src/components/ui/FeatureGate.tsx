import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Lock } from 'lucide-react'
import { useState } from 'react'
import { entitlementsApi } from '@/api/entitlements'
import { useTenantSlug } from '@/hooks/useTenantSlug'
import { useEntitlementStore } from '@/store/entitlementStore'
import { flagEnabled, type FlagKey } from '@/types/entitlements'
import { cn } from '@/utils/cn'

interface FeatureGateProps {
  flag: FlagKey
  /** Human-readable name shown in the "Request Access" prompt */
  label: string
  children: React.ReactNode
  /** When locked, render nothing instead of the upgrade prompt */
  silent?: boolean
}

/**
 * Wraps UI that requires a feature flag. When the flag is disabled for the
 * current business the children are replaced with an upgrade prompt; the
 * business owner can submit an access request directly from that prompt.
 */
export function FeatureGate({ flag, label, children, silent = false }: FeatureGateProps) {
  const entitlements = useEntitlementStore((s) => s.entitlements)
  const isLoaded = useEntitlementStore((s) => s.isLoaded)
  const slug = useTenantSlug()

  const can = !isLoaded ? false : entitlements === null ? true : flagEnabled(entitlements, flag)
  const qc = useQueryClient()

  const [reason, setReason] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const { mutate: request, isPending } = useMutation({
    mutationFn: () => entitlementsApi.submitRequest(slug, { feature: flag, reason: reason || undefined }),
    onSuccess: () => {
      setSubmitted(true)
      qc.invalidateQueries({ queryKey: ['feature-requests', slug] })
    },
  })

  if (can) return <>{children}</>
  if (silent) return null

  return (
    <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-gray-200 p-2">
          <Lock className="h-4 w-4 text-gray-500" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-700">{label}</p>
          <p className="mt-0.5 text-xs text-gray-500">
            This feature is not included in your current plan.
          </p>

          {submitted ? (
            <p className="mt-3 text-xs font-medium text-green-600">
              Request submitted — you'll be notified once reviewed.
            </p>
          ) : (
            <div className="mt-3 space-y-2">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why do you need this? (optional)"
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none resize-none"
              />
              <button
                onClick={() => request()}
                disabled={isPending}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50',
                )}
              >
                {isPending ? 'Submitting…' : 'Request Access'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
