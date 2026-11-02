import {
  CalendarDays,
  CheckCheck,
  CircleCheck,
  FolderKanban,
  LayoutDashboard,
  UsersRound,
  X,
} from 'lucide-react'
import { NavLink } from 'react-router-dom'

const navigationItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/', available: true },
  { label: 'Projects', icon: FolderKanban, available: false },
  { label: 'My tasks', icon: CircleCheck, available: false },
  { label: 'Calendar', icon: CalendarDays, available: false },
  { label: 'Team', icon: UsersRound, available: false },
]

function Sidebar({ isMobileOpen, onClose }) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white px-4 py-5 md:sticky md:top-0 md:h-screen md:translate-x-0 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm shadow-brand-600/20">
            <CheckCheck size={21} strokeWidth={2.4} />
          </div>
          <div>
            <p className="text-[15px] font-bold tracking-tight text-slate-900">Taskspace</p>
            <p className="text-xs text-slate-500">Project workspace</p>
          </div>
        </div>
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
        >
          <X size={19} />
        </button>
      </div>

      <div className="mt-9 rounded-xl border border-slate-200 bg-slate-50/80 p-3">
        <p className="px-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Workspace
        </p>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-amber-100 text-xs font-bold text-amber-800">
            ST
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-800">Student team</p>
            <p className="truncate text-xs text-slate-500">Personal workspace</p>
          </div>
        </div>
      </div>

      <nav aria-label="Main navigation" className="mt-8 flex-1">
        <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Menu
        </p>
        <div className="space-y-1">
          {navigationItems.map(({ label, icon: Icon, path, available }) =>
            available ? (
              <NavLink
                key={label}
                to={path}
                onClick={onClose}
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon size={18} strokeWidth={1.9} />
                {label}
              </NavLink>
            ) : (
              <div
                key={label}
                aria-disabled="true"
                title="Available in a later step"
                className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400"
              >
                <Icon size={18} strokeWidth={1.8} />
                <span className="flex-1">{label}</span>
                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-400">
                  Soon
                </span>
              </div>
            ),
          )}
        </div>
      </nav>

      <div className="rounded-xl bg-brand-50 p-4">
        <div className="flex size-8 items-center justify-center rounded-lg bg-white text-brand-600 shadow-sm">
          <CircleCheck size={17} />
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-800">A calmer way to plan</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Keep your projects and next steps together in one workspace.
        </p>
      </div>
    </aside>
  )
}

export default Sidebar
