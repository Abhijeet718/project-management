import { CheckCheck } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'

function AuthLayout() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc] px-4 py-10 sm:px-6">
      <div className="w-full max-w-[440px]">
        <Link to="/login" className="mx-auto mb-8 flex w-fit items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm shadow-brand-600/20">
            <CheckCheck size={22} strokeWidth={2.4} />
          </span>
          <span>
            <span className="block text-base font-bold tracking-tight text-slate-900">Taskspace</span>
            <span className="block text-xs text-slate-500">Project workspace</span>
          </span>
        </Link>
        <Outlet />
        <p className="mt-6 text-center text-xs text-slate-400">
          A clear space for your projects and next steps.
        </p>
      </div>
    </main>
  )
}

export default AuthLayout
