import { useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { isTokenExpired } from '@/utils/auth'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token)
  const role = useAuthStore((s) => s.role)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const navigate = useNavigate()

  const hasDevKey = !!import.meta.env.VITE_INTERNAL_API_KEY

  // Detect mid-session expiry: token exists but is past its exp claim.
  // The 401 interceptor also handles this for in-flight requests; this guard
  // catches it at the route level before any request fires.
  useEffect(() => {
    if (token && isTokenExpired(token)) {
      clearAuth()
      navigate('/login?expired=1', { replace: true })
    }
  }, [token, clearAuth, navigate])

  if (!token && !hasDevKey) {
    return <Navigate to="/login" replace />
  }

  if (token && role === 'super_admin') {
    // Already authenticated, just for the other portal — send them there
    // instead of bouncing to a login form they don't need.
    return <Navigate to="/super-admin/businesses" replace />
  }

  if (token && role !== 'admin') {
    return <Navigate to="/login" replace />
  }

  if (token && isTokenExpired(token)) {
    // Render nothing while the useEffect above kicks in
    return null
  }

  return <>{children}</>
}
