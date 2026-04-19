import { Navigate } from 'react-router-dom'
import { Navbar } from '../../components/Navbar'
import type { AuthSession } from '../../types/auth'
import { getDashboardContent } from './strategy/roleDashboardStrategy'

type DashboardPageProps = {
  session: AuthSession
}

export function DashboardPage({ session }: DashboardPageProps) {
  if (session.loading) {
    return (
      <main className="min-h-screen bg-[#FCFDFC] px-6 py-10 text-[#090A0A]">
        <section className="mx-auto max-w-3xl border border-zinc-200/70 bg-white/70 p-8 shadow-[0_8px_32px_rgba(9,10,10,0.04)] backdrop-blur-xl">
          <p className="font-mono text-[10px] tracking-[0.22em] text-emerald-600 uppercase">Loading</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">Restoring your session…</h1>
          <p className="mt-2 text-sm text-[#878D89]">Checking your token and loading your role.</p>
        </section>
      </main>
    )
  }

  if (!session.profile) {
    return <Navigate to="/login" replace />
  }

  const roleCopy = getDashboardContent(session.profile.role)
  const roleLabel = session.profile.role === 'EXPERT' ? 'Specialist Node' : 'Resident Node'

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FCFDFC] text-[#090A0A]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        }}
      />

      <Navbar isAuthenticated onLogout={session.logout} />

      <main className="relative z-10 mx-auto grid max-w-7xl gap-6 px-6 py-8 md:grid-cols-[1.3fr_1fr]">
        <section className="border border-zinc-200/70 bg-white/70 p-6 shadow-[0_8px_32px_rgba(9,10,10,0.04)] backdrop-blur-xl md:p-8">
          <div className="mb-8 flex flex-wrap items-start justify-between gap-5 border-b border-zinc-200/70 pb-6">
            <div>
              <p className="font-mono text-[10px] tracking-[0.2em] text-[#878D89] uppercase">Session Active</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Welcome, {session.profile.fullName}</h2>
              <p className="mt-2 text-sm text-[#878D89]">{session.profile.email}</p>
            </div>
            <span className="rounded border border-emerald-300 bg-emerald-50 px-3 py-2 font-mono text-[11px] tracking-wider text-emerald-700 uppercase">
              {roleLabel}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <article className="border border-zinc-200 bg-white p-4">
              <p className="text-xs text-[#878D89]">Role</p>
              <p className="mt-2 font-mono text-sm tracking-wide">{session.profile.role}</p>
            </article>
            <article className="border border-zinc-200 bg-white p-4">
              <p className="text-xs text-[#878D89]">Status</p>
              <p className="mt-2 font-mono text-sm tracking-wide">Authenticated</p>
            </article>
            <article className="border border-zinc-200 bg-white p-4">
              <p className="text-xs text-[#878D89]">Node ID</p>
              <p className="mt-2 font-mono text-sm tracking-wide">UF-{session.profile.role.slice(0, 1)}-2026</p>
            </article>
          </div>
        </section>

        <aside className="border border-zinc-200/70 bg-white/70 p-6 shadow-[0_8px_32px_rgba(9,10,10,0.04)] backdrop-blur-xl md:p-8">
          <p className="font-mono text-[10px] tracking-[0.22em] text-[#878D89] uppercase">Next Action</p>
          <h3 className="mt-3 text-xl font-bold tracking-tight text-[#090A0A]">Operational Brief</h3>
          <p className="mt-3 text-sm leading-relaxed text-[#5F6562]">{roleCopy.body}</p>

          <div className="mt-8 border-t border-zinc-200/70 pt-5">
            <p className="font-mono text-[10px] tracking-[0.18em] text-[#878D89] uppercase">Assigned Persona</p>
            <p className="mt-2 text-sm font-semibold tracking-wide text-zinc-800">{roleCopy.accent}</p>
          </div>

          <button
            className="mt-8 h-12 w-full border border-emerald-300/40 bg-emerald-100 text-sm font-bold tracking-[0.14em] text-emerald-700 uppercase transition-opacity hover:opacity-90"
            type="button"
            onClick={session.logout}
          >
            End Session
          </button>
        </aside>
      </main>
    </div>
  )
}
