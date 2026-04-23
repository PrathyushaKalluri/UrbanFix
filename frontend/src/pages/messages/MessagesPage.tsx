import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, MessageSquareText, Send, ShieldCheck, Sparkles } from 'lucide-react'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import type { AuthSession } from '../../types/auth'
import { useConversations } from '../../hooks/useConversations'
import { useMessages } from '../../hooks/useMessages'
import {
  AmbientBackground,
  GlassCard,
  CollapsibleSidebar,
  SectionLabel,
} from '../../components/design-system'

type MessagesPageProps = {
  session: AuthSession
}

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

export function MessagesPage({ session }: MessagesPageProps) {
  const { conversationId: conversationIdParam } = useParams()
  const conversationId = conversationIdParam ? Number(conversationIdParam) : undefined
  const currentUserId = session.profile?.id

  const { conversations, loading: convLoading, error: convError } = useConversations()
  const { messages, loading: msgLoading, error: msgError, sending, postMessage, markRead } = useMessages(
    conversationId,
    currentUserId
  )

  const [draft, setDraft] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.title = 'UrbanFix | Messages'
  }, [])

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

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === conversationId) ?? null,
    [conversations, conversationId]
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

  const handleSend = async () => {
    const nextDraft = draft.trim()
    if (!nextDraft || !conversationId) return
    setDraft('')
    try {
      await postMessage(nextDraft)
    } catch {
      // Error is handled in hook; message shows [failed to send]
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
          {/* Left — Conversations */}
          <GlassCard className="flex min-h-0 flex-col overflow-hidden p-0" hover={false}>
            <div className="shrink-0 border-b border-zinc-100/60 px-5 py-4">
              <SectionLabel>Recent chats</SectionLabel>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-3">
              {convLoading && <p className="px-2 text-sm text-zinc-500">Loading conversations…</p>}
              {!convLoading && convError && <p className="px-2 text-sm text-rose-600">{convError}</p>}
              {!convLoading && !convError && conversations.length === 0 && (
                <p className="px-2 text-sm text-zinc-500">
                  No conversations yet. Visit the dashboard to find an expert.
                </p>
              )}
              {!convLoading && !convError && conversations.map((conversation) => (
                <Link
                  key={conversation.id}
                  to={`/messages/${conversation.id}`}
                  className={`flex gap-3 rounded-xl px-3 py-3 transition-colors ${
                    conversation.id === conversationId
                      ? 'bg-zinc-100/80 text-zinc-900'
                      : 'hover:bg-zinc-50/60'
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
                    {conversation.otherParticipantName
                      .split(' ')
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-zinc-900">
                        {conversation.otherParticipantName}
                      </p>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                        {formatTimeAgo(conversation.lastMessageAt)}
                      </span>
                    </div>
                    <p className="truncate text-xs text-zinc-500">
                      {conversation.lastMessagePreview ?? 'Start chatting…'}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span className="mt-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-zinc-900 px-1.5 text-[10px] font-bold text-white">
                        {conversation.unreadCount}
                      </span>
                    )}
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
                {selectedConversation
                  ? `Chat with ${selectedConversation.otherParticipantName}`
                  : 'Select a conversation'}
              </h2>
              <p className="mt-2 text-sm text-zinc-500">
                {selectedConversation
                  ? 'Messages stay in the selected thread so the conversation feels immediate and continuous.'
                  : 'Choose a chat from the sidebar to view messages.'}
              </p>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <div className="min-h-0 flex-1 overflow-y-auto space-y-5 px-6 pt-6">
                {!conversationId && (
                  <div className="flex justify-center">
                    <div className="max-w-[80%] rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 px-5 py-3.5 text-sm text-zinc-500">
                      Select a conversation from the sidebar to start messaging.
                    </div>
                  </div>
                )}
                {conversationId && msgLoading && messages.length === 0 && (
                  <div className="flex justify-center">
                    <div className="max-w-[80%] rounded-xl border border-dashed border-zinc-300 bg-zinc-50/80 px-5 py-3.5 text-sm text-zinc-500">
                      Loading messages…
                    </div>
                  </div>
                )}
                {conversationId && msgError && (
                  <div className="flex justify-center">
                    <div className="max-w-[80%] rounded-xl border border-dashed border-rose-300 bg-rose-50/80 px-5 py-3.5 text-sm text-rose-600">
                      {msgError}
                    </div>
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
                        className={`max-w-[80%] px-5 py-3.5 text-sm leading-relaxed ${
                          isSystem
                            ? 'rounded-xl border border-dashed border-rose-300 bg-rose-50/80 text-rose-600'
                            : isMine
                              ? 'rounded-2xl rounded-tr-md bg-zinc-900 text-white shadow-sm'
                              : 'rounded-2xl rounded-tl-md bg-zinc-100 text-zinc-900'
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
                <SectionLabel className="mb-2">Reply</SectionLabel>
                <div className="flex items-center gap-3">
                  <Input
                    id="message-draft"
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={conversationId ? 'Type a request, ETA update, or follow-up…' : 'Select a conversation to reply…'}
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

          {/* Right — Participant info */}
          <div className="flex min-h-0 flex-col gap-6">
            <GlassCard className="shrink-0 p-0" hover={false}>
              <div className="border-b border-zinc-100/60 px-5 py-4">
                <SectionLabel>Selected expert</SectionLabel>
              </div>
              <div className="px-5 py-4">
                <h3 className="text-lg font-semibold tracking-tight text-zinc-900">
                  {selectedConversation?.otherParticipantName ?? 'No expert selected'}
                </h3>
                <p className="mt-1 text-sm text-zinc-500">
                  {selectedConversation
                    ? 'Expert participant'
                    : 'Pick a conversation from the thread list.'}
                </p>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center gap-2.5 text-zinc-900">
                    <ShieldCheck className="h-4 w-4 text-zinc-500" />
                    {selectedConversation ? 'Verified participant' : 'Waiting for selection'}
                  </div>
                  <div className="flex items-center gap-2.5 text-zinc-900">
                    <MessageSquareText className="h-4 w-4 text-zinc-500" />
                    {selectedConversation
                      ? `${messages.length} messages`
                      : 'No active thread'}
                  </div>
                  <div className="flex items-center gap-2.5 text-zinc-900">
                    <Sparkles className="h-4 w-4 text-zinc-500" />
                    {selectedConversation?.unreadCount
                      ? `${selectedConversation.unreadCount} unread`
                      : 'All caught up'}
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
