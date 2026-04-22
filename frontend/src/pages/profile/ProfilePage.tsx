import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { GlassCard, SectionLabel, CollapsibleSidebar } from '../../components/design-system'
import type { AuthSession } from '../../types/auth'

type ProfilePageProps = {
  session: AuthSession
}

export function ProfilePage({ session }: ProfilePageProps) {
  useEffect(() => {
    document.title = 'UrbanFix | Profile'
  }, [])

  if (session.loading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#fafafa] text-zinc-900">
        <main className="flex min-h-screen items-center justify-center px-6 py-10">
          <GlassCard className="mx-auto max-w-3xl p-8">
            <SectionLabel variant="blue">Loading</SectionLabel>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">Restoring your session…</h1>
            <p className="mt-2 text-sm text-zinc-500">Checking your token and loading your profile.</p>
          </GlassCard>
        </main>
      </div>
    )
  }

  if (!session.profile) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fafafa] text-zinc-900">
      <CollapsibleSidebar
        userName={session.profile.fullName}
        userRole={session.profile.role === 'EXPERT' ? 'Specialist' : 'Resident'}
        onLogout={session.logout}
      />

      <main className="relative z-10 min-h-screen px-4 py-6 md:ml-[240px] md:px-8 md:py-8">
        <GlassCard className="mx-auto max-w-2xl p-6 md:p-8">
          <SectionLabel>Profile</SectionLabel>
          <h1 className="mt-3 text-3xl font-bold tracking-tight">{session.profile.fullName}</h1>
          <p className="mt-2 text-sm text-zinc-500">{session.profile.email}</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-zinc-200/70 bg-zinc-50/60 p-4">
              <SectionLabel>Role</SectionLabel>
              <p className="mt-2 text-sm font-semibold">{session.profile.role}</p>
            </div>
            <div className="rounded-xl border border-zinc-200/70 bg-zinc-50/60 p-4">
              <SectionLabel>Status</SectionLabel>
              <p className="mt-2 text-sm font-semibold">Authenticated</p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/40 px-5 py-8 text-center">
            <p className="text-sm text-zinc-400">Profile settings coming soon.</p>
          </div>
        </GlassCard>
      </main>
    </div>
  )
}
