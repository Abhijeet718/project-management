import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Check, CircleCheck, LoaderCircle, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import TaskFormDialog from '../components/TaskFormDialog.jsx'
import { getProjectById } from '../services/projectService.js'
import { createTask, getProjectTasks, updateTask } from '../services/taskService.js'
import { taskStatusLabels, taskStatusStyles } from '../utils/taskStatus.js'

function getErrorMessage(error, fallback) {
  return error.response?.data?.message || fallback
}

function ProjectTasksPage() {
  const { projectId } = useParams()
  const location = useLocation()
  const queryClient = useQueryClient()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const projectQuery = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProjectById(projectId),
  })
  const tasksQuery = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => getProjectTasks(projectId),
  })

  const createMutation = useMutation({
    mutationFn: (taskData) => createTask(projectId, taskData),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
      setIsCreateDialogOpen(false)
      setSuccessMessage('Task created successfully.')
    },
  })

  const completeMutation = useMutation({
    mutationFn: ({ taskId, status }) => updateTask(projectId, taskId, { status }),
    onSuccess: async (_updatedTask, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
      setSuccessMessage(variables.status === 'done' ? 'Task marked as done.' : 'Task reopened.')
    },
  })

  function openCreateDialog() {
    createMutation.reset()
    setSuccessMessage('')
    setIsCreateDialogOpen(true)
  }

  const tasks = tasksQuery.data || []
  const projectName = projectQuery.data?.name || 'Project tasks'

  return (
    <div className="space-y-7">
      <div className="space-y-4">
        <Link to={`/projects/${projectId}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-brand-700">
          <ArrowLeft size={16} /> Back to project
        </Link>
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-brand-600">{projectName}</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-[34px]">Tasks</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
              Track the work that moves this project forward.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateDialog}
            className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-600/20 hover:bg-brand-700"
          >
            <Plus size={17} /> New task
          </button>
        </section>
      </div>

      {(successMessage || location.state?.message) && (
        <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMessage || location.state.message}
        </p>
      )}
      {completeMutation.isError && (
        <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {getErrorMessage(completeMutation.error, 'Could not update the task status.')}
        </p>
      )}

      {tasksQuery.isPending ? (
        <div role="status" className="flex min-h-52 items-center justify-center gap-2 text-sm font-medium text-slate-500">
          <LoaderCircle size={18} className="animate-spin" /> Loading tasks…
        </div>
      ) : tasksQuery.isError ? (
        <section className="rounded-2xl border border-rose-100 bg-white p-8 text-center">
          <p role="alert" className="text-sm text-rose-700">
            {getErrorMessage(tasksQuery.error, 'Could not load tasks. Check your connection and try again.')}
          </p>
          <button
            type="button"
            onClick={() => tasksQuery.refetch()}
            className="mt-4 rounded-lg px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
          >
            Try again
          </button>
        </section>
      ) : tasks.length === 0 ? (
        <section className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <CircleCheck size={23} />
          </div>
          <h2 className="mt-4 text-base font-bold text-slate-900">No tasks in this project</h2>
          <p className="mt-1.5 max-w-sm text-sm leading-6 text-slate-500">
            Add the first task to turn this project into a clear set of next steps.
          </p>
          <button
            type="button"
            onClick={openCreateDialog}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <Plus size={16} /> Create the first task
          </button>
        </section>
      ) : (
        <section aria-label="Project tasks" className="space-y-3">
          {tasks.map((task) => (
            <article key={task._id} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm shadow-slate-900/[0.02] sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className={`break-words text-base font-bold ${task.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                      {task.title}
                    </h2>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${taskStatusStyles[task.status] || taskStatusStyles.todo}`}>
                      {taskStatusLabels[task.status] || taskStatusLabels.todo}
                    </span>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-slate-500">
                    {task.description || 'No description added.'}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {task.status !== 'done' && (
                    <button
                      type="button"
                      onClick={() => completeMutation.mutate({ taskId: task._id, status: 'done' })}
                      disabled={completeMutation.isPending}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                    >
                      {completeMutation.isPending && completeMutation.variables?.taskId === task._id
                        ? <LoaderCircle size={14} className="animate-spin" />
                        : <Check size={14} />}
                      Mark done
                    </button>
                  )}
                  <Link
                    to={`/projects/${projectId}/tasks/${task._id}`}
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
                  >
                    Details
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {projectQuery.isError && !tasksQuery.isError && (
        <p role="status" className="text-xs text-slate-500">
          Project name could not be loaded. The task list is still shown.
        </p>
      )}

      {isCreateDialogOpen && (
        <TaskFormDialog
          key="create-task"
          task={null}
          isSaving={createMutation.isPending}
          errorMessage={createMutation.isError ? getErrorMessage(createMutation.error, 'Could not create the task.') : ''}
          onClose={() => setIsCreateDialogOpen(false)}
          onSave={(taskData) => createMutation.mutate(taskData)}
        />
      )}
    </div>
  )
}

export default ProjectTasksPage
