import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CalendarDays, Check, LoaderCircle, Pencil, Plus, Trash2, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import TaskFormDialog from '../components/TaskFormDialog.jsx'
import { getProjectById } from '../services/projectService.js'
import {
  createSubtask,
  deleteSubtask,
  deleteTask,
  getTaskById,
  updateSubtask,
  updateTask,
} from '../services/taskService.js'
import { taskStatusLabels, taskStatusStyles } from '../utils/taskStatus.js'

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

function TaskDetailsPage() {
  const { projectId, taskId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [subtaskTitle, setSubtaskTitle] = useState('')
  const [subtaskFormError, setSubtaskFormError] = useState('')
  const taskQuery = useQuery({
    queryKey: ['task', projectId, taskId],
    queryFn: () => getTaskById(projectId, taskId),
  })
  const projectQuery = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProjectById(projectId),
  })

  const updateMutation = useMutation({
    mutationFn: (taskData) => updateTask(projectId, taskId, taskData),
    onSuccess: async (updatedTask) => {
      queryClient.setQueryData(['task', projectId, taskId], updatedTask)
      await queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
      setIsEditDialogOpen(false)
      setSuccessMessage('Task updated successfully.')
    },
  })

  const completeMutation = useMutation({
    mutationFn: (status) => updateTask(projectId, taskId, { status }),
    onSuccess: async (updatedTask) => {
      queryClient.setQueryData(['task', projectId, taskId], updatedTask)
      await queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
      setSuccessMessage('Task marked as done.')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteTask(projectId, taskId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
      queryClient.removeQueries({ queryKey: ['task', projectId, taskId] })
      navigate(`/projects/${projectId}/tasks`, {
        replace: true,
        state: { message: 'Task deleted successfully.' },
      })
    },
  })

  const createSubtaskMutation = useMutation({
    mutationFn: (title) => createSubtask(projectId, taskId, title),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['task', projectId, taskId] })
      setSubtaskTitle('')
      setSubtaskFormError('')
      setSuccessMessage('Subtask created successfully.')
    },
  })

  const updateSubtaskMutation = useMutation({
    mutationFn: ({ subtaskId, updates }) => updateSubtask(projectId, taskId, subtaskId, updates),
    onSuccess: async (_subtask, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['task', projectId, taskId] })
      setSuccessMessage(variables.updates.isCompleted ? 'Subtask marked complete.' : 'Subtask marked incomplete.')
    },
  })

  const deleteSubtaskMutation = useMutation({
    mutationFn: (subtaskId) => deleteSubtask(projectId, taskId, subtaskId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['task', projectId, taskId] })
      setSuccessMessage('Subtask deleted successfully.')
    },
  })

  function handleCreateSubtask(event) {
    event.preventDefault()
    const title = subtaskTitle.trim()
    if (!title) {
      setSubtaskFormError('Subtask title is required.')
      return
    }

    createSubtaskMutation.reset()
    setSubtaskFormError('')
    createSubtaskMutation.mutate(title)
  }

  function handleDeleteSubtask(subtask) {
    const confirmed = window.confirm(`Delete “${subtask.title}”? This cannot be undone.`)
    if (confirmed) deleteSubtaskMutation.mutate(subtask._id)
  }

  function handleDelete() {
    const confirmed = window.confirm(`Delete “${taskQuery.data.title}”? This cannot be undone.`)
    if (confirmed) deleteMutation.mutate()
  }

  if (taskQuery.isPending) {
    return (
      <div role="status" className="flex min-h-52 items-center justify-center gap-2 text-sm font-medium text-slate-500">
        <LoaderCircle size={18} className="animate-spin" /> Loading task…
      </div>
    )
  }

  if (taskQuery.isError) {
    return (
      <section className="rounded-2xl border border-rose-100 bg-white p-8 text-center">
        <p role="alert" className="text-sm text-rose-700">
          {getErrorMessage(taskQuery.error, 'Could not load this task.')}
        </p>
        <Link to={`/projects/${projectId}/tasks`} className="mt-4 inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50">
          <ArrowLeft size={16} /> Back to tasks
        </Link>
      </section>
    )
  }

  const task = taskQuery.data
  const assignedUser = task.assignedTo?.fullName || task.assignedTo?.username || 'Unassigned'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        <Link to={`/projects/${projectId}`} className="font-semibold text-slate-500 hover:text-brand-700">
          {projectQuery.data?.name || 'Project'}
        </Link>
        <span className="text-slate-300">/</span>
        <Link to={`/projects/${projectId}/tasks`} className="font-semibold text-slate-500 hover:text-brand-700">Tasks</Link>
        <span className="text-slate-300">/</span>
        <span className="text-slate-400">Details</span>
      </div>

      {successMessage && (
        <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{successMessage}</p>
      )}
      {(completeMutation.isError || deleteMutation.isError) && (
        <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {completeMutation.isError
            ? getErrorMessage(completeMutation.error, 'Could not update the task status.')
            : getErrorMessage(deleteMutation.error, 'Could not delete this task.')}
        </p>
      )}

      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-900/[0.02] sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${taskStatusStyles[task.status] || taskStatusStyles.todo}`}>
                {taskStatusLabels[task.status] || taskStatusLabels.todo}
              </span>
            </div>
            <h1 className={`mt-3 break-words text-2xl font-bold tracking-tight sm:text-3xl ${task.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
              {task.title}
            </h1>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">
              {task.description || 'No description has been added to this task.'}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2">
            {task.status !== 'done' && (
              <button
                type="button"
                onClick={() => completeMutation.mutate('done')}
                disabled={completeMutation.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60"
              >
                {completeMutation.isPending ? <LoaderCircle size={16} className="animate-spin" /> : <Check size={16} />}
                Mark done
              </button>
            )}
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
        </div>

        <div className="mt-8 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
            <CalendarDays size={18} className="text-slate-400" />
            <div>
              <p className="text-xs font-medium text-slate-500">Created</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{formatDate(task.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
            <UserRound size={18} className="text-slate-400" />
            <div>
              <p className="text-xs font-medium text-slate-500">Assigned to</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{assignedUser}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-900/[0.02] sm:p-6">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-bold text-slate-900">Subtasks</h2>
            <p className="mt-1 text-sm text-slate-500">
              {task.subtasks?.length || 0} {task.subtasks?.length === 1 ? 'subtask' : 'subtasks'}
            </p>
          </div>
        </div>

        {(createSubtaskMutation.isError || updateSubtaskMutation.isError || deleteSubtaskMutation.isError) && (
          <p role="alert" className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {createSubtaskMutation.isError
              ? getErrorMessage(createSubtaskMutation.error, 'Could not create the subtask.')
              : updateSubtaskMutation.isError
                ? getErrorMessage(updateSubtaskMutation.error, 'Could not update the subtask.')
                : getErrorMessage(deleteSubtaskMutation.error, 'Could not delete the subtask.')}
          </p>
        )}

        <form onSubmit={handleCreateSubtask} noValidate className="mt-5 flex flex-col gap-2 sm:flex-row">
          <div className="min-w-0 flex-1">
            <label htmlFor="new-subtask-title" className="sr-only">Subtask title</label>
            <input
              id="new-subtask-title"
              value={subtaskTitle}
              onChange={(event) => setSubtaskTitle(event.target.value)}
              aria-invalid={Boolean(subtaskFormError)}
              aria-describedby={subtaskFormError ? 'subtask-title-error' : undefined}
              disabled={createSubtaskMutation.isPending}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100 disabled:bg-slate-50"
              placeholder="Add a subtask"
            />
            {subtaskFormError && <p id="subtask-title-error" className="mt-1.5 text-xs text-rose-600">{subtaskFormError}</p>}
          </div>
          <button
            type="submit"
            disabled={createSubtaskMutation.isPending}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-wait disabled:opacity-60"
          >
            {createSubtaskMutation.isPending ? <LoaderCircle size={16} className="animate-spin" /> : <Plus size={16} />}
            Add subtask
          </button>
        </form>

        {task.subtasks?.length ? (
          <ul className="mt-5 divide-y divide-slate-100">
            {task.subtasks.map((subtask) => (
              <li key={subtask._id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <input
                  type="checkbox"
                  checked={Boolean(subtask.isCompleted)}
                  onChange={(event) => updateSubtaskMutation.mutate({
                    subtaskId: subtask._id,
                    updates: { isCompleted: event.target.checked },
                  })}
                  disabled={updateSubtaskMutation.isPending}
                  aria-label={`${subtask.isCompleted ? 'Mark incomplete' : 'Mark complete'}: ${subtask.title}`}
                  className="size-4 shrink-0 accent-[#6252d9]"
                />
                <div className="min-w-0 flex-1">
                  <p className={`break-words text-sm font-medium ${subtask.isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                    {subtask.title}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">{subtask.isCompleted ? 'Completed' : 'Not completed'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteSubtask(subtask)}
                  disabled={deleteSubtaskMutation.isPending}
                  aria-label={`Delete subtask: ${subtask.title}`}
                  className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50"
                >
                  {deleteSubtaskMutation.isPending && deleteSubtaskMutation.variables === subtask._id
                    ? <LoaderCircle size={16} className="animate-spin" />
                    : <Trash2 size={16} />}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 rounded-xl bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">
            No subtasks yet. Add one above to break this task into smaller steps.
          </p>
        )}
      </section>

      {projectQuery.isError && (
        <p role="status" className="text-xs text-slate-500">
          Project name could not be loaded. Task details are still available.
        </p>
      )}

      {isEditDialogOpen && (
        <TaskFormDialog
          key={task._id}
          task={task}
          isSaving={updateMutation.isPending}
          errorMessage={updateMutation.isError ? getErrorMessage(updateMutation.error, 'Could not update the task.') : ''}
          onClose={() => setIsEditDialogOpen(false)}
          onSave={(taskData) => updateMutation.mutate(taskData)}
        />
      )}
    </div>
  )
}

export default TaskDetailsPage
