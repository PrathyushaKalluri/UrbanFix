import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthScaffold } from '../../components/auth/AuthScaffold'
import { signupRoutes } from '../../config/signupRoutes'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import type { AuthSession, Role } from '../../types/auth'

type SignupPageProps = {
  session: AuthSession
  role: Role
}

export function SignupPage({ session, role }: SignupPageProps) {
  const navigate = useNavigate()
  const config = signupRoutes[role]
  const [form, setForm] = useState<{ fullName: string; email: string; password: string }>({
    fullName: '',
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
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

  const updateField = (field: 'fullName' | 'email' | 'password') => (event: ChangeEvent<HTMLInputElement>) => {
    setForm((current: { fullName: string; email: string; password: string }) => ({
      ...current,
      [field]: event.target.value,
    }))
  }

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      await session.submitAuth(config.endpoint, {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
      })
      navigate('/dashboard')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Authentication failed')
    } finally {
      setLoading(false)
    }
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
      <form className="space-y-6" onSubmit={submitForm}>
        <div className="space-y-1.5">
          <Label className="px-1 font-mono text-[10px] tracking-wider text-[#878D89] uppercase">
            Full Identity
          </Label>
          <Input
            value={form.fullName}
            onChange={updateField('fullName')}
            placeholder="ERIK LINDSTROM"
            className="h-12 rounded-none border-zinc-200 bg-white px-4 py-3 text-sm tracking-wide placeholder:text-zinc-300 focus-visible:border-emerald-500/50 focus-visible:ring-0"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label className="px-1 font-mono text-[10px] tracking-wider text-[#878D89] uppercase">
            Communication Channel
          </Label>
          <Input
            type="email"
            value={form.email}
            onChange={updateField('email')}
            placeholder="ERIK@URBANFIX.SE"
            className="h-12 rounded-none border-zinc-200 bg-white px-4 py-3 text-sm tracking-wide placeholder:text-zinc-300 focus-visible:border-emerald-500/50 focus-visible:ring-0"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label className="px-1 font-mono text-[10px] tracking-wider text-[#878D89] uppercase">
            Access Protocol
          </Label>
          <Input
            type="password"
            value={form.password}
            onChange={updateField('password')}
            placeholder="••••••••••••"
            className="h-12 rounded-none border-zinc-200 bg-white px-4 py-3 text-sm tracking-wide placeholder:text-zinc-300 focus-visible:border-emerald-500/50 focus-visible:ring-0"
            required
          />
        </div>

        <label className="flex items-start gap-3 py-2">
          <input
            className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-emerald-600"
            type="checkbox"
            checked={acceptTerms}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setAcceptTerms(event.target.checked)}
            required
          />
          <span className="text-[11px] leading-relaxed tracking-tight text-[#878D89] uppercase">
            I accept the{' '}
            <span className="font-semibold text-emerald-600 hover:underline">Terms of Service</span> and
            acknowledge the Privacy Infrastructure.
          </span>
        </label>

        {error && (
          <p className="rounded-none border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        <Button
          className="h-14 w-full rounded-none border border-emerald-300/30 bg-emerald-100 text-sm font-bold tracking-[0.2em] text-emerald-700 uppercase shadow-none hover:bg-emerald-100/90"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Please wait…' : config.button}
        </Button>
      </form>
    </AuthScaffold>
  )
}
