import { useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { isTokenExpired } from '@/utils/auth'

export function RequireSuperAdmin({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token)
  const role = useAuthStore((s) => s.role)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const navigate = useNavigate()

  const hasDevKey = !!import.meta.env.VITE_SUPER_ADMIN_KEY

  useEffect(() => {
    if (token && isTokenExpired(token)) {
      clearAuth()
      navigate('/super-admin/login?expired=1', { replace: true })
    }
  }, [token, clearAuth, navigate])

  if (!token && !hasDevKey) {
    return <Navigate to="/super-admin/login" replace />
  }

  if (token && role === 'admin') {
    // Already authenticated, just for the other portal — send them there
    // instead of bouncing to a login form they don't need.
    return <Navigate to="/" replace />
  }

  if (token && role !== 'super_admin') {
    return <Navigate to="/super-admin/login" replace />
  }

  if (token && isTokenExpired(token)) {
    return null
  }

  return <>{children}</>
}
