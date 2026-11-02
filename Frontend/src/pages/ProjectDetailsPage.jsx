import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CalendarDays, FolderKanban, LoaderCircle, Pencil, Trash2, UsersRound } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ProjectFormDialog from '../components/ProjectFormDialog.jsx'
import { deleteProject, getProjectById, getProjects, updateProject } from '../services/projectService.js'

function getErrorMessage(error, fallback) {
  return error.response?.data?.message || fallback
}

function formatDate(dateValue) {
  if (!dateValue) return 'Not available'
  const date = new Date(dateValue)
  return Number.isNaN(date.getTime())
    ? 'Not available'
    : new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(date)
}

function ProjectDetailsPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const projectQuery = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProjectById(projectId),
  })
  const projectsQuery = useQuery({ queryKey: ['projects'], queryFn: getProjects })

  const updateMutation = useMutation({
    mutationFn: (projectData) => updateProject(projectId, projectData),
    onSuccess: async (updatedProject) => {
      queryClient.setQueryData(['project', projectId], updatedProject)
      await queryClient.invalidateQueries({ queryKey: ['projects'] })
      setIsEditDialogOpen(false)
      setSuccessMessage('Project updated successfully.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteProject(projectId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.removeQueries({ queryKey: ['project', projectId] })
      navigate('/projects', { replace: true, state: { message: 'Project deleted successfully.' } })
    },
  })

  function handleDelete() {
    const confirmed = window.confirm(`Delete “${projectQuery.data.name}”? This cannot be undone.`)
    if (confirmed) deleteMutation.mutate()
  }

  if (projectQuery.isPending) {
    return (
      <div role="status" className="flex min-h-52 items-center justify-center gap-2 text-sm font-medium text-slate-500">
        <LoaderCircle size={18} className="animate-spin" /> Loading project…
      </div>
    )
  }

  if (projectQuery.isError) {
    return (
      <section className="rounded-2xl border border-rose-100 bg-white p-8 text-center">
        <p role="alert" className="text-sm text-rose-700">
          {getErrorMessage(projectQuery.error, 'Could not load this project.')}
        </p>
        <Link to="/projects" className="mt-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50">
          <ArrowLeft size={16} /> Back to projects
        </Link>
      </section>
    )
  }

  const project = projectQuery.data
  const membership = projectsQuery.data?.find(({ project: rowProject }) => rowProject._id === projectId)
  const canManageProject = membership?.role === 'admin'

  return (
    <div className="space-y-6">
      <Link to="/projects" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-brand-700">
        <ArrowLeft size={16} /> All projects
      </Link>

      {successMessage && (
        <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{successMessage}</p>
      )}
      {(deleteMutation.isError || (projectsQuery.isError && !canManageProject)) && (
        <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {deleteMutation.isError
            ? getErrorMessage(deleteMutation.error, 'Could not delete the project.')
            : getErrorMessage(projectsQuery.error, 'Could not load your project permissions.')}
        </p>
      )}

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-900/[0.02] sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <FolderKanban size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600">Project details</p>
              <h1 className="mt-2 break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{project.name}</h1>
              <p className="mt-3 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-slate-600">
                {project.description || 'No description has been added to this project.'}
              </p>
            </div>
          </div>

          {canManageProject && (
            <div className="flex shrink-0 gap-2 sm:pt-1">
              <button
                type="button"
                onClick={() => {
                  updateMutation.reset()
                  setIsEditDialogOpen(true)
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Pencil size={16} /> Edit
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3.5 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-wait disabled:opacity-60"
              >
                {deleteMutation.isPending ? <LoaderCircle size={16} className="animate-spin" /> : <Trash2 size={16} />}
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
            <CalendarDays size={18} className="text-slate-400" />
            <div>
              <p className="text-xs font-medium text-slate-500">Created</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{formatDate(project.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
            <UsersRound size={18} className="text-slate-400" />
            <div>
              <p className="text-xs font-medium text-slate-500">Your project role</p>
              {projectsQuery.isPending ? (
                <p className="mt-1 text-sm text-slate-500">Loading…</p>
              ) : (
                <p className="mt-1 text-sm font-semibold capitalize text-slate-800">
                  {membership?.role?.replace('_', ' ') || 'Member'}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.02] sm:flex-row sm:items-center sm:p-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">Tasks</h2>
          <p className="mt-1 text-sm text-slate-500">View and manage the work tracked in this project.</p>
        </div>
        <Link
          to={`/projects/${projectId}/tasks`}
          className="inline-flex w-fit items-center justify-center rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Open tasks
        </Link>
      </section>

      {isEditDialogOpen && (
        <ProjectFormDialog
          key={project._id}
          project={project}
          isSaving={updateMutation.isPending}
          errorMessage={updateMutation.isError ? getErrorMessage(updateMutation.error, 'Could not update the project.') : ''}
          onClose={() => setIsEditDialogOpen(false)}
          onSave={(projectData) => updateMutation.mutate(projectData)}
        />
      )}
    </div>
  )
}

export default ProjectDetailsPage
