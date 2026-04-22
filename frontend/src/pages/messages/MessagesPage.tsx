import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, MessageSquareText, Send, ShieldCheck, Sparkles, Zap } from 'lucide-react'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { useAvailableExperts } from '../../hooks/useAvailableExperts'
import type { AuthSession } from '../../types/auth'
import {
  AmbientBackground,
  GlassCard,
  CollapsibleSidebar,
  SectionLabel,
} from '../../components/design-system'

type MessagesPageProps = {
  session: AuthSession
}

type ChatMessage = {
  id: number
  author: 'USER' | 'EXPERT' | 'SYSTEM'
  text: string
}

export function MessagesPage({ session }: MessagesPageProps) {
  const { expertId } = useParams()
  const { experts, loading, error } = useAvailableExperts()
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])

  useEffect(() => {
    document.title = 'UrbanFix | Messages'
  }, [])

  const selectedExpert = useMemo(
    () => experts.find((expert) => String(expert.expertId) === expertId) ?? experts[0] ?? null,
    [expertId, experts],
  )

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

  const activeMessages = [
    {
      id: 1,
      author: 'SYSTEM' as const,
      text: 'Secure channel established. Expert cards are sourced from the live availability feed.',
    },
    ...messages,
  ]

  const handleSend = () => {
    const nextDraft = draft.trim()
    if (!nextDraft) {
      return
    }

    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        author: 'USER',
        text: nextDraft,
      },
    ])
    setDraft('')
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
        userName={session.profile.fullName}
        userRole="Resident"
        onLogout={session.logout}
      />

      <main className="relative z-10 mx-auto flex h-full max-w-7xl flex-col px-4 md:ml-[240px] md:px-8 md:py-5">
        {/* Top bar */}
        <div className="mb-6 flex shrink-0 items-center gap-4">
          <Link
            to="/dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200/60 bg-white/80 text-zinc-600 shadow-sm backdrop-blur-xl transition-all hover:border-zinc-300 hover:text-zinc-900"
            aria-label="Back to expert directory"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <SectionLabel>Comms Matrix</SectionLabel>
            <h1 className="text-xl font-semibold tracking-tight">Live chat</h1>
          </div>
          <Badge variant="outline" className="ml-auto border-zinc-200 bg-zinc-50 text-zinc-600">
            Secure link active
          </Badge>
        </div>

        {/* 3-column layout */}
        <div className="grid flex-1 min-h-0 grid-rows-[1fr] gap-6 lg:grid-cols-[280px_minmax(0,1fr)_300px]">
          {/* Left — Recent chats */}
          <GlassCard className="flex min-h-0 flex-col overflow-hidden p-0" hover={false}>
            <div className="shrink-0 border-b border-zinc-100/60 px-5 py-4">
              <SectionLabel>Recent chats</SectionLabel>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-3">
              {loading && <p className="px-2 text-sm text-zinc-500">Loading available experts…</p>}
              {!loading && error && <p className="px-2 text-sm text-rose-600">{error}</p>}
              {!loading && !error && experts.map((expert) => (
                <Link
                  key={expert.expertId}
                  to={`/messages/${expert.expertId}`}
                  className={`flex gap-3 rounded-xl px-3 py-3 transition-colors ${
                    String(expert.expertId) === expertId
                      ? 'bg-zinc-100/80 text-zinc-900'
                      : 'hover:bg-zinc-50/60'
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
                    {expert.fullName
                      .split(' ')
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-zinc-900">{expert.fullName}</p>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Live</span>
                    </div>
                    <p className="truncate text-xs text-zinc-500">{expert.primaryExpertise}</p>
                  </div>
                </Link>
              ))}
            </div>
          </GlassCard>

          {/* Center — Chat */}
          <GlassCard className="flex min-h-0 flex-col overflow-hidden p-0" hover={false}>
            <div className="shrink-0 border-b border-zinc-100/60 px-6 py-5">
              <SectionLabel>Direct chat</SectionLabel>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900">
                {selectedExpert ? `Chat with ${selectedExpert.fullName}` : 'Choose an expert to start'}
              </h2>
              <p className="mt-2 text-sm text-zinc-500">
                Messages stay in the selected thread so the conversation feels immediate and continuous.
              </p>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="min-h-0 flex-1 overflow-y-auto space-y-5 px-6 pt-6">
                {activeMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.author === 'USER' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-5 py-3.5 text-sm leading-relaxed ${
                        message.author === 'SYSTEM'
                          ? 'rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 text-zinc-500'
                          : message.author === 'USER'
                            ? 'rounded-2xl rounded-tr-md bg-zinc-900 text-white shadow-sm'
                            : 'rounded-2xl rounded-tl-md bg-zinc-100 text-zinc-900'
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="shrink-0 border-t border-zinc-100/60 px-6 pb-6 pt-5">
                <SectionLabel className="mb-2">Reply</SectionLabel>
                <div className="flex items-center gap-3">
                  <Input
                    id="message-draft"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a request, ETA update, or follow-up…"
                    className="h-10 flex-1 rounded-xl border-zinc-200/80 bg-white/85 px-4 text-sm shadow-sm transition-colors focus-visible:border-zinc-400/70 focus-visible:bg-white focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:shadow-none"
                  />
                  <button
                    type="button"
                    onClick={handleSend}
                    className="flex h-10 shrink-0 items-center gap-2 rounded-xl bg-zinc-900 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800"
                  >
                    <Send className="h-4 w-4" />
                    Send
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Right — Expert info + Live status */}
          <div className="flex min-h-0 flex-col gap-6">
            <GlassCard className="shrink-0 p-0" hover={false}>
              <div className="border-b border-zinc-100/60 px-5 py-4">
                <SectionLabel>Selected expert</SectionLabel>
              </div>
              <div className="px-5 py-4">
                <h3 className="text-lg font-semibold tracking-tight text-zinc-900">
                  {selectedExpert?.fullName ?? 'No expert selected'}
                </h3>
                <p className="mt-1 text-sm text-zinc-500">
                  {selectedExpert ? selectedExpert.primaryExpertise : 'Pick an expert from the thread list.'}
                </p>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center gap-2.5 text-zinc-900">
                    <Sparkles className="h-4 w-4 text-zinc-500" />
                    {selectedExpert ? `${selectedExpert.yearsOfExperience} years of experience` : 'Waiting for selection'}
                  </div>
                  <div className="flex items-center gap-2.5 text-zinc-900">
                    <ShieldCheck className="h-4 w-4 text-zinc-500" />
                    {selectedExpert?.available ? 'Accepting jobs now' : 'Offline'}
                  </div>
                  <div className="flex items-center gap-2.5 text-zinc-900">
                    <MessageSquareText className="h-4 w-4 text-zinc-500" />
                    {selectedExpert?.serviceArea ? `Area: ${selectedExpert.serviceArea}` : 'Area not set'}
                  </div>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="flex min-h-0 flex-1 flex-col overflow-hidden p-0" hover={false}>
              <div className="shrink-0 border-b border-zinc-100/60 px-5 py-4">
                <SectionLabel>Live status</SectionLabel>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                <h3 className="text-lg font-semibold tracking-tight text-zinc-900">Channel telemetry</h3>
                <div className="mt-4 space-y-4 text-sm text-zinc-500">
                  <div className="flex items-center justify-between border-b border-zinc-100/60 pb-3">
                    <span>Channel</span>
                    <span className="font-mono text-xs text-zinc-900">UF-COMMS-01</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-zinc-100/60 pb-3">
                    <span>Status</span>
                    <span className="font-mono text-xs font-semibold text-zinc-700">CONNECTED</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Signal</span>
                    <span className="flex items-center gap-1 font-mono text-xs text-zinc-900">
                      <Zap className="h-3.5 w-3.5 text-zinc-500" />
                      STRONG
                    </span>
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
