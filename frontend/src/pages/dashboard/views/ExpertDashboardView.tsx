import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Clock3,
  LayoutDashboard,
  MessageSquare,
  PauseCircle,
  PlayCircle,
  Settings,
  Star,
  TrendingUp,
  Users,
  Zap,
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Progress } from '../../../components/ui/progress'
import { Separator } from '../../../components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../../components/ui/tooltip'
import type { AuthSession } from '../../../types/auth'
import {
  AmbientBackground,
  CollapsibleSidebar,
  GlassCard,
  SectionLabel,
} from '../../../components/design-system'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'

const expertNavItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Messages', icon: MessageSquare, href: '/messages' },
  { label: 'Settings', icon: Settings, href: '/profile' },
]

type ExpertDashboardViewProps = {
  session: AuthSession
}

// Mock weekly data — in production this would come from an API
const weeklyActivity = [
  { day: 'Mon', accepted: 3, completed: 2 },
  { day: 'Tue', accepted: 5, completed: 4 },
  { day: 'Wed', accepted: 2, completed: 3 },
  { day: 'Thu', accepted: 4, completed: 3 },
  { day: 'Fri', accepted: 6, completed: 5 },
  { day: 'Sat', accepted: 8, completed: 7 },
  { day: 'Sun', accepted: 4, completed: 4 },
]

const jobStatusData = [
  { name: 'New', value: 2, color: '#3b82f6' },
  { name: 'In Progress', value: 3, color: '#f59e0b' },
  { name: 'Completed', value: 12, color: '#10b981' },
  { name: 'Cancelled', value: 1, color: '#ef4444' },
]

const responseTrend = [
  { day: 'Mon', seconds: 180 },
  { day: 'Tue', seconds: 150 },
  { day: 'Wed', seconds: 200 },
  { day: 'Thu', seconds: 120 },
  { day: 'Fri', seconds: 90 },
  { day: 'Sat', seconds: 110 },
  { day: 'Sun', seconds: 85 },
]

const recentNotifications = [
  { id: 1, title: 'New job request', body: 'Resident 001 needs plumbing in Baner', time: '5 min ago', read: false },
  { id: 2, title: 'Job completed', body: 'Fan wiring fix marked as done', time: '2h ago', read: true },
  { id: 3, title: 'Rating received', body: 'Resident 008 gave you 5 stars', time: '4h ago', read: true },
  { id: 4, title: 'Reminder', body: 'AC service scheduled for tomorrow', time: '1d ago', read: true },
]

const activeJobsList = [
  { id: 'job-1', resident: 'Resident 021', issue: 'AC cooling drop', area: 'Kothrud', status: 'in_progress', priority: 'High' },
  { id: 'job-2', resident: 'Resident 033', issue: 'Door lock replacement', area: 'Wakad', status: 'in_progress', priority: 'Low' },
  { id: 'req-1', resident: 'Resident 001', issue: 'Kitchen sink leak', area: 'Baner', status: 'new', priority: 'High' },
  { id: 'req-2', resident: 'Resident 014', issue: 'Circuit breaker trip', area: 'Hinjewadi', status: 'new', priority: 'Medium' },
]

function formatSeconds(sec: number): string {
  if (sec < 60) return `${sec}s`
  if (sec < 3600) return `${Math.round(sec / 60)}m`
  return `${Math.round(sec / 3600)}h`
}

