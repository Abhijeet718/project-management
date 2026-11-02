import { useQuery } from '@tanstack/react-query'
import { ArrowRight, FolderKanban, LoaderCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getProjects } from '../services/projectService.js'

function formatDate(dateValue) {
  if (!dateValue) return 'Date unavailable'
  const date = new Date(dateValue)
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

function DashboardPage() {
  const projectsQuery = useQuery({ queryKey: ['projects'], queryFn: getProjects })
  const projects = projectsQuery.data || []
  const recentProjects = [...projects]
    .sort((first, second) => new Date(second.project.createdAt) - new Date(first.project.createdAt))
    .slice(0, 3)

  return (
    <div className="space-y-7 sm:space-y-8">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-600">Workspace overview</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-[34px]">Your work, in one place.</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            A quick look at your projects and where they were created.
          </p>
        </div>
        <Link
          to="/projects"
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          View projects <ArrowRight size={16} />
        </Link>
      </section>

      <section aria-label="Project summary" className="max-w-sm rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.02]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-500">Projects you can access</p>
            {projectsQuery.isPending ? (
              <LoaderCircle size={23} className="mt-3 animate-spin text-brand-600" aria-label="Loading project count" />
            ) : projectsQuery.isError ? (
              <p className="mt-2 text-sm font-semibold text-rose-600">Unavailable</p>
            ) : (
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{projects.length}</p>
            )}
          </div>
          <div className="flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <FolderKanban size={19} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.02] sm:p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent projects</h2>
            <p className="mt-1 text-sm text-slate-500">Your three newest projects.</p>
          </div>
          <Link to="/projects" className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-600">
            All projects <ArrowRight size={15} />
          </Link>
        </div>

        {projectsQuery.isPending ? (
          <div role="status" className="flex min-h-40 items-center justify-center gap-2 text-sm text-slate-500">
            <LoaderCircle size={17} className="animate-spin" /> Loading projects…
          </div>
        ) : projectsQuery.isError ? (
          <p role="alert" className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {projectsQuery.error.response?.data?.message || 'Could not load your projects. Try opening the Projects page again.'}
          </p>
        ) : recentProjects.length === 0 ? (
          <div className="mt-5 rounded-xl bg-slate-50 px-5 py-8 text-center">
            <p className="text-sm font-semibold text-slate-800">No projects yet</p>
            <p className="mt-1 text-sm text-slate-500">Create a project to see it here.</p>
            <Link to="/projects" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-600">
              Go to Projects <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <ul className="mt-5 divide-y divide-slate-100">
            {recentProjects.map(({ project }) => (
              <li key={project._id}>
                <Link
                  to={`/projects/${project._id}`}
                  className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-800">{project.name}</span>
                    <span className="mt-1 block line-clamp-1 text-xs text-slate-500">
                      {project.description || 'No description added.'}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs font-medium text-slate-400">Created {formatDate(project.createdAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default DashboardPage
