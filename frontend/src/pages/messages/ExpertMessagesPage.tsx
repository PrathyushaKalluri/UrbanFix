import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import {
  Activity,
  Clock3,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  PauseCircle,
  PlayCircle,
  Send,
  Settings,
  ShieldCheck,
  Star,
  UserRound,
} from 'lucide-react'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import type { AuthSession } from '../../types/auth'
import type { ExpertProfileView } from '../dashboard/strategy/expertDashboardStrategy'
import { getExpertDashboardContent } from '../dashboard/strategy/expertDashboardStrategy'
import { useConversations } from '../../hooks/useConversations'
import { useMessages } from '../../hooks/useMessages'
import {
  AmbientBackground,
  CollapsibleSidebar,
  GlassCard,
  SectionLabel,
} from '../../components/design-system'
import { subscribeToUserPresence } from '../../services/webSocketService'
import { fetchUserPresence } from '../../services/messagingApi'

const expertNavItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Messages', icon: MessageSquare, href: '/messages' },
  { label: 'Settings', icon: Settings, href: '/profile' },
]

function formatTimeAgo(iso: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  return date.toLocaleDateString()
}

type ExpertMessagesPageProps = {
  session: AuthSession
}

export function ExpertMessagesPage({ session }: ExpertMessagesPageProps) {
  const { conversationId: conversationIdParam } = useParams()
  const conversationId = conversationIdParam ? Number(conversationIdParam) : undefined
  const currentUserId = session.profile?.id

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

  const { conversations, loading: convLoading, error: convError } = useConversations()
  const { messages, loading: msgLoading, error: msgError, sending, postMessage, markRead } = useMessages(
    conversationId,
    currentUserId
  )

  const [draft, setDraft] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === conversationId) ?? null,
    [conversations, conversationId]
  )

  const [otherUserOnline, setOtherUserOnline] = useState<boolean | null>(null)

  useEffect(() => {
    if (!selectedConversation?.otherParticipantUserId) return
    const otherUserId = selectedConversation.otherParticipantUserId

    // fetch initial presence
    fetchUserPresence(otherUserId)
      .then((data) => setOtherUserOnline(data.online))
      .catch(() => setOtherUserOnline(null))

    // subscribe to real-time presence updates
    const unsubscribe = subscribeToUserPresence(otherUserId, (event) => {
      setOtherUserOnline(event.online)
    })

    return unsubscribe
  }, [selectedConversation?.otherParticipantUserId])

  useEffect(() => {
    setAcceptingJobs(profile.available)
  }, [profile.available])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  useEffect(() => {
    if (conversationId && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.senderUserId !== currentUserId) {
        markRead(lastMessage.id).catch(() => {})
      }
    }
  }, [conversationId, messages, currentUserId, markRead])

  if (session.loading) {
    return (
      <div className="relative h-screen overflow-hidden bg-[#fafafa] text-zinc-900">
        <AmbientBackground />
        <main className="relative z-10 flex min-h-screen items-center justify-center px-6 py-10">
          <GlassCard className="mx-auto max-w-3xl p-8">
            <SectionLabel variant="blue">Loading</SectionLabel>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">Opening chat…</h1>
          </GlassCard>
        </main>
      </div>
    )
  }

  if (!session.profile) {
    return <Navigate to="/login" replace />
  }

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

  const handleSend = async () => {
    const nextDraft = draft.trim()
    if (!nextDraft || !conversationId) return
    setDraft('')
    try {
      await postMessage(nextDraft)
    } catch {
      // handled in hook
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
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
                    {selectedConversation?.otherParticipantName ?? 'Select a thread'}
                  </h2>
                  <p className="mt-2 text-sm text-zinc-500">
                    {selectedConversation
                      ? `Resident thread · ${messages.length} messages`
                      : 'Open a conversation to view the stream and reply inline.'}
                  </p>
                </div>
                {conversationId && (
                  <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500 uppercase">
                    <span
                      className={`inline-block h-2.5 w-2.5 rounded-full ${
                        otherUserOnline === true
                          ? 'bg-emerald-500'
                          : otherUserOnline === false
                            ? 'bg-zinc-300'
                            : 'bg-zinc-200'
                      }`}
                    />
                    {otherUserOnline === true
                      ? 'Active'
                      : otherUserOnline === false
                        ? 'Offline'
                        : 'Connecting…'}
                  </div>
                )}
              </div>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="min-h-0 flex-1 overflow-y-auto space-y-5 px-6 pt-6">
                {!conversationId && (
                  <div className="flex justify-center">
                    <span className="bg-white px-2 font-mono text-[11px] tracking-[0.18em] text-zinc-400 uppercase">
                      [SYSTEM] SELECT A THREAD TO BEGIN
                    </span>
                  </div>
                )}
                {conversationId && msgLoading && messages.length === 0 && (
                  <div className="flex justify-center">
                    <span className="bg-white px-2 font-mono text-[11px] tracking-[0.18em] text-zinc-400 uppercase">
                      [SYSTEM] LOADING MESSAGES…
                    </span>
                  </div>
                )}
                {conversationId && msgError && (
                  <div className="flex justify-center">
                    <span className="rounded-xl border border-dashed border-rose-300 bg-rose-50 px-4 py-2 font-mono text-[11px] tracking-[0.18em] text-rose-600 uppercase">
                      [ERROR] {msgError}
                    </span>
                  </div>
                )}
                {messages.map((message) => {
                  const isMine = message.senderUserId === currentUserId
                  const isSystem = message.id < 0 && message.body.includes('[failed to send]')
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[72%] p-3 text-[15px] leading-[1.6] ${
                          isSystem
                            ? 'rounded-xl border border-dashed border-rose-300 bg-rose-50 text-rose-600'
                            : isMine
                              ? 'rounded-2xl rounded-tr-md bg-zinc-900 text-white shadow-sm'
                              : 'rounded-2xl rounded-tl-md bg-blue-50 text-zinc-900'
                        }`}
                      >
                        <p>{message.body}</p>
                        <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${isMine ? 'text-zinc-400' : 'text-zinc-500'}`}>
                          <span>{formatTimeAgo(message.createdAt)}</span>
                          {isMine && (
                            <span className="uppercase tracking-wider">
                              {message.deliveryState === 'READ'
                                ? 'Read'
                                : message.deliveryState === 'DELIVERED'
                                  ? 'Delivered'
                                  : 'Sent'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              <div className="shrink-0 border-t border-zinc-100/60 px-6 pb-6 pt-5">
                <SectionLabel variant="mono" className="mb-2">Reply</SectionLabel>
                <div className="flex items-center gap-3">
                  <Input
                    id="message-draft"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={conversationId ? 'Type your response, update, or instructions…' : 'Select a thread to reply…'}
                    disabled={!conversationId || sending}
                    className="h-10 flex-1 rounded-xl border-zinc-200/80 bg-white/85 px-4 text-sm shadow-sm transition-colors focus-visible:border-zinc-400/70 focus-visible:bg-white focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:shadow-none"
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    disabled={!conversationId || sending || !draft.trim()}
                    className="flex h-10 shrink-0 items-center gap-2 rounded-xl bg-zinc-900 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4" />
                    {sending ? 'Sending…' : 'Send'}
                  </button>
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
                {convLoading && (
                  <p className="px-2 py-2 text-sm text-zinc-500">Loading conversations…</p>
                )}
                {!convLoading && convError && (
                  <p className="px-2 py-2 text-sm text-rose-600">{convError}</p>
                )}
                {!convLoading && !convError && conversations.length === 0 && (
                  <p className="px-2 py-2 text-sm text-zinc-500">No active threads.</p>
                )}
                {conversations.map((conversation) => (
                  <Link
                    key={conversation.id}
                    to={`/messages/${conversation.id}`}
                    className={`block w-full border-b border-zinc-100/60 p-4 text-left transition-colors last:border-b-0 ${
                      selectedConversation?.id === conversation.id ? 'bg-blue-50/50' : 'hover:bg-zinc-50/60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[11px] font-semibold text-white">
                        {conversation.otherParticipantName.split(' ').pop()?.slice(-2)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate font-semibold text-[14px] text-zinc-900">
                            {conversation.otherParticipantName}
                          </p>
                          <span className="font-mono text-[10px] text-zinc-400 uppercase">
                            {formatTimeAgo(conversation.lastMessageAt)}
                          </span>
                        </div>
                        <p className="truncate text-[13px] text-zinc-500">
                          {conversation.lastMessagePreview ?? 'No messages yet'}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <span className="mt-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-zinc-900 px-1.5 text-[10px] font-bold text-white">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </GlassCard>

            {/* Telemetry */}
            <GlassCard className="flex min-h-0 flex-1 flex-col overflow-hidden p-0" hover={false}>
              <div className="shrink-0 border-b border-zinc-100/60 px-4 py-4">
                <SectionLabel variant="mono">Thread Telemetry</SectionLabel>
              </div>
              <div className="flex-1 overflow-y-auto space-y-5 px-4 py-4">
                <div className="border-l-2 border-zinc-200/70 pl-4">
                  <p className="mb-1 font-mono text-[13px] text-zinc-500">Availability</p>
                  <p className="text-[22px] font-semibold tracking-tight text-zinc-900">
                    {acceptingJobs ? 'Connected' : 'Paused'}
                  </p>
                </div>
                <div className="border-l-2 border-zinc-200/70 pl-4">
                  <p className="mb-1 font-mono text-[13px] text-zinc-500">Active threads</p>
                  <p className="text-[22px] font-semibold tracking-tight text-zinc-900">
                    {conversations.length}
                  </p>
                </div>
                <div className="border-l-2 border-zinc-200/70 pl-4">
                  <p className="mb-1 font-mono text-[13px] text-zinc-500">Unread messages</p>
                  <p className="text-[22px] font-semibold tracking-tight text-zinc-900">
                    {conversations.reduce((sum, c) => sum + c.unreadCount, 0)}
                  </p>
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
              </div>
            </GlassCard>
          </div>
        </div>
      </main>
    </div>
  )
}
