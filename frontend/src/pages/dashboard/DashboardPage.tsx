import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Droplets, Hammer, Paintbrush, Sparkles, Zap, Wrench } from 'lucide-react'
import { Navbar } from '../../components/Navbar'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { useAvailableExperts } from '../../hooks/useAvailableExperts'
import type { AuthSession } from '../../types/auth'
import { getDashboardContent } from './strategy/roleDashboardStrategy'
import { ExpertDashboardView } from './views/ExpertDashboardView'

type DashboardPageProps = {
  session: AuthSession
}

export function DashboardPage({ session }: DashboardPageProps) {
  const [expertQuery, setExpertQuery] = useState('')
  const [requesterCoords, setRequesterCoords] = useState<{ latitude: number; longitude: number } | null>(null)
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable'>('idle')
  const hasExpertQuery = expertQuery.trim().length > 0
  const locationReadyForSearch = hasExpertQuery && locationStatus === 'granted' && requesterCoords !== null
  const searchableQuery = locationReadyForSearch ? expertQuery : ''

  const { experts, loading: expertsLoading, error: expertsError } = useAvailableExperts(searchableQuery, {
    limit: 9,
    latitude: requesterCoords?.latitude,
    longitude: requesterCoords?.longitude,
  })
  const navigate = useNavigate()

  useEffect(() => {
    const shouldPromptLocation = expertQuery.trim().length > 0 && locationStatus === 'idle'

    if (!shouldPromptLocation) {
      return
    }

    if (!navigator.geolocation) {
      setLocationStatus('unavailable')
      return
    }

    setLocationStatus('requesting')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setRequesterCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setLocationStatus('granted')
      },
      () => {
        setRequesterCoords(null)
        setLocationStatus('denied')
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
      },
    )
  }, [expertQuery, locationStatus])

  const quickLinks = [
    {
      label: 'Plumbing',
      query: 'plumbing',
      description: 'Pipe leaks, taps, drains, and sink issues',
      icon: Droplets,
      accent: 'from-cyan-50 to-white',
    },
    {
      label: 'Electrical',
      query: 'electrical',
      description: 'Wiring, panels, breakers, and fixtures',
      icon: Zap,
      accent: 'from-amber-50 to-white',
    },
    {
      label: 'Carpentry',
      query: 'carpentry',
      description: 'Repairs, fittings, mounts, and wood work',
      icon: Hammer,
      accent: 'from-zinc-50 to-white',
    },
    {
      label: 'Painting',
      query: 'painting',
      description: 'Fresh coats, touch-ups, and wall finishes',
      icon: Paintbrush,
      accent: 'from-rose-50 to-white',
    },
    {
      label: 'Cleaning',
      query: 'cleaning',
      description: 'Deep cleaning, pest control, and upkeep',
      icon: Sparkles,
      accent: 'from-emerald-50 to-white',
    },
    {
      label: 'AC Repair',
      query: 'ac repair',
      description: 'Cooling issues, servicing, and maintenance',
      icon: Wrench,
      accent: 'from-sky-50 to-white',
    },
  ]
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

        <main className="relative z-10 mx-auto w-full max-w-[1280px] px-4 py-8 md:px-6">
          <section className="mt-4 rounded-2xl border border-zinc-200/70 bg-white/70 p-6 shadow-[0_8px_32px_rgba(9,10,10,0.04)] backdrop-blur-xl md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[10px] tracking-[0.2em] text-[#878D89] uppercase">Service Discovery</p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight">Home services at your doorstep</h3>
                <p className="mt-2 text-sm text-[#5F6562]">What are you looking for?</p>
              </div>
              {expertsError && <p className="text-sm text-rose-600">{expertsError}</p>}
            </div>

            <div className="mt-5 max-w-3xl">
              <label className="mb-2 block text-xs font-mono tracking-[0.2em] text-[#878D89] uppercase" htmlFor="expert-query">
                Match experts
              </label>
              <Input
                id="expert-query"
                value={expertQuery}
                onChange={(event) => setExpertQuery(event.target.value)}
                placeholder="Type a service like electrical, plumbing, or cleaning"
                className="h-12 rounded-2xl border-zinc-300 bg-white px-5 text-base shadow-sm focus-visible:ring-emerald-400"
              />
              {hasExpertQuery && locationStatus === 'requesting' ? (
                <p className="mt-2 text-xs text-[#5F6562]">Requesting your location to narrow nearby experts…</p>
              ) : null}
              {hasExpertQuery && locationStatus === 'denied' ? (
                <p className="mt-2 text-xs text-[#5F6562]">Location access denied. Enable location to view experts in your area and nearby areas.</p>
              ) : null}
              {hasExpertQuery && locationStatus === 'unavailable' ? (
                <p className="mt-2 text-xs text-[#5F6562]">Geolocation is unavailable in this browser. Location is required to show area-based experts.</p>
              ) : null}
            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-mono tracking-[0.2em] text-[#878D89] uppercase">Quick links</p>
                <Button
                  type="button"
                  variant={!hasExpertQuery ? 'default' : 'ghost'}
                  className={!hasExpertQuery ? 'bg-black text-white hover:bg-zinc-800' : 'text-[#5F6562]'}
                  onClick={() => setExpertQuery('')}
                >
                  All experts
                </Button>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-2 pr-1">
                {quickLinks.map((link) => {
                  const isActive = expertQuery.trim().toLowerCase() === link.query
                  const Icon = link.icon

                  return (
                    <button
                      key={link.label}
                      type="button"
                      onClick={() => setExpertQuery(link.query)}
                      className={`group flex min-w-[230px] flex-1 items-stretch rounded-2xl border border-zinc-200/70 bg-gradient-to-br ${link.accent} p-0 text-left shadow-[0_8px_32px_rgba(9,10,10,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-300 ${isActive ? 'ring-2 ring-emerald-300 ring-offset-2 ring-offset-[#FCFDFC]' : ''}`}
                    >
                      <div className="flex w-full items-start gap-4 p-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-[#090A0A] shadow-sm transition-colors group-hover:text-emerald-600">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-[#090A0A]">{link.label}</p>
                              <p className="mt-1 text-sm leading-relaxed text-[#5F6562]">{link.description}</p>
                            </div>
                            {isActive && (
                              <span className="rounded-full bg-black px-2.5 py-1 text-[10px] font-mono tracking-[0.16em] text-white uppercase">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="mt-3 font-mono text-[10px] tracking-[0.18em] text-[#878D89] uppercase">
                            Tap to filter experts
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {hasExpertQuery ? (
              <>
                <div className="mt-7 flex items-center justify-between gap-3">
                  <p className="text-xs font-mono tracking-[0.2em] text-[#878D89] uppercase">Matched experts</p>
                  {locationReadyForSearch && !expertsLoading && !expertsError && experts.length > 0 ? (
                    <p className="text-sm text-[#5F6562]">{experts.length} experts found</p>
                  ) : null}
                </div>

                {!locationReadyForSearch ? (
                  <div className="mt-4 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-5 py-6 text-sm text-[#5F6562]">
                    Allow location access to show experts in your current and nearby Hyderabad areas.
                  </div>
                ) : expertsLoading ? (
                  <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="h-48 min-w-[420px] animate-pulse rounded-2xl border border-zinc-200 bg-zinc-50" />
                    ))}
                  </div>
                ) : expertsError ? (
                  <div className="mt-4 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-5 py-6 text-sm text-[#5F6562]">
                    {expertsError}
                  </div>
                ) : experts.length === 0 ? (
                  <div className="mt-4 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-5 py-6 text-sm text-[#5F6562]">
                    No matching experts were found for this query.
                  </div>
                ) : (
                  <div className="mt-4 flex snap-x gap-4 overflow-x-auto pb-3 pr-1">
                    {experts.map((expert) => (
                  <article
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
                    className="group min-w-[360px] snap-start cursor-pointer rounded-2xl border border-zinc-200/70 bg-white/85 p-4 shadow-[0_8px_32px_rgba(9,10,10,0.04)] transition-transform duration-200 hover:-translate-y-1 hover:border-emerald-300 md:min-w-[480px]"
                  >
                      <div className="flex h-full flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-mono text-[10px] tracking-[0.2em] text-[#878D89] uppercase">Expert</p>
                              <h4 className="mt-1 truncate text-xl font-semibold">{expert.fullName}</h4>
                              <p className="mt-1 text-sm text-[#5F6562]">{expert.primaryExpertise}</p>
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

                          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                              <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#878D89]">Experience</p>
                              <p className="mt-2 font-semibold">{expert.yearsOfExperience} years</p>
                            </div>
                            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                              <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-[#878D89]">Status</p>
                              <p className="mt-2 font-semibold">{expert.available ? 'Accepting' : 'Paused'}</p>
                            </div>
                          </div>

                          {expert.expertiseAreas.length > 0 ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {expert.expertiseAreas.slice(0, 4).map((area) => (
                                <Badge key={area} variant="outline" className="border-zinc-200 bg-white text-[#5F6562]">
                                  {area}
                                </Badge>
                              ))}
                            </div>
                          ) : null}
                        </div>

                        <div className="md:w-[170px] md:shrink-0">
                          <Button
                            type="button"
                            className="mt-4 w-full bg-black text-white hover:bg-zinc-800"
                            onClick={(event) => {
                              event.stopPropagation()
                              navigate(`/messages/${expert.expertId}`)
                            }}
                          >
                            Chat now
                          </Button>
                        </div>
                      </div>
                  </article>
                    ))}
                  </div>
                )}
              </>
            ) : null}
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
