import { Navigate } from 'react-router-dom'
import type { AuthSession } from '../../types/auth'

type DashboardPageProps = {
  session: AuthSession
}

export function DashboardPage({ session }: DashboardPageProps) {
  if (session.loading) {
    return (
      <main className="app-shell">
        <section className="card auth-card">
          <p className="eyebrow">Loading</p>
          <h1>Restoring your session…</h1>
          <p className="supporting-text">Checking your token and loading your role.</p>
        </section>
      </main>
    )
  }

  if (!session.profile) {
    return <Navigate to="/login" replace />
  }

  const roleCopy =
    session.profile.role === 'EXPERT'
      ? {
          title: 'Expert workspace',
          body: 'Incoming home repair requests will appear here once the request module is added.',
          accent: 'Technician',
        }
      : {
          title: 'User workspace',
          body: 'You will be able to raise home service requests and track their status from here.',
          accent: 'Customer',
        }

  return (
    <main className="app-shell">
      <section className="card dashboard-card">
        <div className="top-row">
          <div>
            <p className="eyebrow">Signed in</p>
            <h1>{roleCopy.title}</h1>
          </div>
          <button className="ghost-button" type="button" onClick={session.logout}>
            Logout
          </button>
        </div>

        <div className="profile-panel">
          <div>
            <p className="label">Welcome</p>
            <h2>{session.profile.fullName}</h2>
            <p className="supporting-text">{session.profile.email}</p>
          </div>
          <span className={`role-pill role-${session.profile.role.toLowerCase()}`}>{roleCopy.accent}</span>
        </div>

        <div className="info-grid">
          <article className="info-card">
            <p className="label">Role</p>
            <p>{session.profile.role}</p>
          </article>
          <article className="info-card">
            <p className="label">Next step</p>
            <p>{roleCopy.body}</p>
          </article>
        </div>
      </section>
    </main>
  )
}
