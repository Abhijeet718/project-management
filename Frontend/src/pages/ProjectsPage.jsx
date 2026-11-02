import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FolderKanban, LoaderCircle, Plus, UsersRound } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import ProjectFormDialog from '../components/ProjectFormDialog.jsx'
import { createProject, getProjects } from '../services/projectService.js'

function getErrorMessage(error, fallback) {
  return error.response?.data?.message || fallback
}

function ProjectsPage() {
  const queryClient = useQueryClient()
  const location = useLocation()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const projectsQuery = useQuery({ queryKey: ['projects'], queryFn: getProjects })

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['projects'] })
      setIsCreateDialogOpen(false)
      setSuccessMessage('Project created successfully.')
    },
  })

  function openCreateDialog() {
    createMutation.reset()
    setSuccessMessage('')
    setIsCreateDialogOpen(true)
  }

  const projects = projectsQuery.data || []

  return (
    <div className="space-y-7">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-600">Workspace</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-[34px]">Projects</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
            Keep your work organized in focused project spaces.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateDialog}
          className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-600/20 hover:bg-brand-700"
        >
          <Plus size={17} /> New project
        </button>
      </section>

      {(successMessage || location.state?.message) && (
        <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMessage || location.state.message}
        </p>
      )}

      {projectsQuery.isPending ? (
        <div role="status" className="flex min-h-52 items-center justify-center gap-2 text-sm font-medium text-slate-500">
          <LoaderCircle size={18} className="animate-spin" /> Loading projects…
        </div>
      ) : projectsQuery.isError ? (
        <section className="rounded-2xl border border-rose-100 bg-white p-8 text-center">
          <p role="alert" className="text-sm text-rose-700">
            {getErrorMessage(projectsQuery.error, 'Could not load projects. Check your connection and try again.')}
          </p>
          <button
            type="button"
            onClick={() => projectsQuery.refetch()}
            className="mt-4 rounded-lg px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
          >
            Try again
          </button>
        </section>
      ) : projects.length === 0 ? (
        <section className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <FolderKanban size={23} />
          </div>
          <h2 className="mt-4 text-base font-bold text-slate-900">No projects yet</h2>
          <p className="mt-1.5 max-w-sm text-sm leading-6 text-slate-500">
            Create a project to give your work a clear place to live.
          </p>
          <button
            type="button"
            onClick={openCreateDialog}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <Plus size={16} /> Create your first project
          </button>
        </section>
      ) : (
        <section aria-label="Your projects" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map(({ project, role }) => (
            <article key={project._id} className="flex min-h-56 flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.02]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <FolderKanban size={19} />
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold capitalize text-slate-600">
                  {role.replace('_', ' ')}
                </span>
              </div>
              <h2 className="mt-4 line-clamp-1 text-base font-bold text-slate-900">{project.name}</h2>
              <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
                {project.description || 'No description added.'}
              </p>
              <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <UsersRound size={15} /> {project.members} {project.members === 1 ? 'member' : 'members'}
                </span>
                <Link
                  to={`/projects/${project._id}`}
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
                >
                  View project
                </Link>
              </div>
            </article>
          ))}
        </section>
      )}

      {isCreateDialogOpen && (
        <ProjectFormDialog
          key="create-project"
          project={null}
          isSaving={createMutation.isPending}
          errorMessage={createMutation.isError ? getErrorMessage(createMutation.error, 'Could not create the project.') : ''}
          onClose={() => setIsCreateDialogOpen(false)}
          onSave={(projectData) => createMutation.mutate(projectData)}
        />
      )}
    </div>
  )
}

export default ProjectsPage
