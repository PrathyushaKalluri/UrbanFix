import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthTabs } from '../../components/AuthTabs'
import { PageShell } from '../../components/PageShell'
import { signupRoutes } from '../../config/signupRoutes'
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
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
    <PageShell eyebrow={config.eyebrow} title={config.title} description={config.description}>
      <AuthTabs activeRoute={config.route} />

      <form className="auth-form" onSubmit={submitForm}>
        <label className="field">
          <span>Full name</span>
          <input
            value={form.fullName}
            onChange={updateField('fullName')}
            placeholder="Aman Singh"
            required
          />
        </label>

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
          {loading ? 'Please wait…' : config.button}
        </button>

        <p className="supporting-text">
          Already have an account? <Link to="/login">Back to login</Link>.
        </p>
      </form>
    </PageShell>
  )
}
