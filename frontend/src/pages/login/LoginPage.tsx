import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthScaffold } from '../../components/auth/AuthScaffold'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import type { AuthSession } from '../../types/auth'

type LoginPageProps = {
  session: AuthSession
}

export function LoginPage({ session }: LoginPageProps) {
  const navigate = useNavigate()
  const [form, setForm] = useState<{ email: string; password: string }>({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  const updateField = (field: 'email' | 'password') => (event: ChangeEvent<HTMLInputElement>) => {
    setForm((current: { email: string; password: string }) => ({
      ...current,
      [field]: event.target.value,
    }))
  }

  const submitForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      await session.submitAuth('/api/auth/login', {
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
      title="Access Account"
      description="Authenticate to continue as resident or specialist."
      preForm={
        <div className="mb-8 grid grid-cols-2 gap-4">
          <Link
            to="/signup/user"
            className="flex items-center justify-center border border-zinc-200 p-5 text-[10px] font-bold tracking-widest text-zinc-600 uppercase transition-all hover:border-emerald-500/60 hover:bg-zinc-50"
          >
            Join as resident
          </Link>
          <Link
            to="/signup/expert"
            className="flex items-center justify-center border border-zinc-200 p-5 text-[10px] font-bold tracking-widest text-zinc-600 uppercase transition-all hover:border-emerald-500/60 hover:bg-zinc-50"
          >
            Join as specialist
          </Link>
        </div>
      }
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
      <form className="space-y-6" onSubmit={submitForm}>
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

        {error && (
          <p className="rounded-none border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="h-14 w-full rounded-none border border-emerald-300/30 bg-emerald-100 text-sm font-bold tracking-[0.2em] text-emerald-700 uppercase shadow-none hover:bg-emerald-100/90"
        >
          {loading ? 'Please wait…' : 'Log In'}
        </Button>
      </form>
    </AuthScaffold>
  )
}
