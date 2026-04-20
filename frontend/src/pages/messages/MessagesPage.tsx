import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { ArrowLeft, MessageSquareText, Send, ShieldCheck, Sparkles, Zap } from 'lucide-react'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { useAvailableExperts } from '../../hooks/useAvailableExperts'
import type { AuthSession } from '../../types/auth'

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

  const selectedExpert = useMemo(
    () => experts.find((expert) => String(expert.expertId) === expertId) ?? experts[0] ?? null,
    [expertId, experts],
  )

  if (session.loading) {
    return (
      <main className="min-h-screen bg-[#FCFDFC] px-6 py-10 text-[#090A0A]">
        <section className="mx-auto max-w-3xl border border-zinc-200/70 bg-white/70 p-8 shadow-[0_8px_32px_rgba(9,10,10,0.04)] backdrop-blur-xl">
          <p className="font-mono text-[10px] tracking-[0.22em] text-emerald-600 uppercase">Loading</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">Opening chat…</h1>
        </section>
      </main>
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FCFDFC] text-[#090A0A]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
        }}
      />

      <header className="sticky top-0 z-20 border-b border-zinc-200/70 bg-white/70 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon" className="rounded-full">
              <Link to="/dashboard" aria-label="Back to expert directory">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <p className="font-mono text-[10px] tracking-[0.22em] text-[#878D89] uppercase">Comms Matrix</p>
              <h1 className="text-xl font-semibold tracking-tight">Live chat</h1>
            </div>
          </div>
          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
            Secure link active
          </Badge>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[300px_minmax(0,1fr)_320px]">
        <aside className="border border-zinc-200/70 bg-white/70 p-4 shadow-[0_8px_32px_rgba(9,10,10,0.04)] backdrop-blur-xl">
          <p className="font-mono text-[10px] tracking-[0.2em] text-[#878D89] uppercase">Recent chats</p>
          <div className="mt-4 space-y-3">
            {loading && <p className="text-sm text-[#5F6562]">Loading available experts…</p>}
            {!loading && error && <p className="text-sm text-rose-600">{error}</p>}
            {!loading && !error && experts.map((expert) => (
              <Link
                key={expert.expertId}
                to={`/messages/${expert.expertId}`}
                className={`flex gap-3 border px-3 py-3 transition-colors ${
                  String(expert.expertId) === expertId ? 'border-emerald-300 bg-emerald-50' : 'border-zinc-200 bg-white hover:bg-zinc-50'
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#090A0A] text-xs font-semibold text-white">
                  {expert.fullName
                    .split(' ')
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{expert.fullName}</p>
                    <span className="font-mono text-[10px] text-emerald-700">LIVE</span>
                  </div>
                  <p className="truncate text-xs text-[#5F6562]">{expert.primaryExpertise}</p>
                </div>
              </Link>
            ))}
          </div>
        </aside>

        <section className="border border-zinc-200/70 bg-white/70 shadow-[0_8px_32px_rgba(9,10,10,0.04)] backdrop-blur-xl">
          <div className="border-b border-zinc-200/70 px-6 py-5">
            <p className="font-mono text-[10px] tracking-[0.2em] text-[#878D89] uppercase">Direct chat</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">
              {selectedExpert ? `Chat with ${selectedExpert.fullName}` : 'Choose an expert to start'}
            </h2>
            <p className="mt-2 text-sm text-[#5F6562]">
              Messages stay in the selected thread so the conversation feels immediate and continuous.
            </p>
          </div>

          <div className="space-y-5 px-6 py-6">
            {activeMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.author === 'USER' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] border px-4 py-3 text-sm leading-relaxed ${
                    message.author === 'SYSTEM'
                      ? 'border-dashed border-zinc-300 bg-zinc-50 text-[#5F6562]'
                      : message.author === 'USER'
                        ? 'border-emerald-200 bg-emerald-50 text-[#090A0A]'
                        : 'border-zinc-200 bg-white text-[#090A0A]'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}

            <div className="border-t border-zinc-200/70 pt-5">
              <label className="mb-2 block text-xs font-mono tracking-[0.2em] text-[#878D89] uppercase" htmlFor="message-draft">
                Reply
              </label>
              <textarea
                id="message-draft"
                className="min-h-28 w-full border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-emerald-300"
                placeholder="Type a request, ETA update, or follow-up…"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="font-mono text-[10px] tracking-[0.18em] text-[#878D89] uppercase">Encrypted P2P</p>
                <Button onClick={handleSend} className="min-w-36">
                  <Send className="h-4 w-4" />
                  Send
                </Button>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <Card className="border-zinc-200/70 bg-white/70 shadow-[0_8px_32px_rgba(9,10,10,0.04)] backdrop-blur-xl">
            <CardHeader>
              <p className="font-mono text-[10px] tracking-[0.2em] text-[#878D89] uppercase">Selected expert</p>
              <CardTitle>{selectedExpert?.fullName ?? 'No expert selected'}</CardTitle>
              <CardDescription>
                {selectedExpert ? selectedExpert.primaryExpertise : 'Pick an expert from the thread list.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-[#5F6562]">
              <div className="flex items-center gap-2 text-[#090A0A]">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                {selectedExpert ? `${selectedExpert.yearsOfExperience} years of experience` : 'Waiting for selection'}
              </div>
              <div className="flex items-center gap-2 text-[#090A0A]">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                {selectedExpert?.available ? 'Accepting jobs now' : 'Offline'}
              </div>
              <div className="flex items-center gap-2 text-[#090A0A]">
                <MessageSquareText className="h-4 w-4 text-emerald-600" />
                {selectedExpert?.servesAsResident ? 'Resident specialist' : 'On-demand specialist'}
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200/70 bg-white/70 shadow-[0_8px_32px_rgba(9,10,10,0.04)] backdrop-blur-xl">
            <CardHeader>
              <p className="font-mono text-[10px] tracking-[0.2em] text-[#878D89] uppercase">Live status</p>
              <CardTitle>Channel telemetry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-[#5F6562]">
              <div className="flex items-center justify-between border-b border-zinc-200/70 pb-3">
                <span>Channel</span>
                <span className="font-mono text-xs text-[#090A0A]">UF-COMMS-01</span>
              </div>
              <div className="flex items-center justify-between border-b border-zinc-200/70 pb-3">
                <span>Status</span>
                <span className="font-mono text-xs text-emerald-700">CONNECTED</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Signal</span>
                <span className="flex items-center gap-1 font-mono text-xs text-[#090A0A]"><Zap className="h-3.5 w-3.5 text-emerald-600" />STRONG</span>
              </div>
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  )
}