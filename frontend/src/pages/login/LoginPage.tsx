import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent, FocusEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthScaffold } from '../../components/auth/AuthScaffold'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { loginSchema, getFieldErrors, validateField, type LoginFormData } from '../../lib/validation'
import type { AuthSession } from '../../types/auth'

type LoginPageProps = {
  session: AuthSession
}

export function LoginPage({ session }: LoginPageProps) {
  const navigate = useNavigate()
  const [form, setForm] = useState<LoginFormData>({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    document.title = 'Spring Boot + React'
  }, [])

  if (session.loading) {
    return (
      <main className="app-shell">
        <section className="card auth-card">
          <p className="eyebrow">Loading</p>
          <h1>Checking your session…</h1>
          <p className="supporting-text">Please wait while we verify your token.</p>
        </section>
      </main>
    )
  }

  if (session.profile) {
    return <Navigate to="/dashboard" replace />
  }

  const updateField = (field: keyof LoginFormData) => (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
    
    // Clear submit error when user starts typing
    if (submitError) {
      setSubmitError('')
    }
    
    // Validate field immediately if it's been touched
    if (touched[field]) {
      const fieldError = validateField(loginSchema, field, value)
      setErrors((current) => ({
        ...current,
        [field]: fieldError || '',
      }))
    }
  }

  const handleBlur = (field: keyof LoginFormData) => (event: FocusEvent<HTMLInputElement>) => {
    setTouched((current) => ({
      ...current,
      [field]: true,
    }))
    
    const fieldError = validateField(loginSchema, field, event.target.value)
    setErrors((current) => ({
      ...current,
      [field]: fieldError || '',
    }))
  }

  const handleFocus = (field: keyof LoginFormData) => () => {
    // Clear error when user focuses on field
    setErrors((current) => ({
      ...current,
      [field]: '',
    }))
  }

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitError('')
    
    // Validate all fields
    const validationErrors = getFieldErrors(loginSchema, form)
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setTouched({ email: true, password: true })
      return
    }
    
    setLoading(true)

    try {
      await session.submitAuth('/api/auth/login', {
        email: form.email,
        password: form.password,
      })
      navigate('/dashboard')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const getInputClasses = (field: string, hasError: boolean) => {
    const baseClasses = "h-12 rounded-none bg-white px-4 py-3 text-sm tracking-wide placeholder:text-zinc-300 focus-visible:ring-0 transition-colors"
    
    if (hasError) {
      return `${baseClasses} border-red-400 bg-red-50/30 focus-visible:border-red-500`
    }
    
    return `${baseClasses} border-zinc-200 focus-visible:border-emerald-500/50`
  }

  return (
    <AuthScaffold
      title="Access Account"
      description="Authenticate to continue as resident or specialist."
      postForm={
        <div className="mt-8 flex justify-center border-t border-zinc-200/60 pt-6">
          <p className="text-[11px] tracking-widest text-[#878D89] uppercase">
            New to the network?{' '}
            <Link className="font-bold text-[#090A0A] transition-colors hover:text-emerald-600" to="/signup/user">
              Create Account
            </Link>
          </p>
        </div>
      }
    >
      <form className="space-y-6" onSubmit={submitForm} noValidate>
        {/* Email Field */}
        <div className="space-y-1.5">
          <Label className="px-1 font-mono text-[10px] tracking-wider text-[#878D89] uppercase">
            Email
          </Label>
          <Input
            type="email"
            value={form.email}
            onChange={updateField('email')}
            onBlur={handleBlur('email')}
            onFocus={handleFocus('email')}
            placeholder="kedar@urbanfix.in"
            className={getInputClasses('email', !!errors.email && touched.email)}
            aria-invalid={!!errors.email && touched.email}
            aria-describedby={errors.email && touched.email ? 'email-error' : undefined}
          />
          {errors.email && touched.email && (
            <p id="email-error" className="px-1 text-[11px] text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <Label className="px-1 font-mono text-[10px] tracking-wider text-[#878D89] uppercase">
            Password
          </Label>
          <Input
            type="password"
            value={form.password}
            onChange={updateField('password')}
            onBlur={handleBlur('password')}
            onFocus={handleFocus('password')}
            placeholder="••••••••••••"
            className={getInputClasses('password', !!errors.password && touched.password)}
            aria-invalid={!!errors.password && touched.password}
            aria-describedby={errors.password && touched.password ? 'password-error' : undefined}
          />
          {errors.password && touched.password && (
            <p id="password-error" className="px-1 text-[11px] text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
              {errors.password}
            </p>
          )}
        </div>

        {/* Submit Error (server-side errors) */}
        {submitError && (
          <div className="rounded-none border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        )}

        {/* Submit Button - Disabled when form is invalid */}
        <Button
          type="submit"
          disabled={loading}
          className="h-14 w-full rounded-none border border-emerald-300/30 bg-emerald-100 text-sm font-bold tracking-[0.2em] text-emerald-700 uppercase shadow-none hover:bg-emerald-100/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Please wait…' : 'Log In'}
        </Button>
      </form>
    </AuthScaffold>
  )
}
