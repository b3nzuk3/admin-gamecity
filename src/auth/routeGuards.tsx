import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './authContext'

function AuthLoadingScreen() {
  return <main className="admin-auth-loading" aria-live="polite"><div className="admin-auth-loading-mark"><img src="/gamecity.png" alt="" /></div><p>Checking your admin session…</p></main>
}

export function AdminRoute() {
  const auth = useAuth()
  const location = useLocation()

  if (auth.isLoading) return <AuthLoadingScreen />
  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname, reason: auth.status === 'forbidden' ? 'admin-required' : undefined }} />
  }

  return <Outlet />
}

export function PublicOnlyRoute() {
  const auth = useAuth()
  if (auth.isLoading) return <AuthLoadingScreen />
  if (auth.isAuthenticated) return <Navigate to="/" replace />
  return <Outlet />
}
