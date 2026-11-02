import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuth from '../context/useAuth.js'

function RouteLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f8fc]">
      <p role="status" className="text-sm font-medium text-slate-600">Checking your session…</p>
    </div>
  )
}

export function ProtectedRoute() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <RouteLoading />
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}

export function PublicOnlyRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) return <RouteLoading />
  if (user) return <Navigate to="/" replace />
  return <Outlet />
}
