import { useState } from 'react'
import type { ChangeEvent, FormEvent, FocusEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthScaffold } from '../../components/auth/AuthScaffold'
import { signupRoutes } from '../../config/signupRoutes'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { signupSchema, getFieldErrors, validateField, type SignupFormData } from '../../lib/validation'
import type { AuthSession, Role } from '../../types/auth'

type SignupPageProps = {
  session: AuthSession
  role: Role
}

type ExpertDetails = {
  primaryExpertise: string
  yearsOfExperience: string
  expertiseAreas: string
  available: boolean
  servesAsResident: boolean
}

export function SignupPage({ session, role }: SignupPageProps) {
  const navigate = useNavigate()
  const config = signupRoutes[role]
  const [form, setForm] = useState<SignupFormData>({
    fullName: '',
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [expertDetails, setExpertDetails] = useState<ExpertDetails>({
    primaryExpertise: '',
    yearsOfExperience: '',
    expertiseAreas: '',
    available: true,
    servesAsResident: true,
  })
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)

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

  const updateField = (field: keyof SignupFormData) => (event: ChangeEvent<HTMLInputElement>) => {
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
      const fieldError = validateField(signupSchema, field, value)
      setErrors((current) => ({
        ...current,
        [field]: fieldError || '',
      }))
    }
  }

  const handleBlur = (field: keyof SignupFormData) => (event: FocusEvent<HTMLInputElement>) => {
    setTouched((current) => ({
      ...current,
      [field]: true,
    }))
    
    const fieldError = validateField(signupSchema, field, event.target.value)
    setErrors((current) => ({
      ...current,
      [field]: fieldError || '',
    }))
  }

  const handleFocus = (field: keyof SignupFormData) => () => {
    // Clear error when user focuses on field
    setErrors((current) => ({
      ...current,
      [field]: '',
    }))
  }

  const updateExpertField =
    (field: 'primaryExpertise' | 'yearsOfExperience' | 'expertiseAreas') =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setExpertDetails((current: ExpertDetails) => ({
        ...current,
        [field]: event.target.value,
      }))
    }

  const updateExpertToggle =
    (field: 'available' | 'servesAsResident') => (event: ChangeEvent<HTMLInputElement>) => {
      setExpertDetails((current: ExpertDetails) => ({
        ...current,
        [field]: event.target.checked,
      }))
    }

  const toList = (value: string): string[] => {
    return value
      .split(',')
      .map((item: string) => item.trim())
      .filter((item: string) => item.length > 0)
  }

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitError('')
    
    // Validate all fields
    const validationErrors = getFieldErrors(signupSchema, form)
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      setTouched({ fullName: true, email: true, password: true })
      return
    }
    
    if (!acceptTerms) {
      setSubmitError('Please accept the terms of service')
      return
    }
    
    setLoading(true)

    try {
      const payload: Record<string, unknown> = {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      }

      if (role === 'EXPERT') {
        payload.primaryExpertise = expertDetails.primaryExpertise
        payload.yearsOfExperience = Number.parseInt(expertDetails.yearsOfExperience, 10) || 0
        payload.expertiseAreas = toList(expertDetails.expertiseAreas)
        payload.available = expertDetails.available
        payload.servesAsResident = expertDetails.servesAsResident
      }

      await session.submitAuth(config.endpoint, payload)
      navigate('/dashboard')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Registration failed')
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
      title="Create Account"
      description="Select your profile to begin."
      preForm={
        <div className="mb-8 grid grid-cols-2 gap-4">
          <Link
            to="/signup/user"
            className={`flex flex-col items-center justify-center gap-3 border p-6 text-center transition-all ${
              role === 'USER'
                ? 'border-emerald-500 bg-emerald-100/40 text-emerald-700'
                : 'border-zinc-200 text-[#878D89] hover:border-emerald-500/50 hover:bg-zinc-50'
            }`}
          >
            <span className="text-3xl">🏠</span>
            <span className="font-mono text-[10px] tracking-widest font-bold uppercase">Join as resident</span>
          </Link>

          <Link
            to="/signup/expert"
            className={`flex flex-col items-center justify-center gap-3 border p-6 text-center transition-all ${
              role === 'EXPERT'
                ? 'border-emerald-500 bg-emerald-100/40 text-emerald-700'
                : 'border-zinc-200 text-[#878D89] hover:border-emerald-500/50 hover:bg-zinc-50'
            }`}
          >
            <span className="text-3xl">🛠️</span>
            <span className="font-mono text-[10px] tracking-widest font-bold uppercase">Join as specialist</span>
          </Link>
        </div>
      }
      postForm={
        <div className="mt-8 flex justify-center border-t border-zinc-200/60 pt-6">
          <p className="text-[11px] tracking-widest text-[#878D89] uppercase">
            Already in the system?{' '}
            <Link className="font-bold text-[#090A0A] transition-colors hover:text-emerald-600" to="/login">
              Log In
            </Link>
          </p>
        </div>
      }
    >
      <form className="space-y-6" onSubmit={submitForm} noValidate>
        {/* Full Name Field */}
        <div className="space-y-1.5">
          <Label className="px-1 font-mono text-[10px] tracking-wider text-[#878D89] uppercase">
            Full Identity
          </Label>
          <Input
            value={form.fullName}
            onChange={updateField('fullName')}
            onBlur={handleBlur('fullName')}
            onFocus={handleFocus('fullName')}
            placeholder="Kedar Dalvi"
            className={getInputClasses('fullName', !!errors.fullName && touched.fullName)}
            aria-invalid={!!errors.fullName && touched.fullName}
            aria-describedby={errors.fullName && touched.fullName ? 'fullname-error' : undefined}
          />
          {errors.fullName && touched.fullName && (
            <p id="fullname-error" className="px-1 text-[11px] text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
              {errors.fullName}
            </p>
          )}
        </div>

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
          {!errors.password && touched.password && (
            <p className="px-1 text-[10px] text-emerald-600">
              Password meets requirements
            </p>
          )}
        </div>

        {role === 'EXPERT' && (
          <>
            <div className="space-y-1.5">
              <Label className="px-1 font-mono text-[10px] tracking-wider text-[#878D89] uppercase">
                Primary Expertise
              </Label>
              <Input
                value={expertDetails.primaryExpertise}
                onChange={updateExpertField('primaryExpertise')}
                placeholder="Electrical, Plumbing, AC Repair"
                className="h-12 rounded-none border-zinc-200 bg-white px-4 py-3 text-sm tracking-wide placeholder:text-zinc-300 focus-visible:border-emerald-500/50 focus-visible:ring-0"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="px-1 font-mono text-[10px] tracking-wider text-[#878D89] uppercase">
                Years Of Experience
              </Label>
              <Input
                type="number"
                min={0}
                value={expertDetails.yearsOfExperience}
                onChange={updateExpertField('yearsOfExperience')}
                placeholder="5"
                className="h-12 rounded-none border-zinc-200 bg-white px-4 py-3 text-sm tracking-wide placeholder:text-zinc-300 focus-visible:border-emerald-500/50 focus-visible:ring-0"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="px-1 font-mono text-[10px] tracking-wider text-[#878D89] uppercase">
                Expertise Areas (comma separated)
              </Label>
              <Input
                value={expertDetails.expertiseAreas}
                onChange={updateExpertField('expertiseAreas')}
                placeholder="Wiring upgrades, Leak detection, Inverter setup"
                className="h-12 rounded-none border-zinc-200 bg-white px-4 py-3 text-sm tracking-wide placeholder:text-zinc-300 focus-visible:border-emerald-500/50 focus-visible:ring-0"
                required
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-start gap-3 border border-zinc-200 p-3">
                <input
                  className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-emerald-600"
                  type="checkbox"
                  checked={expertDetails.available}
                  onChange={updateExpertToggle('available')}
                />
                <span className="text-[11px] leading-relaxed tracking-tight text-[#878D89] uppercase">
                  Currently available for jobs
                </span>
              </label>

              <label className="flex items-start gap-3 border border-zinc-200 p-3">
                <input
                  className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-emerald-600"
                  type="checkbox"
                  checked={expertDetails.servesAsResident}
                  onChange={updateExpertToggle('servesAsResident')}
                />
                <span className="text-[11px] leading-relaxed tracking-tight text-[#878D89] uppercase">
                  I also use UrbanFix as resident
                </span>
              </label>
            </div>
          </>
        )}
        <label className="flex items-start gap-3 py-2">
          <input
            className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-emerald-600"
            type="checkbox"
            checked={acceptTerms}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setAcceptTerms(event.target.checked)}
          />
          <span className="text-[11px] leading-relaxed tracking-tight text-[#878D89] uppercase">
            I accept the{' '}
            <span className="font-semibold text-emerald-600 hover:underline">Terms of Service</span> and
            acknowledge the Privacy Infrastructure.
          </span>
        </label>

        {/* Submit Error (server-side errors) */}
        {submitError && (
          <div className="rounded-none border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submitError}
          </div>
        )}

        {/* Submit Button */}
        <Button
          className="h-14 w-full rounded-none border border-emerald-300/30 bg-emerald-100 text-sm font-bold tracking-[0.2em] text-emerald-700 uppercase shadow-none hover:bg-emerald-100/90 disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Please wait…' : config.button}
        </Button>
      </form>
    </AuthScaffold>
  )
}
