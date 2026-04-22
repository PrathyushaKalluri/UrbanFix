import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent, FocusEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Home, ShieldCheck, Wrench } from 'lucide-react'
import { AuthScaffold } from '../../components/auth/AuthScaffold'
import { Combobox } from '../../components/ui/combobox'
import { HYDERABAD_AREAS } from '../../config/hyderabadAreas'
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
  serviceArea: string
}

const SERVICE_AREA_OPTIONS = HYDERABAD_AREAS.map((area) => ({
  value: area.name,
  label: area.name,
}))

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
    serviceArea: HYDERABAD_AREAS[0]?.name ?? 'Madhapur',
  })
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)

  useEffect(() => {
    document.title = role === 'EXPERT' ? 'UrbanFix | Expert Signup' : 'UrbanFix | User Signup'
  }, [role])

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
    (field: 'primaryExpertise' | 'yearsOfExperience' | 'expertiseAreas' | 'serviceArea') =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setExpertDetails((current: ExpertDetails) => ({
        ...current,
        [field]: event.target.value,
      }))
    }

  const updateExpertToggle =
    (field: 'available') => (event: ChangeEvent<HTMLInputElement>) => {
      setExpertDetails((current: ExpertDetails) => ({
        ...current,
        [field]: event.target.checked,
      }))
    }

  const updateExpertSelect =
    (field: 'serviceArea') => (value: string) => {
      setExpertDetails((current: ExpertDetails) => ({
        ...current,
        [field]: value,
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
        payload.serviceArea = expertDetails.serviceArea
      }

      await session.submitAuth(config.endpoint, payload)
      navigate('/dashboard')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Registration failed')
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

  const expertInputClasses =
    'h-12 rounded-xl border border-zinc-200/80 bg-white/85 px-4 py-3 text-sm text-zinc-800 placeholder:text-zinc-400 shadow-sm transition-all duration-200 focus-visible:border-blue-300/70 focus-visible:bg-white focus-visible:ring-0 focus-visible:shadow-[0_0_0_3px_rgba(59,130,246,0.12)]'

  // Check if form is valid for button styling
  const isFormValid = form.fullName && form.email && form.password && 
    Object.keys(getFieldErrors(signupSchema, form)).length === 0

  return (
    <AuthScaffold
      title={role === 'EXPERT' ? 'Join as Specialist' : 'Create Resident Account'}
      description="Select your profile and complete onboarding to unlock your UrbanFix workspace."
      preForm={
        <>
          <div className="mb-5 rounded-2xl border border-blue-200/60 bg-blue-50/55 px-4 py-4 backdrop-blur-sm">
            <p className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-blue-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              Unified onboarding fabric
            </p>
            <p className="text-sm leading-relaxed text-zinc-600">
              Choose your role first, then complete account setup with the same landing-page visual language.
            </p>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              to="/signup/user"
              className={`group rounded-2xl border p-5 transition-all duration-300 ${
                role === 'USER'
                  ? 'border-blue-300/70 bg-blue-50/70 shadow-[0_8px_24px_rgba(59,130,246,0.12)]'
                  : 'border-zinc-200/80 bg-white/65 hover:border-blue-200/70 hover:bg-blue-50/45'
              }`}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-blue-200/50 bg-white/80 text-blue-600">
                <Home className="h-5 w-5" />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-700">
                Join as Resident
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Request and track home services.
              </p>
            </Link>

            <Link
              to="/signup/expert"
              className={`group rounded-2xl border p-5 transition-all duration-300 ${
                role === 'EXPERT'
                  ? 'border-blue-300/70 bg-blue-50/70 shadow-[0_8px_24px_rgba(59,130,246,0.12)]'
                  : 'border-zinc-200/80 bg-white/65 hover:border-blue-200/70 hover:bg-blue-50/45'
              }`}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-blue-200/50 bg-white/80 text-blue-600">
                <Wrench className="h-5 w-5" />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-700">
                Join as Specialist
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Offer services and manage availability.
              </p>
            </Link>
          </div>
        </>
      }
      postForm={
        <div className="mt-8 flex justify-center border-t border-zinc-200/60 pt-6">
          <p className="text-xs text-zinc-500">
            Already in the system?{' '}
            <Link className="font-semibold text-blue-600 transition-colors hover:text-blue-700" to="/login">
              Log In
            </Link>
          </p>
        </div>
      }
    >
      <form className="space-y-5" onSubmit={submitForm} noValidate>
        {/* Full Name Field */}
        <div className="space-y-2">
          <Label className="px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Full Name
          </Label>
          <Input
            value={form.fullName}
            onChange={updateField('fullName')}
            onBlur={handleBlur('fullName')}
            onFocus={handleFocus('fullName')}
            placeholder="Kedar Dalvi"
            className={getInputClasses(!!errors.fullName && touched.fullName)}
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
          {!errors.password && touched.password && (
            <p className="px-1 text-[10px] text-blue-600">
              Password meets requirements
            </p>
          )}
        </div>

        {role === 'EXPERT' && (
          <>
            <div className="space-y-2">
              <Label className="px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Primary Expertise
              </Label>
              <Input
                value={expertDetails.primaryExpertise}
                onChange={updateExpertField('primaryExpertise')}
                placeholder="Electrical, Plumbing, AC Repair"
                className={expertInputClasses}
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Years Of Experience
              </Label>
              <Input
                type="number"
                min={0}
                value={expertDetails.yearsOfExperience}
                onChange={updateExpertField('yearsOfExperience')}
                placeholder="5"
                className={expertInputClasses}
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Expertise Areas (comma separated)
              </Label>
              <Input
                value={expertDetails.expertiseAreas}
                onChange={updateExpertField('expertiseAreas')}
                placeholder="Wiring upgrades, Leak detection, Inverter setup"
                className={expertInputClasses}
                required
              />
            </div>

            <div className="space-y-2">
              <Combobox
                label="Service Area (Hyderabad)"
                helperText="We use this area to automatically determine your service coordinates."
                placeholder="Select a service area"
                searchPlaceholder="Search Hyderabad areas"
                emptyText="No Hyderabad area matches that search"
                options={SERVICE_AREA_OPTIONS}
                value={expertDetails.serviceArea}
                onValueChange={updateExpertSelect('serviceArea')}
              />
            </div>

            <label className="flex items-start gap-3 rounded-xl border border-zinc-200/80 bg-white/70 p-3.5 backdrop-blur-sm">
              <input
                className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-blue-600"
                type="checkbox"
                checked={expertDetails.available}
                onChange={updateExpertToggle('available')}
              />
              <span className="text-[11px] leading-relaxed text-zinc-600 uppercase tracking-[0.1em]">
                Currently available for jobs
              </span>
            </label>
          </>
        )}

        <label className="flex items-start gap-3 rounded-xl border border-zinc-200/80 bg-white/70 px-3.5 py-3 backdrop-blur-sm">
          <input
            className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-blue-600"
            type="checkbox"
            checked={acceptTerms}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setAcceptTerms(event.target.checked)}
          />
          <span className="text-[11px] leading-relaxed text-zinc-600 uppercase tracking-[0.1em]">
            I accept the{' '}
            <span className="font-semibold text-blue-600 hover:underline">Terms of Service</span> and
            acknowledge the Privacy Infrastructure.
          </span>
        </label>

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
          {loading ? 'Please wait…' : config.button}
        </Button>
      </form>
    </AuthScaffold>
  )
}
