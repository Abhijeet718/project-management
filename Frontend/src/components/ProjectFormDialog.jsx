import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle, X } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const projectSchema = z.object({
  name: z.string().trim().min(1, 'Project name is required'),
  description: z.string().optional(),
})

function ProjectFormDialog({ project, isSaving, errorMessage, onClose, onSave }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name || '',
      description: project?.description || '',
    },
  })

  function submitForm(values) {
    const projectData = { name: values.name.trim() }
    const description = values.description?.trim()
    if (description || isEditing) projectData.description = description || ''
    onSave(projectData)
  }

  const isEditing = Boolean(project)

  useEffect(() => {
    if (isSaving) return undefined

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isSaving, onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isSaving) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-form-title"
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600">
              {isEditing ? 'Project settings' : 'New workspace project'}
            </p>
            <h2 id="project-form-title" className="mt-2 text-xl font-bold text-slate-900">
              {isEditing ? 'Edit project' : 'Create a project'}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {errorMessage && (
          <p role="alert" className="mt-5 rounded-xl bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
            {errorMessage}
          </p>
        )}

        <form onSubmit={handleSubmit(submitForm)} noValidate className="mt-6 space-y-5">
          <div>
            <label htmlFor="project-name" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Project name
            </label>
            <input
              id="project-name"
              autoFocus
              {...register('name')}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'project-name-error' : undefined}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              placeholder="For example, Internship Tracker"
            />
            {errors.name && <p id="project-name-error" className="mt-1.5 text-xs text-rose-600">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="project-description" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Description <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              id="project-description"
              rows="4"
              {...register('description')}
              className="w-full resize-y rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              placeholder="What is this project about?"
            />
          </div>

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-wait disabled:opacity-70"
            >
              {isSaving && <LoaderCircle size={16} className="animate-spin" />}
              {isSaving ? 'Saving…' : isEditing ? 'Save changes' : 'Create project'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default ProjectFormDialog
