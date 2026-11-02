import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  FolderKanban,
  ListTodo,
  UsersRound,
} from 'lucide-react'

const summaryCards = [
  {
    label: 'Active projects',
    note: 'Your project list will appear here',
    icon: FolderKanban,
    iconStyle: 'bg-brand-50 text-brand-600',
  },
  {
    label: 'Open tasks',
    note: 'Keep an eye on your next steps',
    icon: ListTodo,
    iconStyle: 'bg-sky-50 text-sky-600',
  },
  {
    label: 'Completed this week',
    note: 'Your progress at a glance',
    icon: CheckCircle2,
    iconStyle: 'bg-emerald-50 text-emerald-600',
  },
  {
    label: 'Team members',
    note: 'People in your workspace',
    icon: UsersRound,
    iconStyle: 'bg-amber-50 text-amber-600',
  },
]

const date = new Intl.DateTimeFormat('en', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
}).format(new Date())

function DashboardPage() {
  return (
    <div className="space-y-7 sm:space-y-8">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-600">
            Workspace overview
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-[34px]">
            Your work, in one place.
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            A clear starting point for your projects, tasks, and team updates.
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-600 shadow-sm shadow-slate-900/[0.02]">
          <CalendarDays size={16} className="text-slate-400" />
          {date}
        </div>
      </section>

      <section aria-label="Workspace summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(({ label, note, icon: Icon, iconStyle }) => (
          <article
            key={label}
            className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.02]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="mt-3 text-3xl font-bold tracking-tight text-slate-800">—</p>
              </div>
              <div className={`flex size-10 items-center justify-center rounded-xl ${iconStyle}`}>
                <Icon size={19} strokeWidth={1.9} />
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-400">{note}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
        <article className="min-h-[320px] rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.02] sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent activity</h2>
              <p className="mt-1 text-sm text-slate-500">Updates from across your workspace</p>
            </div>
            <div className="flex size-9 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
              <Activity size={18} />
            </div>
          </div>

          <div className="flex min-h-[220px] flex-col items-center justify-center px-4 text-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <Activity size={22} />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-slate-800">Nothing to show just yet</h3>
            <p className="mt-1.5 max-w-sm text-sm leading-6 text-slate-500">
              Once you start working with projects and tasks, recent updates will show up here.
            </p>
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.02] sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Getting started</h2>
              <p className="mt-1 text-sm text-slate-500">A few simple steps for this workspace</p>
            </div>
            <ArrowUpRight size={18} className="text-slate-400" />
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex gap-3 rounded-xl bg-slate-50 p-3.5">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">1</span>
              <div>
                <p className="text-sm font-semibold text-slate-800">Explore the dashboard</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">This is your home for a quick workspace overview.</p>
              </div>
            </div>
            <div className="flex gap-3 rounded-xl bg-slate-50 p-3.5">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-500">2</span>
              <div>
                <p className="text-sm font-semibold text-slate-800">Connect project data</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">Project and task screens will be added next.</p>
              </div>
            </div>
            <div className="flex gap-3 rounded-xl bg-slate-50 p-3.5">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-500">3</span>
              <div>
                <p className="text-sm font-semibold text-slate-800">Bring in your team</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">Collaboration tools are not connected yet.</p>
              </div>
            </div>
          </div>
        </article>
      </section>
    </div>
  )
}

export default DashboardPage
