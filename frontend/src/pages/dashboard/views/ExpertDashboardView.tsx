import { useEffect, useState } from 'react'
import {
  Activity,
  BriefcaseBusiness,
  Clock3,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  MessageSquareText,
  PauseCircle,
  PlayCircle,
  Settings,
  ShieldCheck,
  Star,
  UserRound,
  Zap,
} from 'lucide-react'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import type { AuthSession } from '../../../types/auth'
import type { ExpertProfileView } from '../strategy/expertDashboardStrategy'
import { getExpertDashboardContent } from '../strategy/expertDashboardStrategy'
import {
  AmbientBackground,
  CollapsibleSidebar,
  GlassCard,
  SectionLabel,
} from '../../../components/design-system'

const SPRING_API_BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL ?? 'http://localhost:8080'

const expertNavItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Messages', icon: MessageSquare, href: '/messages/1' },
  { label: 'Settings', icon: Settings, href: '/profile' },
]

type ExpertDashboardViewProps = {
  session: AuthSession
}

export function ExpertDashboardView({ session }: ExpertDashboardViewProps) {
  const profile = {
    fullName: session.profile?.fullName ?? 'Expert',
    email: session.profile?.email ?? '',
    role: 'EXPERT' as const,
    primaryExpertise: session.profile?.primaryExpertise ?? 'General Services',
    yearsOfExperience: session.profile?.yearsOfExperience ?? 0,
    expertiseAreas: session.profile?.expertiseAreas ?? [],
    available: session.profile?.available ?? true,
  } satisfies ExpertProfileView

  const content = getExpertDashboardContent(profile)
  const [acceptingJobs, setAcceptingJobs] = useState(profile.available)
  const [savingAvailability, setSavingAvailability] = useState(false)
  const [availabilityError, setAvailabilityError] = useState('')
  const [selectedJobId, setSelectedJobId] = useState(
    content.newRequests[0]?.id ?? content.activeJobs[0]?.id ?? content.completedJobs[0]?.id ?? '',
  )
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date()
    return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  })

  useEffect(() => {
    setAcceptingJobs(profile.available)
  }, [profile.available])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const allJobs = [...content.newRequests, ...content.activeJobs, ...content.completedJobs]
  const selectedJob = allJobs.find((job) => job.id === selectedJobId) ?? allJobs[0]

  const handleAvailabilityToggle = async () => {
    const nextAvailability = !acceptingJobs
    const token = localStorage.getItem('authToken')

    if (!token) {
      return
    }

    setAcceptingJobs(nextAvailability)
    setAvailabilityError('')
    setSavingAvailability(true)

    try {
      const response = await fetch(`${SPRING_API_BASE_URL}/api/auth/me/availability`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ available: nextAvailability }),
      })

      if (!response.ok) {
        const fallbackMessage = 'Unable to update availability right now.'
        const responseText = await response.text()

        throw new Error(responseText.trim() || fallbackMessage)
      }

      const updatedProfile = (await response.json()) as { available?: boolean }
      setAcceptingJobs(updatedProfile.available ?? nextAvailability)
      try {
        await session.refreshProfile?.()
      } catch {
        setAvailabilityError('Saved, but the session view could not refresh.')
      }
    } catch (error) {
      setAcceptingJobs(!nextAvailability)
      setAvailabilityError(error instanceof Error ? error.message : 'Unable to update availability right now.')
    } finally {
      setSavingAvailability(false)
    }
  }

  return (
    <div className="relative h-screen overflow-hidden bg-[#fafafa] text-zinc-900">
      <AmbientBackground />

      <CollapsibleSidebar
        userName={profile.fullName}
        userRole="Specialist"
        onLogout={session.logout}
        items={expertNavItems}
      />

      <main className="relative z-10 mx-auto flex h-full max-w-7xl flex-col px-4 md:ml-[240px] md:px-8 md:py-5">
        {/* Top bar */}
        <div className="mb-6 flex shrink-0 items-center justify-between gap-4">
          <div>
            <SectionLabel variant="mono">Comms Matrix</SectionLabel>
            <h1 className="mt-1 text-xl font-semibold tracking-tight">{content.heroTitle}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={
                acceptingJobs
                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                  : 'border-zinc-200 bg-white text-zinc-500'
              }
            >
              {acceptingJobs ? 'SYS SECURE' : 'SYS PAUSED'}
            </Badge>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAvailabilityToggle}
              disabled={savingAvailability}
            >
              {acceptingJobs ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
              {savingAvailability ? 'Saving…' : acceptingJobs ? 'Pause availability' : 'Resume availability'}
            </Button>
          </div>
        </div>

        {availabilityError ? (
          <div className="mb-4 shrink-0 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {availabilityError}
          </div>
        ) : null}

        {/* Main grid: message center | right stacked panels */}
        <div className="grid flex-1 min-h-0 grid-rows-[1fr] gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Center — Comms Matrix */}
          <GlassCard className="flex min-h-0 flex-col overflow-hidden p-0" hover={false}>
            <div className="shrink-0 border-b border-zinc-100/60 px-6 py-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <SectionLabel variant="mono">Current selection</SectionLabel>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900">
                    {selectedJob?.issue ?? 'Select a thread'}
                  </h2>
                  <p className="mt-2 text-sm text-zinc-500">
                    {selectedJob
                      ? `${selectedJob.residentName} · ${selectedJob.area}`
                      : 'Open a request to view the stream and decide the next action.'}
                  </p>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500 uppercase">
                  <Zap className="h-4 w-4 text-blue-500" />
                  Live stream
                </div>
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="min-h-0 flex-1 overflow-y-auto space-y-5 px-6 pt-6">
                <div className="flex justify-center">
                  <span className="bg-white px-2 font-mono text-[11px] tracking-[0.18em] text-zinc-400 uppercase">
                    [SYSTEM] ROUTE READY : {currentTime}
                  </span>
                </div>

                <div className="flex justify-start">
                  <div className="max-w-[72%] rounded-2xl rounded-tl-md bg-blue-50 p-3 text-[15px] leading-[1.6] text-zinc-900">
                    {selectedJob?.note ?? 'Choose a request to see a resident note and context.'}
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="max-w-[72%] rounded-2xl rounded-tr-md bg-zinc-100 p-3 text-[15px] leading-[1.6] text-zinc-900">
                    {selectedJob
                      ? `Routing to ${selectedJob.residentName}. Use the buttons below to accept or decline.`
                      : 'Open a request to continue.'}
                  </div>
                </div>

                <div className="flex justify-center">
                  <span className="bg-white px-2 font-mono text-[11px] tracking-[0.18em] text-zinc-400 uppercase">
                    [SYSTEM] STATUS : {acceptingJobs ? 'ACCEPTING JOBS' : 'PAUSED'}
                  </span>
                </div>
              </div>

              <div className="shrink-0 border-t border-zinc-100/60 px-6 pb-6 pt-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <SectionLabel variant="mono">Recent chats</SectionLabel>
                    <p className="mt-1 text-sm text-zinc-500">
                      Pick up a resident thread, review the latest messages, and reply inline.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => selectedJob && setSelectedJobId(selectedJob.id)}
                    >
                      Accept
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => selectedJob && setSelectedJobId(selectedJob.id)}
                    >
                      Decline
                    </Button>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-200/70 bg-white p-4">
                  <textarea
                    className="min-h-28 w-full resize-none border-none bg-transparent text-[15px] outline-none placeholder:text-zinc-400"
                    placeholder="Transmit update…"
                    rows={4}
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-mono text-[10px] tracking-[0.18em] text-zinc-400 uppercase">
                      Encrypted P2P
                    </span>
                    <Button type="button" size="sm">
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Right — Active Threads + Telemetry */}
          <div className="flex min-h-0 flex-col gap-6">
            {/* Active Threads */}
            <GlassCard className="flex min-h-0 flex-1 flex-col overflow-hidden p-0" hover={false}>
              <div className="shrink-0 border-b border-zinc-100/60 px-4 py-4">
                <SectionLabel variant="mono">Active Threads</SectionLabel>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {allJobs.map((job) => (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => setSelectedJobId(job.id)}
                    className={`w-full border-b border-zinc-100/60 p-4 text-left transition-colors last:border-b-0 ${
                      selectedJob?.id === job.id ? 'bg-blue-50/50' : 'hover:bg-zinc-50/60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[11px] font-semibold text-white">
                        {job.residentName.split(' ').pop()?.slice(-2)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate font-semibold text-[14px] text-zinc-900">
                            {job.residentName}
                          </p>
                          <span className="font-mono text-[10px] text-blue-600 uppercase">
                            {job.stage === 'New request'
                              ? 'NEW'
                              : job.stage === 'In progress'
                                ? 'LIVE'
                                : 'DONE'}
                          </span>
                        </div>
                        <p className="truncate text-[13px] text-zinc-500">{job.issue}</p>
                        <div className="mt-2 inline-flex rounded-sm border border-zinc-200/70 bg-white px-1.5 py-0.5 font-mono text-[10px] text-zinc-700">
                          {job.area}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </GlassCard>

            {/* Telemetry */}
            <GlassCard className="flex min-h-0 flex-1 flex-col overflow-hidden p-0" hover={false}>
              <div className="shrink-0 border-b border-zinc-100/60 px-4 py-4">
                <SectionLabel variant="mono">Job Telemetry</SectionLabel>
              </div>
              <div className="flex-1 overflow-y-auto space-y-5 px-4 py-4">
                <div className="border-l-2 border-zinc-200/70 pl-4">
                  <p className="mb-1 font-mono text-[13px] text-zinc-500">Availability</p>
                  <p className="text-[22px] font-semibold tracking-tight text-zinc-900">
                    {acceptingJobs ? 'Connected' : 'Paused'}
                  </p>
                </div>
                <div className="border-l-2 border-zinc-200/70 pl-4">
                  <p className="mb-1 font-mono text-[13px] text-zinc-500">ETA window</p>
                  <p className="text-[22px] font-semibold tracking-tight text-zinc-900">14m</p>
                </div>
                <div className="border-l-2 border-zinc-200/70 pl-4">
                  <p className="mb-1 font-mono text-[13px] text-zinc-500">Rate</p>
                  <p className="text-[22px] font-semibold tracking-tight text-zinc-900">98.2%</p>
                </div>

                <div className="w-full rounded-lg border border-zinc-200/70 bg-zinc-50/60 p-3">
                  <div className="mb-3 flex items-center justify-between text-[13px] uppercase tracking-[0.05em] text-zinc-500">
                    <span>Profile</span>
                    <span className="font-mono text-blue-600">LIVE</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-md border border-zinc-200/70 bg-white p-3">
                      <p className="mb-1 font-mono text-[12px] text-zinc-500">Expertise</p>
                      <p className="text-[13px] font-semibold text-zinc-900">
                        {profile.primaryExpertise}
                      </p>
                    </div>
                    <div className="rounded-md border border-zinc-200/70 bg-white p-3">
                      <p className="mb-1 font-mono text-[12px] text-zinc-500">Experience</p>
                      <p className="text-[13px] font-semibold text-zinc-900">
                        {profile.yearsOfExperience} years
                      </p>
                    </div>
                    <div className="col-span-2 rounded-md border border-zinc-200/70 bg-white p-3">
                      <p className="mb-1 font-mono text-[12px] text-zinc-500">Working areas</p>
                      <p className="text-[13px] leading-[1.5] text-zinc-900">
                        {profile.expertiseAreas.join(', ')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-zinc-200/70 bg-white p-3">
                  <p className="mb-2 font-mono text-[13px] uppercase tracking-[0.05em] text-zinc-500">
                    Recent chats
                  </p>
                  <div className="space-y-3">
                    {content.conversations.slice(0, 3).map((conversation) => (
                      <div
                        key={conversation.id}
                        className="flex items-start justify-between gap-2 border-b border-zinc-100/60 pb-3 last:border-b-0 last:pb-0"
                      >
                        <div>
                          <p className="text-[13px] font-semibold text-zinc-900">
                            {conversation.name}
                          </p>
                          <p className="mt-1 text-[13px] text-zinc-500">
                            {conversation.preview}
                          </p>
                        </div>
                        <span className="font-mono text-[11px] text-zinc-400">
                          {conversation.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  )
}
