import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { LoaderCircle } from 'lucide-react'
import useAuth from '../context/useAuth.js'

function RouteLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f8fc]">
      <div role="status" className="flex items-center gap-2 text-sm font-medium text-slate-600">
        <LoaderCircle size={18} className="animate-spin text-brand-600" />
        Checking your session…
      </div>
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