export function ExpertDashboardView({ session }: ExpertDashboardViewProps) {
  const navigate = useNavigate()
  const profile = session.profile
  const [acceptingJobs, setAcceptingJobs] = useState(profile?.available ?? true)
  const [savingAvailability, setSavingAvailability] = useState(false)
  const [availabilityError, setAvailabilityError] = useState('')

  const stats = useMemo(() => {
    const totalJobs = profile?.totalJobs ?? 0
    const acceptanceRate = profile?.acceptanceRate ?? 0
    const completionRate = profile?.completionRate ?? 0
    const avgResponse = profile?.avgResponseTimeSec ?? 0
    const rating = profile?.avgRating ?? 0
    const cancelRate = profile?.cancellationRate ?? 0

    return {
      totalJobs,
      acceptanceRate: Math.round(acceptanceRate * 100),
      completionRate: Math.round(completionRate * 100),
      avgResponse,
      rating: rating.toFixed(1),
      cancelRate: Math.round(cancelRate * 100),
    }
  }, [profile])

  useEffect(() => {
    setAcceptingJobs(profile?.available ?? true)
  }, [profile?.available])

  const handleAvailabilityToggle = async () => {
    const nextAvailability = !acceptingJobs
    const token = localStorage.getItem('authToken')
    if (!token) return

    setAcceptingJobs(nextAvailability)
    setAvailabilityError('')
    setSavingAvailability(true)

    try {
      const response = await fetch('/api/auth/me/availability', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ available: nextAvailability }),
      })

      if (!response.ok) {
        const fallbackMessage = `Unable to update availability (HTTP ${response.status}).`
        const cloned = response.clone()
        let responseText = ''
        try {
          const errorJson = await cloned.json()
          responseText = errorJson.message ?? errorJson.error ?? JSON.stringify(errorJson)
        } catch {
          responseText = await response.text()
        }
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
      const message = error instanceof Error ? error.message : 'Unable to update availability right now.'
      console.error('[Availability Toggle]', error)
      setAvailabilityError(message)
    } finally {
      setSavingAvailability(false)
    }
  }

  const unreadCount = recentNotifications.filter((n) => !n.read).length

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fafafa] text-zinc-900">
      <AmbientBackground />

      <CollapsibleSidebar
        userName={profile?.fullName ?? 'Expert'}
        userRole="Specialist"
        onLogout={session.logout}
        items={expertNavItems}
      />

      <main className="relative z-10 mx-auto min-h-screen max-w-7xl px-4 md:ml-[240px] md:px-8 md:py-6">
        {/* Top bar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <SectionLabel variant="mono">Specialist Dashboard</SectionLabel>
            <h1 className="mt-1 text-xl font-semibold tracking-tight">
              Welcome back, {profile?.fullName ?? 'Expert'}
            </h1>
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
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {availabilityError}
          </div>
        ) : null}

        {/* KPI Stats Row */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-6">
          <GlassCard className="p-4" hover={false}>
            <div className="flex items-center gap-2 text-zinc-500">
              <BriefcaseBusiness className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Total Jobs</span>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight">{stats.totalJobs}</p>
          </GlassCard>

          <GlassCard className="p-4" hover={false}>
            <div className="flex items-center gap-2 text-zinc-500">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Acceptance</span>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight">{stats.acceptanceRate}%</p>
            <Progress value={stats.acceptanceRate} className="mt-2 h-1.5" />
          </GlassCard>

          <GlassCard className="p-4" hover={false}>
            <div className="flex items-center gap-2 text-zinc-500">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Completion</span>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight">{stats.completionRate}%</p>
            <Progress value={stats.completionRate} className="mt-2 h-1.5" />
          </GlassCard>

          <GlassCard className="p-4" hover={false}>
            <div className="flex items-center gap-2 text-zinc-500">
              <Clock3 className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Avg Response</span>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight">{formatSeconds(stats.avgResponse)}</p>
          </GlassCard>

          <GlassCard className="p-4" hover={false}>
            <div className="flex items-center gap-2 text-zinc-500">
              <Star className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Rating</span>
            </div>
            <p className="mt-2 text-2xl font-bold tracking-tight">{stats.rating}</p>
            <div className="mt-2 flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${i < Math.round(Number(stats.rating)) ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'}`}
                />
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-4" hover={false}>
            <div className="flex items-center gap-2 text-zinc-500">
              <Activity className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Status</span>
            </div>
            <p className="mt-2 text-lg font-bold tracking-tight">
              {acceptingJobs ? 'Available' : 'Paused'}
            </p>
            <p className="mt-1 text-[11px] text-zinc-400">
              {acceptingJobs ? 'Receiving new requests' : 'Not visible to residents'}
            </p>
          </GlassCard>
        </div>

        {/* Charts Row */}
        <div className="mb-6 grid gap-6 lg:grid-cols-3">
          {/* Weekly Activity Bar Chart */}
          <GlassCard className="flex flex-col p-5" hover={false}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <SectionLabel variant="mono">Weekly Activity</SectionLabel>
                <p className="mt-1 text-sm text-zinc-500">Jobs accepted vs completed</p>
              </div>
              <BarChart3 className="h-4 w-4 text-zinc-400" />
            </div>
            <div className="flex-1 min-h-[200px]">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyActivity} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #e4e4e7', fontSize: 12 }}
                  />
                  <Bar dataKey="accepted" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>

          {/* Job Status Donut */}
          <GlassCard className="flex flex-col p-5" hover={false}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <SectionLabel variant="mono">Job Distribution</SectionLabel>
                <p className="mt-1 text-sm text-zinc-500">Current job status breakdown</p>
              </div>
              <Users className="h-4 w-4 text-zinc-400" />
            </div>
            <div className="flex-1 min-h-[200px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={jobStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {jobStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: 8, border: '1px solid #e4e4e7', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap justify-center gap-3">
              {jobStatusData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.name} ({item.value})
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Response Time Trend */}
          <GlassCard className="flex flex-col p-5" hover={false}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <SectionLabel variant="mono">Response Trend</SectionLabel>
                <p className="mt-1 text-sm text-zinc-500">Avg response time (seconds)</p>
              </div>
              <Zap className="h-4 w-4 text-zinc-400" />
            </div>
            <div className="flex-1 min-h-[200px]">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={responseTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#71717a' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #e4e4e7', fontSize: 12 }}
                    formatter={(value: number) => [`${value}s`, 'Response time']}
                  />
                  <Line type="monotone" dataKey="seconds" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3, fill: '#8b5cf6' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Bottom Row: Active Jobs + Notifications | Profile */}
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          {/* Left: Active Jobs + Notifications */}
          <div className="flex flex-col gap-6">
            <GlassCard className="flex flex-col overflow-hidden p-0" hover={false}>
              <div className="flex items-center justify-between border-b border-zinc-100/60 px-5 py-4">
                <SectionLabel variant="mono">Active Jobs</SectionLabel>
                <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => navigate('/messages')}>
                  View all <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-100/60 text-left text-xs uppercase tracking-wider text-zinc-400">
                      <th className="px-5 py-3 font-medium">Resident</th>
                      <th className="px-5 py-3 font-medium">Issue</th>
                      <th className="px-5 py-3 font-medium">Area</th>
                      <th className="px-5 py-3 font-medium">Priority</th>
                      <th className="px-5 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeJobsList.map((job) => (
                      <tr key={job.id} className="border-b border-zinc-50 last:border-b-0 hover:bg-zinc-50/40">
                        <td className="px-5 py-3 font-medium text-zinc-900">{job.resident}</td>
                        <td className="px-5 py-3 text-zinc-600">{job.issue}</td>
                        <td className="px-5 py-3 text-zinc-500">{job.area}</td>
                        <td className="px-5 py-3">
                          <Badge
                            variant="outline"
                            className={
                              job.priority === 'High'
                                ? 'border-rose-200 bg-rose-50 text-rose-700'
                                : job.priority === 'Medium'
                                  ? 'border-amber-200 bg-amber-50 text-amber-700'
                                  : 'border-zinc-200 bg-zinc-50 text-zinc-600'
                            }
                          >
                            {job.priority}
                          </Badge>
                        </td>
                        <td className="px-5 py-3">
                          <Badge
                            variant="outline"
                            className={
                              job.status === 'new'
                                ? 'border-blue-200 bg-blue-50 text-blue-700'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            }
                          >
                            {job.status === 'new' ? 'New' : 'In Progress'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>

            {/* Notifications */}
            <GlassCard className="flex flex-col overflow-hidden p-0" hover={false}>
              <div className="flex items-center justify-between border-b border-zinc-100/60 px-5 py-4">
                <div className="flex items-center gap-2">
                  <SectionLabel variant="mono">Notifications</SectionLabel>
                  {unreadCount > 0 && (
                    <Badge variant="outline" className="border-rose-200 bg-rose-50 text-rose-700 text-[10px]">
                      {unreadCount} new
                    </Badge>
                  )}
                </div>
              </div>
              <div className="divide-y divide-zinc-50">
                {recentNotifications.map((notif) => (
                  <div key={notif.id} className={`flex items-start gap-3 px-5 py-3 ${!notif.read ? 'bg-blue-50/30' : ''}`}>
                    <div className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${!notif.read ? 'bg-blue-500' : 'bg-zinc-200'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900">{notif.title}</p>
                      <p className="text-xs text-zinc-500">{notif.body}</p>
                    </div>
                    <span className="shrink-0 text-[11px] text-zinc-400">{notif.time}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* Right: Profile Summary + Quick Actions */}
          <div className="flex flex-col gap-6">
            <GlassCard className="p-5" hover={false}>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-900 text-sm font-semibold text-white">
                  {profile?.fullName?.split(' ').map((n) => n[0]).slice(0, 2).join('') ?? 'EX'}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-zinc-900">{profile?.fullName ?? 'Expert'}</h3>
                  <p className="text-xs text-zinc-500">{profile?.primaryExpertise ?? 'General Services'}</p>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Experience</span>
                  <span className="font-medium text-zinc-900">{profile?.yearsOfExperience ?? 0} years</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Rating</span>
                  <span className="font-medium text-zinc-900">{stats.rating} / 5.0</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Total Jobs</span>
                  <span className="font-medium text-zinc-900">{stats.totalJobs}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Completion</span>
                  <span className="font-medium text-zinc-900">{stats.completionRate}%</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-400">Working Areas</p>
                <div className="flex flex-wrap gap-1.5">
                  {(profile?.expertiseAreas ?? []).slice(0, 6).map((area) => (
                    <Badge key={area} variant="outline" className="border-zinc-200 bg-white text-[11px] font-normal text-zinc-600">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            </GlassCard>

            {/* Quick Actions */}
            <GlassCard className="p-5" hover={false}>
              <SectionLabel variant="mono" className="mb-3">Quick Actions</SectionLabel>
              <div className="space-y-2">
                <Button
                  className="w-full justify-start gap-2 rounded-xl"
                  variant="outline"
                  onClick={() => navigate('/messages')}
                >
                  <MessageSquare className="h-4 w-4" />
                  Open Messages
                </Button>
                <Button
                  className="w-full justify-start gap-2 rounded-xl"
                  variant="outline"
                  onClick={() => navigate('/profile')}
                >
                  <Settings className="h-4 w-4" />
                  Edit Profile
                </Button>
                <Button
                  className="w-full justify-start gap-2 rounded-xl"
                  variant={acceptingJobs ? 'destructive' : 'default'}
                  onClick={handleAvailabilityToggle}
                  disabled={savingAvailability}
                >
                  {acceptingJobs ? <PauseCircle className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                  {acceptingJobs ? 'Pause Availability' : 'Resume Availability'}
                </Button>
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  )
}
