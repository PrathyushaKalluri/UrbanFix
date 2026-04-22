import { useEffect, useState } from 'react'
import { Activity, ArrowLeft, BriefcaseBusiness, Clock3, MapPin, MessageSquareText, PauseCircle, PlayCircle, ShieldCheck, Star, UserRound, Zap } from 'lucide-react'
import { Navbar } from '../../../components/Navbar'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import type { AuthSession } from '../../../types/auth'
import type { ExpertProfileView } from '../strategy/expertDashboardStrategy'
import { getExpertDashboardContent } from '../strategy/expertDashboardStrategy'

const SPRING_API_BASE_URL = import.meta.env.VITE_SPRING_API_BASE_URL ?? 'http://localhost:8080'

type ExpertDashboardViewProps = {
  session: AuthSession
}

const badgeTone = (priority: 'High' | 'Medium' | 'Low') => {
  switch (priority) {
    case 'High':
      return 'border-rose-200 bg-rose-50 text-rose-700'
    case 'Medium':
      return 'border-amber-200 bg-amber-50 text-amber-700'
    default:
      return 'border-zinc-200 bg-zinc-50 text-zinc-600'
  }
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

  useEffect(() => {
    setAcceptingJobs(profile.available)
  }, [profile.available])

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
    <div className="relative min-h-screen overflow-hidden bg-[#FCFDFC] text-[#090A0A]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
        }}
      />

      <Navbar isAuthenticated onLogout={session.logout} />

      <main className="relative z-10 mx-auto grid max-w-[1440px] gap-6 px-6 py-5 xl:grid-cols-[260px_minmax(0,1fr)_320px]">
        <aside className="border border-[#EBECEB] bg-[rgba(255,255,255,0.7)] shadow-[0_8px_32px_rgba(9,10,10,0.04)] backdrop-blur-[16px]">
          <div className="border-b border-[#EBECEB] px-4 py-4">
            <p className="font-mono text-[11px] tracking-[0.18em] text-[#878D89] uppercase">Active Threads</p>
          </div>
          <div className="p-2">
            {allJobs.map((job) => (
              <button
                key={job.id}
                type="button"
                onClick={() => setSelectedJobId(job.id)}
                className={`w-full border-b border-[#EBECEB] p-4 text-left transition-colors last:border-b-0 ${selectedJob?.id === job.id ? 'bg-[#EFF6FF]/50' : 'hover:bg-[#F5F7F5]'}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded bg-[#090A0A] text-[11px] font-semibold text-white">{job.residentName.split(' ').pop()?.slice(-2)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-semibold text-[14px]">{job.residentName}</p>
                      <span className="font-mono text-[10px] text-[#2563EB] uppercase">{job.stage === 'New request' ? 'NEW' : job.stage === 'In progress' ? 'LIVE' : 'DONE'}</span>
                    </div>
                    <p className="truncate text-[13px] text-[#878D89]">{job.issue}</p>
                    <div className="mt-2 inline-flex rounded-sm border border-[#EBECEB] bg-white px-1.5 py-0.5 font-mono text-[10px] text-[#090A0A]">
                      {job.area}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="min-w-0 border border-[#EBECEB] bg-[rgba(255,255,255,0.7)] shadow-[0_8px_32px_rgba(9,10,10,0.04)] backdrop-blur-[16px]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EBECEB] px-6 py-4">
            <div>
              <p className="font-mono text-[11px] tracking-[0.18em] text-[#878D89] uppercase">Comms Matrix</p>
              <h2 className="mt-1 text-[20px] font-semibold tracking-[-0.02em]">{content.heroTitle}</h2>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={acceptingJobs ? 'border border-[#2563EB]/30 bg-[#EFF6FF] text-[#1D4ED8]' : 'border border-[#EBECEB] bg-white text-[#878D89]'}>
                {acceptingJobs ? 'SYS SECURE' : 'SYS PAUSED'}
              </Badge>
              <Button type="button" variant="outline" size="sm" onClick={handleAvailabilityToggle} disabled={savingAvailability}>
                {acceptingJobs ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                {savingAvailability ? 'Saving...' : acceptingJobs ? 'Pause availability' : 'Resume availability'}
              </Button>
            </div>
          </div>

          {availabilityError ? (
            <div className="border-b border-rose-200 bg-rose-50 px-6 py-3 text-sm text-rose-700">
              {availabilityError}
            </div>
          ) : null}

          <div className="px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EBECEB] pb-5">
              <div>
                <p className="font-mono text-[10px] tracking-[0.2em] text-[#878D89] uppercase">Current selection</p>
                <h3 className="mt-2 text-2xl font-bold tracking-tight">{selectedJob?.issue ?? 'Select a thread'}</h3>
                <p className="mt-2 text-sm text-[#5F6562]">{selectedJob ? `${selectedJob.residentName} · ${selectedJob.area}` : 'Open a request to view the stream and decide the next action.'}</p>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-[#878D89] uppercase">
                <Zap className="h-4 w-4 text-[#2563EB]" />
                Live stream
              </div>
            </div>

            <div className="mt-5 space-y-5">
              <div className="flex justify-center">
                <span className="bg-white px-2 font-mono text-[11px] tracking-[0.18em] text-[#878D89] uppercase">[SYSTEM] ROUTE READY : 10:15 AM</span>
              </div>

              <div className="flex justify-start">
                <div className="max-w-[72%] bg-[#EFF6FF] p-3 text-[15px] leading-[1.6] text-[#090A0A]">
                  {selectedJob?.note ?? 'Choose a request to see a resident note and context.'}
                </div>
              </div>

              <div className="flex justify-end">
                <div className="max-w-[72%] bg-[#F5F7F5] p-3 text-[15px] leading-[1.6] text-[#090A0A]">
                  {selectedJob ? `Routing to ${selectedJob.residentName}. Use the buttons below to accept or decline.` : 'Open a request to continue.'}
                </div>
              </div>

              <div className="flex justify-center">
                <span className="bg-white px-2 font-mono text-[11px] tracking-[0.18em] text-[#878D89] uppercase">[SYSTEM] STATUS : {acceptingJobs ? 'ACCEPTING JOBS' : 'PAUSED'}</span>
              </div>
            </div>

            <div className="mt-6 border-t border-[#EBECEB] pt-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.18em] text-[#878D89] uppercase">Recent chats</p>
                  <p className="mt-1 text-sm text-[#5F6562]">Pick up a resident thread, review the latest messages, and reply inline.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" onClick={() => selectedJob && setSelectedJobId(selectedJob.id)}>
                    Accept
                  </Button>
                  <Button type="button" variant="secondary" size="sm" onClick={() => selectedJob && setSelectedJobId(selectedJob.id)}>
                    Decline
                  </Button>
                </div>
              </div>

              <div className="mt-4 border border-[#EBECEB] bg-white p-4">
                <textarea
                  className="min-h-28 w-full resize-none border-none bg-transparent text-[15px] outline-none placeholder:text-[#878D89]"
                  placeholder="Transmit update..."
                  rows={4}
                />
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-mono text-[10px] tracking-[0.18em] text-[#878D89] uppercase">Encrypted P2P</span>
                  <Button type="button" size="sm">Send</Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-6 border border-[#EBECEB] bg-[rgba(255,255,255,0.7)] p-0 shadow-[0_8px_32px_rgba(9,10,10,0.04)] backdrop-blur-[16px]">
          <div className="border-b border-[#EBECEB] px-4 py-4">
            <p className="font-mono text-[11px] tracking-[0.18em] text-[#878D89] uppercase">Job Telemetry</p>
          </div>

          <div className="space-y-5 px-4 pb-4">
            <div className="border-l-2 border-[#EBECEB] pl-4">
              <p className="font-mono text-[13px] text-[#878D89] mb-1">Availability</p>
              <p className="text-[22px] font-semibold tracking-tight">{acceptingJobs ? 'Connected' : 'Paused'}</p>
            </div>
            <div className="border-l-2 border-[#EBECEB] pl-4">
              <p className="font-mono text-[13px] text-[#878D89] mb-1">ETA window</p>
              <p className="text-[22px] font-semibold tracking-tight">14m</p>
            </div>
            <div className="border-l-2 border-[#EBECEB] pl-4">
              <p className="font-mono text-[13px] text-[#878D89] mb-1">Rate</p>
              <p className="text-[22px] font-semibold tracking-tight">98.2%</p>
            </div>

            <div className="w-full border border-[#EBECEB] bg-[#FCFDFC] p-3">
              <div className="mb-3 flex items-center justify-between text-[13px] uppercase tracking-[0.05em] text-[#878D89]">
                <span>Profile</span>
                <span className="font-mono text-[#2563EB]">LIVE</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-[#EBECEB] bg-white p-3">
                  <p className="font-mono text-[12px] text-[#878D89] mb-1">Expertise</p>
                  <p className="text-[13px] font-semibold">{profile.primaryExpertise}</p>
                </div>
                <div className="border border-[#EBECEB] bg-white p-3">
                  <p className="font-mono text-[12px] text-[#878D89] mb-1">Experience</p>
                  <p className="text-[13px] font-semibold">{profile.yearsOfExperience} years</p>
                </div>
                <div className="border border-[#EBECEB] bg-white p-3 col-span-2">
                  <p className="font-mono text-[12px] text-[#878D89] mb-1">Working areas</p>
                  <p className="text-[13px] leading-[1.5] text-[#090A0A]">{profile.expertiseAreas.join(', ')}</p>
                </div>
              </div>
            </div>

            <div className="border border-[#EBECEB] bg-white p-3">
              <p className="font-mono text-[13px] text-[#878D89] mb-2 uppercase tracking-[0.05em]">Recent chats</p>
              <div className="space-y-3">
                {content.conversations.slice(0, 3).map((conversation) => (
                  <div key={conversation.id} className="flex items-start justify-between gap-2 border-b border-[#EBECEB] pb-3 last:border-b-0 last:pb-0">
                    <div>
                      <p className="text-[13px] font-semibold">{conversation.name}</p>
                      <p className="mt-1 text-[13px] text-[#5F6562]">{conversation.preview}</p>
                    </div>
                    <span className="font-mono text-[11px] text-[#878D89]">{conversation.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}