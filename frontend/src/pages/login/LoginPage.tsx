import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent, FocusEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
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
    document.title = 'UrbanFix | Login'
  }, [])

  if (session.loading) {
    return (
      <AuthScaffold
        title="Checking Session"
        description="Please wait while we verify your token."
      >
        <div className="rounded-2xl border border-zinc-200/70 bg-white/70 px-5 py-5 text-sm text-zinc-600 backdrop-blur-sm">
          Preparing secure access to your UrbanFix workspace...
        </div>
      </AuthScaffold>
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

  const getInputClasses = (hasError: boolean) => {
    const baseClasses =
      'h-12 rounded-xl border border-zinc-200/80 bg-white/85 px-4 py-3 text-sm text-zinc-800 placeholder:text-zinc-400 shadow-sm transition-all duration-200 focus-visible:border-blue-300/70 focus-visible:bg-white focus-visible:ring-0 focus-visible:shadow-[0_0_0_3px_rgba(59,130,246,0.12)]'

    if (hasError) {
      return `${baseClasses} border-red-300 bg-red-50/70 focus-visible:border-red-400 focus-visible:shadow-[0_0_0_3px_rgba(248,113,113,0.18)]`
    }

    return baseClasses
  }

  // Check if form is valid for button styling
  const isFormValid = form.email && form.password && Object.keys(getFieldErrors(loginSchema, form)).length === 0

  return (
    <AuthScaffold
      title="Access Account"
      description="Authenticate to continue as resident or specialist."
      preForm={
        <div className="mb-8 rounded-2xl border border-blue-200/60 bg-blue-50/55 px-4 py-4 backdrop-blur-sm">
          <p className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-blue-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verified access layer
          </p>
          <p className="text-sm leading-relaxed text-zinc-600">
            Use your UrbanFix credentials to sync with your resident or specialist dashboard.
          </p>
        </div>
      }
      postForm={
        <div className="mt-8 flex justify-center border-t border-zinc-200/60 pt-6">
          <p className="text-xs text-zinc-500">
            New to the network?{' '}
            <Link className="font-semibold text-blue-600 transition-colors hover:text-blue-700" to="/signup/user">
              Create Account
            </Link>
          </p>
        </div>
      }
    >
      <form className="space-y-5" onSubmit={submitForm} noValidate>
        {/* Email Field */}
        <div className="space-y-2">
          <Label className="px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Email
          </Label>
          <Input
            type="email"
            value={form.email}
            onChange={updateField('email')}
            onBlur={handleBlur('email')}
            onFocus={handleFocus('email')}
            placeholder="kedar@urbanfix.in"
            className={getInputClasses(!!errors.email && touched.email)}
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
        <div className="space-y-2">
          <Label className="px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Password
          </Label>
          <Input
            type="password"
            value={form.password}
            onChange={updateField('password')}
            onBlur={handleBlur('password')}
            onFocus={handleFocus('password')}
            placeholder="••••••••••••"
            className={getInputClasses(!!errors.password && touched.password)}
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
          <div className="rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        )}

        {/* Submit Button - Changes color when form is valid */}
        <Button
          type="submit"
          disabled={loading}
          className={`h-12 w-full rounded-xl border text-sm font-semibold tracking-[0.12em] uppercase transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${
            isFormValid
              ? 'border-blue-300/40 bg-gradient-to-b from-blue-400 to-blue-500 text-white shadow-lg shadow-blue-500/25 hover:from-blue-300 hover:to-blue-400'
              : 'border-zinc-200 bg-white/70 text-zinc-500 hover:bg-zinc-50'
          }`}
        >
          {loading ? 'Please wait…' : 'Log In'}
        </Button>
      </form>
    </AuthScaffold>
  )
}
