import { Navigate, useNavigate } from 'react-router-dom'
import { Navbar } from '../../components/Navbar'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { useAvailableExperts } from '../../hooks/useAvailableExperts'
import type { AuthSession } from '../../types/auth'
import { getDashboardContent } from './strategy/roleDashboardStrategy'
import { ExpertDashboardView } from './views/ExpertDashboardView'

type DashboardPageProps = {
  session: AuthSession
}

export function DashboardPage({ session }: DashboardPageProps) {
  const { experts, loading: expertsLoading, error: expertsError } = useAvailableExperts()
  const navigate = useNavigate()

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

  if (session.profile.role === 'EXPERT') {
    return <ExpertDashboardView session={session} />
  }

  if (session.profile.role === 'USER') {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#FCFDFC] text-[#090A0A]">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
          }}
        />

        <Navbar isAuthenticated onLogout={session.logout} />

        <main className="relative z-10 mx-auto max-w-7xl px-6 py-8">
          <section className="border border-zinc-200/70 bg-white/70 p-6 shadow-[0_8px_32px_rgba(9,10,10,0.04)] backdrop-blur-xl md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-5 border-b border-zinc-200/70 pb-6">
              <div>
                <p className="font-mono text-[10px] tracking-[0.2em] text-[#878D89] uppercase">Session Active</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight">Welcome, {session.profile.fullName}</h2>
                <p className="mt-2 text-sm text-[#878D89]">{session.profile.email}</p>
              </div>
              <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700">
                {roleLabel}
              </Badge>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <article className="border border-zinc-200 bg-white p-4">
                <p className="text-xs text-[#878D89]">All experts</p>
                <p className="mt-2 font-mono text-sm tracking-wide">{experts.length}</p>
              </article>
              <article className="border border-zinc-200 bg-white p-4">
                <p className="text-xs text-[#878D89]">Status</p>
                <p className="mt-2 font-mono text-sm tracking-wide">{expertsLoading ? 'Syncing' : 'Live feed ready'}</p>
              </article>
              <article className="border border-zinc-200 bg-white p-4">
                <p className="text-xs text-[#878D89]">Message channel</p>
                <p className="mt-2 font-mono text-sm tracking-wide">Comms Matrix</p>
              </article>
            </div>
          </section>

          <section className="mt-6 border border-zinc-200/70 bg-white/70 p-6 shadow-[0_8px_32px_rgba(9,10,10,0.04)] backdrop-blur-xl md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] tracking-[0.2em] text-[#878D89] uppercase">Service Discovery</p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight">All experts in the network</h3>
                <p className="mt-2 text-sm text-[#5F6562]">Review every expert, see whether they are currently accepting work, and open a secure chat when ready.</p>
              </div>
              {expertsError && <p className="text-sm text-rose-600">{expertsError}</p>}
            </div>

            {expertsLoading ? (
              <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-64 animate-pulse border border-zinc-200 bg-zinc-50" />
                ))}
              </div>
            ) : expertsError ? (
              <div className="mt-6 border border-dashed border-zinc-300 bg-zinc-50 px-5 py-6 text-sm text-[#5F6562]">
                {expertsError}
              </div>
            ) : experts.length === 0 ? (
              <div className="mt-6 border border-dashed border-zinc-300 bg-zinc-50 px-5 py-6 text-sm text-[#5F6562]">
                No experts are available yet.
              </div>
            ) : (
              <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {experts.map((expert) => (
                  <Card
                    key={expert.expertId}
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate(`/messages/${expert.expertId}`)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        navigate(`/messages/${expert.expertId}`)
                      }
                    }}
                    className="group cursor-pointer border-zinc-200/70 bg-white/80 shadow-[0_8px_32px_rgba(9,10,10,0.04)] transition-transform duration-200 hover:-translate-y-1 hover:border-emerald-300"
                  >
                      <CardHeader className="space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-mono text-[10px] tracking-[0.2em] text-[#878D89] uppercase">Expert</p>
                            <CardTitle className="mt-2 text-xl">{expert.fullName}</CardTitle>
                            <CardDescription className="mt-1">{expert.primaryExpertise}</CardDescription>
                          </div>
                          <Badge
                            className={
                              expert.available
                                ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                                : 'border border-zinc-300 bg-zinc-100 text-zinc-600'
                            }
                          >
                            {expert.available ? 'Accepting jobs' : 'Not accepting jobs'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="border border-zinc-200 bg-zinc-50 p-3">
                            <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#878D89]">Experience</p>
                            <p className="mt-2 font-semibold">{expert.yearsOfExperience} years</p>
                          </div>
                          <div className="border border-zinc-200 bg-zinc-50 p-3">
                            <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#878D89]">Status</p>
                            <p className="mt-2 font-semibold">{expert.available ? 'Accepting' : 'Paused'}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm leading-relaxed text-[#5F6562]">
                          {expert.bio ?? 'This expert is available for active jobs and can be contacted immediately.'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {expert.expertiseAreas.map((area) => (
                            <Badge key={area} variant="outline" className="border-zinc-200 bg-white text-[#5F6562]">
                              {area}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          type="button"
                          className="w-full bg-black text-white hover:bg-zinc-800"
                          onClick={(event) => {
                            event.stopPropagation()
                            navigate(`/messages/${expert.expertId}`)
                          }}
                        >
                          Chat with expert
                        </Button>
                      </CardContent>
                    </Card>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    )
  }

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
              <p className="mt-2 font-mono text-sm tracking-wide">UF-U-2026</p>
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
