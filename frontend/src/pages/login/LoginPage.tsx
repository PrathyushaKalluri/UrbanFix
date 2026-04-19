import { useEffect, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthTabs } from '../../components/AuthTabs'
import { PageShell } from '../../components/PageShell'
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
    <PageShell
      eyebrow="Urbanclap-style auth"
      title="Sign in to continue"
      description="Customers and experts use separate signup paths, but both log in from the same page."
    >
      <AuthTabs activeRoute="/login" />

      <form className="auth-form" onSubmit={submitForm}>
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={form.email}
            onChange={updateField('email')}
            placeholder="name@example.com"
            required
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={form.password}
            onChange={updateField('password')}
            placeholder="••••••••"
            required
          />
        </label>

        {error && <p className="error-banner">{error}</p>}

        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? 'Please wait…' : 'Sign in'}
        </button>

        <p className="supporting-text">
          Need an account? <Link to="/signup/user">Create a user account</Link> or{' '}
          <Link to="/signup/expert">create an expert account</Link>.
        </p>
      </form>
    </PageShell>
  )
}
