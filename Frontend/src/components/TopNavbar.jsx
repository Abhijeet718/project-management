import { LoaderCircle, LogOut, Menu } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../context/useAuth.js'

const today = new Intl.DateTimeFormat('en', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
}).format(new Date())

function TopNavbar({ onMenuClick }) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState('')

  async function handleLogout() {
    setIsLoggingOut(true)
    setLogoutError('')
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (error) {
      setLogoutError(error.response?.data?.message || 'Could not sign out. Please try again.')
    } finally {
      setIsLoggingOut(false)
    }
  }

  const pageName = pathname === '/'
    ? 'DASHBOARD'
    : pathname === '/projects'
      ? 'PROJECTS'
      : pathname.includes('/tasks')
        ? 'PROJECT TASKS'
        : 'PROJECT DETAILS'

  return (
    <header className="sticky top-0 z-20 flex min-h-[76px] flex-wrap items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur sm:px-7 lg:px-10">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Open navigation"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
        >
          <Menu size={20} />
        </button>
        <div className="hidden items-center gap-2 text-xs font-medium text-slate-400 sm:flex">
          <span>TASKSPACE</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-600">{pageName}</span>
        </div>
        <div className="sm:hidden">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Today</p>
          <p className="text-sm font-semibold text-slate-800">{today}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <span className="hidden text-sm font-medium text-slate-500 sm:inline">{today}</span>
        <button
          type="button"
          aria-label="Sign out"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="inline-flex h-9 items-center gap-2 rounded-lg px-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:cursor-wait disabled:opacity-60"
        >
          {isLoggingOut ? <LoaderCircle size={16} className="animate-spin" /> : <LogOut size={16} />}
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
      {logoutError && <p role="alert" className="w-full pb-2 text-right text-xs text-rose-600">{logoutError}</p>}
    </header>
  )
}

export default TopNavbar
