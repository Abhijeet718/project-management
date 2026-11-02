import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import useAuth from '../context/useAuth.js'

const loginSchema = z.object({
  email: z.string().trim().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formError, setFormError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) })

  async function onSubmit(values) {
    setFormError('')
    try {
      await login(values.email, values.password)
      navigate(location.state?.from?.pathname || '/', { replace: true })
    } catch (error) {
      setFormError(error.response?.data?.message || 'Could not sign in. Check your connection and try again.')
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-900/[0.03] sm:p-9">
      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600">Welcome back</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Sign in to Taskspace</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">Use your account details to continue to your workspace.</p>
      </div>

      {location.state?.message && (
        <p role="status" className="mb-5 rounded-xl bg-emerald-50 px-3.5 py-3 text-sm text-emerald-800">
          {location.state.message}
        </p>
      )}
      {formError && (
        <p role="alert" className="mb-5 rounded-xl bg-rose-50 px-3.5 py-3 text-sm text-rose-700">
          {formError}
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-slate-700">Email address</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            placeholder="you@example.com"
          />
          {errors.email && <p id="email-error" className="mt-1.5 text-xs text-rose-600">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-700">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : undefined}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            placeholder="At least 8 characters"
          />
          {errors.password && <p id="password-error" className="mt-1.5 text-xs text-rose-600">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-brand-600/20 hover:bg-brand-700 disabled:cursor-wait disabled:opacity-70"
        >
          {isSubmitting ? <><LoaderCircle size={17} className="animate-spin" /> Signing in…</> : <>Sign in <ArrowRight size={17} /></>}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        New to Taskspace? <Link to="/register" className="font-semibold text-brand-700 hover:text-brand-600">Create an account</Link>
      </p>
    </section>
  )
}

export default LoginPage
