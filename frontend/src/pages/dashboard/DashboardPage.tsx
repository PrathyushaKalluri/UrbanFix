import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Droplets, Hammer, Paintbrush, Sparkles, Zap, Wrench } from 'lucide-react'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'

import {
  AmbientBackground,
  GlassCard,
  GradientButton,
  ModernNavbar,
  SectionLabel,
} from '../../components/design-system'

import { HYDERABAD_AREAS } from '../../config/hyderabadAreas'
import { useAvailableExperts } from '../../hooks/useAvailableExperts'
import type { AuthSession } from '../../types/auth'
import { getDashboardContent } from './strategy/roleDashboardStrategy'
import { ExpertDashboardView } from './views/ExpertDashboardView'

type DashboardPageProps = {
  session: AuthSession
}

export function DashboardPage({ session }: DashboardPageProps) {
  const [expertQuery, setExpertQuery] = useState('')
  const [selectedAreaName, setSelectedAreaName] = useState('')
  const hasExpertQuery = expertQuery.trim().length > 0
  const selectedArea = useMemo(
    () => HYDERABAD_AREAS.find((area) => area.name === selectedAreaName) ?? null,
    [selectedAreaName],
  )
  const areaReadyForSearch = hasExpertQuery && selectedArea !== null
  const searchableQuery = areaReadyForSearch ? expertQuery : ''

  const { experts, loading: expertsLoading, error: expertsError } = useAvailableExperts(searchableQuery, {
    latitude: selectedArea?.latitude,
    longitude: selectedArea?.longitude,
  })
  const navigate = useNavigate()

  useEffect(() => {
    if (session.profile?.role === 'EXPERT') {
      document.title = 'UrbanFix | Expert Dashboard'
      return
    }
    document.title = 'UrbanFix | Dashboard'
  }, [session.profile?.role])

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
      accent: 'from-blue-50 to-white',
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
      <div className="relative min-h-screen overflow-hidden bg-[#fafafa] text-zinc-900">
        <AmbientBackground />
        <main className="relative z-10 flex min-h-screen items-center justify-center px-6 py-10">
          <GlassCard className="mx-auto max-w-3xl p-8">
            <SectionLabel variant="blue">Loading</SectionLabel>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">Restoring your session…</h1>
            <p className="mt-2 text-sm text-zinc-500">Checking your token and loading your role.</p>
          </GlassCard>
        </main>
      </div>
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
      <div className="relative min-h-screen overflow-hidden bg-[#fafafa] text-zinc-900">
        <AmbientBackground />
        <ModernNavbar isAuthenticated onLogout={session.logout} />

        <main className="relative z-10 mx-auto w-full max-w-[1280px] px-4 py-8 pt-24 md:px-6">
          <GlassCard className="mt-4 p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <SectionLabel variant="blue">Service Discovery</SectionLabel>
                <h3 className="mt-2 text-2xl font-bold tracking-tight">Home services at your doorstep</h3>
                <p className="mt-2 text-sm text-zinc-500">What are you looking for?</p>
              </div>
              {expertsError && <p className="text-sm text-rose-600">{expertsError}</p>}
            </div>

            <div className="mt-5 max-w-3xl">
              <label className="mb-2 block" htmlFor="expert-query">
                <SectionLabel>Match experts</SectionLabel>
              </label>
              <Input
                id="expert-query"
                value={expertQuery}
                onChange={(event) => setExpertQuery(event.target.value)}
                placeholder="Type a service like electrical, plumbing, or cleaning"
                className="h-12 rounded-2xl border-zinc-200/80 bg-white/85 px-5 text-base shadow-sm transition-all focus-visible:border-blue-300/70 focus-visible:bg-white focus-visible:ring-0 focus-visible:shadow-[0_0_0_3px_rgba(59,130,246,0.12)]"
              />
              <label className="mt-4 mb-2 block" htmlFor="service-area">
                <SectionLabel>Service area</SectionLabel>
              </label>
              <select
                id="service-area"
                value={selectedAreaName}
                onChange={(event) => setSelectedAreaName(event.target.value)}
                className="h-12 w-full rounded-2xl border border-zinc-200/80 bg-white/85 px-5 text-base text-zinc-900 shadow-sm transition-all focus-visible:border-blue-300/70 focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_rgba(59,130,246,0.12)]"
              >
                <option value="">Select a Hyderabad area</option>
                {HYDERABAD_AREAS.map((area) => (
                  <option key={area.name} value={area.name}>
                    {area.name}
                  </option>
                ))}
              </select>
              {hasExpertQuery && !selectedArea ? (
                <p className="mt-2 text-xs text-zinc-500">Choose the Hyderabad area where you want the service before matching experts.</p>
              ) : null}

              {selectedArea ? (
                <p className="mt-2 text-xs text-zinc-500">
                  Showing experts for {selectedArea.name} and nearby Hyderabad areas.
                </p>
              ) : null}
            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <SectionLabel>Quick links</SectionLabel>
                <Button
                  type="button"
                  variant={!hasExpertQuery ? 'default' : 'ghost'}
                  className={!hasExpertQuery ? 'bg-zinc-900 text-white hover:bg-zinc-800' : 'text-zinc-500'}
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
                      className={`group flex min-w-[230px] flex-1 items-stretch rounded-2xl border border-white/50 bg-gradient-to-br ${link.accent} p-0 text-left shadow-[0_4px_24px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300/50 hover:shadow-[0_8px_32px_rgba(59,130,246,0.08)] ${isActive ? 'ring-2 ring-blue-300 ring-offset-2 ring-offset-[#fafafa]' : ''}`}
                    >
                      <div className="flex w-full items-start gap-4 p-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-zinc-900 shadow-sm transition-colors group-hover:text-blue-600">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-zinc-900">{link.label}</p>
                              <p className="mt-1 text-sm leading-relaxed text-zinc-500">{link.description}</p>
                            </div>
                            {isActive && (
                              <span className="rounded-full bg-blue-500 px-2.5 py-1 text-[10px] font-semibold tracking-[0.16em] text-white uppercase">
                                Active
                              </span>
                            )}
                          </div>
                          <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
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
                  <SectionLabel>Matched experts</SectionLabel>
                  {areaReadyForSearch && !expertsLoading && !expertsError && experts.length > 0 ? (
                    <p className="text-sm text-zinc-500">{experts.length} experts found</p>
                  ) : null}
                </div>

                {!areaReadyForSearch ? (
                  <div className="mt-4 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/70 px-5 py-6 text-sm text-zinc-500">
                    Select a Hyderabad area to show experts in that area and nearby locations.
                  </div>
                ) : expertsLoading ? (
                  <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="h-48 min-w-[420px] animate-pulse rounded-2xl border border-zinc-200/70 bg-zinc-50/70" />
                    ))}
                  </div>
                ) : expertsError ? (
                  <div className="mt-4 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/70 px-5 py-6 text-sm text-zinc-500">
                    {expertsError}
                  </div>
                ) : experts.length === 0 ? (
                  <div className="mt-4 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/70 px-5 py-6 text-sm text-zinc-500">
                    No matching experts were found for this query.
                  </div>
                ) : (
                  <div className="mt-4 grid gap-4 pb-3 pr-1">
                    {experts.map((expert) => (
                      <GlassCard
                        key={expert.expertId}
                        hover
                        className="group min-w-[360px] snap-start cursor-pointer p-4 hover:border-blue-300/50 md:min-w-[480px]"
                      >
                        <div className="flex h-full flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <SectionLabel>Expert</SectionLabel>
                                <h4 className="mt-1 truncate text-xl font-semibold">{expert.fullName}</h4>
                                <p className="mt-1 text-sm text-zinc-500">{expert.primaryExpertise}</p>
                              </div>
                              <Badge
                                className={
                                  expert.available
                                    ? 'border border-blue-200 bg-blue-50 text-blue-700'
                                    : 'border border-zinc-200 bg-zinc-50 text-zinc-500'
                                }
                              >
                                {expert.available ? 'Accepting jobs' : 'Not accepting jobs'}
                              </Badge>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                              <div className="rounded-xl border border-zinc-200/70 bg-zinc-50/70 p-3">
                                <SectionLabel>Experience</SectionLabel>
                                <p className="mt-2 font-semibold">{expert.yearsOfExperience} years</p>
                              </div>
                              <div className="rounded-xl border border-zinc-200/70 bg-zinc-50/70 p-3">
                                <SectionLabel>Status</SectionLabel>
                                <p className="mt-2 font-semibold">{expert.available ? 'Accepting' : 'Paused'}</p>
                              </div>
                            </div>

                            {expert.expertiseAreas.length > 0 ? (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {expert.expertiseAreas.slice(0, 4).map((area) => (
                                  <Badge key={area} variant="outline" className="border-zinc-200/70 bg-white/80 text-zinc-500">
                                    {area}
                                  </Badge>
                                ))}
                              </div>
                            ) : null}
                          </div>

                          <div className="md:w-[170px] md:shrink-0">
                            <GradientButton
                              size="sm"
                              className="mt-4 w-full"
                              showSparkles={false}
                              onClick={() => navigate(`/messages/${expert.expertId}`)}
                            >
                              Chat now
                            </GradientButton>
                          </div>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                )}
              </>
            ) : null}
          </GlassCard>
        </main>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fafafa] text-zinc-900">
      <AmbientBackground />
      <ModernNavbar isAuthenticated onLogout={session.logout} />

      <main className="relative z-10 mx-auto grid max-w-7xl gap-6 px-6 py-8 pt-24 md:grid-cols-[1.3fr_1fr]">
        <GlassCard className="p-6 md:p-8">
          <div className="mb-8 flex flex-wrap items-start justify-between gap-5 border-b border-zinc-200/70 pb-6">
            <div>
              <SectionLabel>Session Active</SectionLabel>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">Welcome, {session.profile.fullName}</h2>
              <p className="mt-2 text-sm text-zinc-500">{session.profile.email}</p>
            </div>
            <span className="rounded-xl border border-blue-200/50 bg-blue-50/60 px-3 py-2 text-[11px] font-semibold tracking-wider text-blue-700 uppercase">
              {roleLabel}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <article className="rounded-xl border border-zinc-200/70 bg-white/60 p-4">
              <SectionLabel>Role</SectionLabel>
              <p className="mt-2 text-sm font-semibold">{session.profile.role}</p>
            </article>
            <article className="rounded-xl border border-zinc-200/70 bg-white/60 p-4">
              <SectionLabel>Status</SectionLabel>
              <p className="mt-2 text-sm font-semibold">Authenticated</p>
            </article>
            <article className="rounded-xl border border-zinc-200/70 bg-white/60 p-4">
              <SectionLabel>Node ID</SectionLabel>
              <p className="mt-2 text-sm font-semibold">UF-U-2026</p>
            </article>
          </div>
        </GlassCard>

        <GlassCard className="p-6 md:p-8">
          <SectionLabel>Next Action</SectionLabel>
          <h3 className="mt-3 text-xl font-bold tracking-tight">Operational Brief</h3>
          <p className="mt-3 text-sm leading-relaxed text-zinc-500">{roleCopy.body}</p>

          <div className="mt-8 border-t border-zinc-200/70 pt-5">
            <SectionLabel>Assigned Persona</SectionLabel>
            <p className="mt-2 text-sm font-semibold tracking-wide text-zinc-800">{roleCopy.accent}</p>
          </div>

          <GradientButton
            className="mt-8 w-full"
            showSparkles={false}
            onClick={session.logout}
          >
            End Session
          </GradientButton>
        </GlassCard>
      </main>
    </div>
  )
}
