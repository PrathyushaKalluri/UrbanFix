import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  Droplets,
  Hammer,
  Paintbrush,
  Sparkles,
  Zap,
  Wrench,
  MessageCircle,
  Clock,
  Briefcase,
  MapPin,
  Star,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Combobox } from '../../components/ui/combobox'
import { fetchOrCreateConversationWithExpert } from '../../services/messagingApi'

import {
  AmbientBackground,
  GlassCard,
  GradientButton,
  CollapsibleSidebar,
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

function normalizeExpertiseAreas(areas: string[]): string[] {
  const result: string[] = []
  for (const area of areas) {
    if (!area || typeof area !== 'string') continue
    const trimmed = area.trim()
    if (!trimmed || trimmed.toLowerCase() === 'true') continue
    // If backend returns comma-separated string in one array element, split it
    if (trimmed.includes(',')) {
      for (const part of trimmed.split(',')) {
        const p = part.trim()
        if (p && p.toLowerCase() !== 'true') result.push(p)
      }
    } else {
      result.push(trimmed)
    }
  }
  return [...new Set(result)].slice(0, 6)
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
    },
    {
      label: 'Electrical',
      query: 'electrical',
      description: 'Wiring, panels, breakers, and fixtures',
      icon: Zap,
    },
    {
      label: 'Carpentry',
      query: 'carpentry',
      description: 'Repairs, fittings, mounts, and wood work',
      icon: Hammer,
    },
    {
      label: 'Painting',
      query: 'painting',
      description: 'Fresh coats, touch-ups, and wall finishes',
      icon: Paintbrush,
    },
    {
      label: 'Cleaning',
      query: 'cleaning',
      description: 'Deep cleaning, pest control, and upkeep',
      icon: Sparkles,
    },
    {
      label: 'AC Repair',
      query: 'ac repair',
      description: 'Cooling issues, servicing, and maintenance',
      icon: Wrench,
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
        <CollapsibleSidebar
          userName={session.profile.fullName}
          userRole="Resident"
          onLogout={session.logout}
        />

        <main className="relative z-10 min-h-screen px-4 py-6 md:ml-[240px] md:px-8 md:py-8">
          {/* Hero / Search */}
          <section className="mb-8">
            <div className="mb-6">
              <SectionLabel variant="blue">Service Discovery</SectionLabel>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900">Home services at your doorstep</h1>
              <p className="mt-2 text-base text-zinc-500">What are you looking for?</p>
            </div>

            <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-center">
              <div className="flex-1">
                <Input
                  id="expert-query"
                  value={expertQuery}
                  onChange={(event) => setExpertQuery(event.target.value)}
                  placeholder="Type a service like electrical, plumbing, or cleaning"
                  className="h-12 rounded-2xl border-zinc-200/80 bg-white/85 px-5 text-base shadow-sm transition-all focus-visible:border-zinc-400/70 focus-visible:bg-white focus-visible:ring-0 focus-visible:shadow-[0_0_0_3px_rgba(0,0,0,0.06)]"
                />
              </div>
              <div className="w-full lg:w-72">
                <Combobox
                  label=""
                  placeholder="Select a Hyderabad area"
                  searchPlaceholder="Search Hyderabad areas"
                  emptyText="No Hyderabad area matches that search"
                  options={HYDERABAD_AREAS.map((area) => ({ value: area.name, label: area.name }))}
                  value={selectedAreaName}
                  onValueChange={(value) => setSelectedAreaName(value)}
                />
              </div>
            </div>

            {hasExpertQuery && !selectedArea ? (
              <p className="mt-3 text-xs text-zinc-500">
                Choose the Hyderabad area where you want the service before matching experts.
              </p>
            ) : null}
            {selectedArea ? (
              <p className="mt-3 text-xs text-zinc-500">
                Showing experts for <span className="font-medium text-zinc-700">{selectedArea.name}</span> and nearby Hyderabad areas.
              </p>
            ) : null}
            {expertsError && <p className="mt-3 text-sm text-rose-600">{expertsError}</p>}
          </section>

          {/* Quick Links */}
          <section className="mb-8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <SectionLabel>Quick links</SectionLabel>
              <Button
                type="button"
                variant={!hasExpertQuery ? 'outline' : 'ghost'}
                className={
                  !hasExpertQuery
                    ? 'rounded-xl border-zinc-200 bg-white/80 text-zinc-700 shadow-sm hover:bg-zinc-50 hover:text-zinc-900'
                    : 'text-zinc-500 hover:text-zinc-900'
                }
                onClick={() => setExpertQuery('')}
              >
                All experts
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6">
              {quickLinks.map((link) => {
                const isActive = expertQuery.trim().toLowerCase() === link.query
                const Icon = link.icon
                return (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() => setExpertQuery(link.query)}
                    className={`group relative flex flex-col items-center gap-3 rounded-2xl border p-4 text-center transition-all duration-200 ${
                      isActive
                        ? 'border-zinc-300 bg-zinc-100/80 text-zinc-900 shadow-sm'
                        : 'border-zinc-200/70 bg-white/60 text-zinc-600 shadow-[0_2px_12px_rgba(0,0,0,0.03)] backdrop-blur-sm hover:border-zinc-300 hover:bg-white/90 hover:shadow-[0_4px_20px_rgba(0,0,0,0.05)]'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute right-2 top-2 flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-zinc-400/40 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-zinc-500" />
                      </span>
                    )}
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl border transition-colors ${
                        isActive
                          ? 'border-zinc-300 bg-white text-zinc-900'
                          : 'border-zinc-200/70 bg-zinc-50/80 text-zinc-500 group-hover:text-zinc-700'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{link.label}</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-400">{link.description}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Matched Experts */}
          {hasExpertQuery ? (
            <section>
              <div className="mb-4 flex items-center justify-between gap-3">
                <SectionLabel>Matched experts</SectionLabel>
                {areaReadyForSearch && !expertsLoading && !expertsError && experts.length > 0 ? (
                  <p className="text-sm text-zinc-500">{experts.length} experts found</p>
                ) : null}
              </div>

              {!areaReadyForSearch ? (
                <GlassCard className="p-6">
                  <div className="flex items-center gap-3 text-sm text-zinc-500">
                    <MapPin className="h-4 w-4 text-zinc-400" />
                    Select a Hyderabad area to show experts in that area and nearby locations.
                  </div>
                </GlassCard>
              ) : expertsLoading ? (
                <div className="grid gap-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-32 animate-pulse rounded-2xl border border-zinc-200/70 bg-zinc-50/70"
                    />
                  ))}
                </div>
              ) : expertsError ? (
                <GlassCard className="p-6">
                  <p className="text-sm text-zinc-500">{expertsError}</p>
                </GlassCard>
              ) : experts.length === 0 ? (
                <GlassCard className="p-6">
                  <p className="text-sm text-zinc-500">No matching experts were found for this query.</p>
                </GlassCard>
              ) : (
                <div className="grid gap-3">
                  {experts.map((expert) => {
                    const tags = normalizeExpertiseAreas(expert.expertiseAreas)
                    return (
                      <GlassCard
                        key={expert.expertId}
                        hover
                        className="group cursor-pointer p-4 md:p-5"
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          {/* Left: Avatar + Name */}
                          <div className="flex items-start gap-3 md:items-center">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-200/80 bg-zinc-50 text-zinc-500">
                              <Briefcase className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="truncate text-base font-semibold text-zinc-900">
                                  {expert.fullName}
                                </h4>
                                {expert.available ? (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Available
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-50 px-2 py-0.5 text-[10px] font-semibold text-zinc-500">
                                    <XCircle className="h-3 w-3" />
                                    Busy
                                  </span>
                                )}
                              </div>
                              <p className="mt-0.5 text-sm text-zinc-500">{expert.primaryExpertise}</p>
                              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-400">
                                <span className="inline-flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {expert.yearsOfExperience} years experience
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Middle: Tags */}
                          {tags.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5 md:max-w-xs md:justify-end">
                              {tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="rounded-md border-zinc-200/70 bg-white/70 px-2 py-0.5 text-[11px] font-normal text-zinc-500"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          ) : null}

                          {/* Right: CTA */}
                          <div className="shrink-0">
                            <Button
                              size="sm"
                              className="h-10 rounded-xl bg-zinc-900 px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800"
                              onClick={async () => {
                                try {
                                  const result = await fetchOrCreateConversationWithExpert(expert.userId)
                                  navigate(`/messages/${result.conversationId}`)
                                } catch {
                                  // fallback: navigate without conversation id
                                  navigate('/messages')
                                }
                              }}
                            >
                              <MessageCircle className="mr-1.5 h-4 w-4" />
                              Chat now
                            </Button>
                          </div>
                        </div>
                      </GlassCard>
                    )
                  })}
                </div>
              )}
            </section>
          ) : null}
        </main>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fafafa] text-zinc-900">
      <AmbientBackground />
      <CollapsibleSidebar
        userName={session.profile.fullName}
        userRole={session.profile.role === 'EXPERT' ? 'Specialist' : 'Resident'}
        onLogout={session.logout}
      />

      <main className="relative z-10 mx-auto grid max-w-7xl gap-6 px-4 py-6 transition-all duration-300 md:ml-[240px] md:grid-cols-[1.3fr_1fr] md:px-6 md:py-8">
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
