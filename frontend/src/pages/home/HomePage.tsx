import { useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import type { AuthSession } from '../../types/auth'
import { PageShell } from '../../components/PageShell'

type HomePageProps = {
  session: AuthSession
}

export function HomePage({ session }: HomePageProps) {
  useEffect(() => {
    document.title = 'UrbanFix | Home'
  }, [])

  if (session.loading) {
    return (
      <main className="app-shell">
        <section className="card auth-card">
          <p className="eyebrow">Loading</p>
          <h1>Preparing the app…</h1>
          <p className="supporting-text">Please wait while we verify your session.</p>
        </section>
      </main>
    )
  }

  if (session.profile) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <PageShell
      eyebrow="Home"
      title="Welcome to the service app"
      description="Choose whether you want to log in or create a user/expert account using route-specific pages."
    >
      <div className="tabs" role="navigation" aria-label="Home navigation">
        <Link className="tab" to="/login">
          Login
        </Link>
        <Link className="tab" to="/signup/user">
          User signup
        </Link>
        <Link className="tab" to="/signup/expert">
          Expert signup
        </Link>
      </div>

      <div className="info-grid">
        <article className="info-card">
          <p className="label">Route-based structure</p>
          <p>Each page lives in its own folder so login, signup, dashboard, and home stay separated.</p>
        </article>
        <article className="info-card">
          <p className="label">Role-based flow</p>
          <p>Users and experts have separate signup pages and a shared login/dashboard flow.</p>
        </article>
      </div>
    </PageShell>
  )
}
