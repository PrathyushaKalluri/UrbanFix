import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { CheckCircle2, LayoutDashboard, Loader2, Mail, MessageSquare, Settings, Sparkles, User } from 'lucide-react'
import { GlassCard, SectionLabel, CollapsibleSidebar } from '../../components/design-system'
import { Combobox } from '../../components/ui/combobox'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { HYDERABAD_AREAS } from '../../config/hyderabadAreas'
import type { AuthSession } from '../../types/auth'

type ProfilePageProps = {
  session: AuthSession
}

type ProfileFormState = {
  fullName: string
  email: string
  primaryExpertise: string
  yearsOfExperience: string
  expertiseAreas: string
  available: boolean
  serviceArea: string
}

const areaOptions = HYDERABAD_AREAS.map((area) => ({
  value: area.name,
  label: area.name,
  description: `Lat ${area.latitude}, Lng ${area.longitude}`,
}))

export function ProfilePage({ session }: ProfilePageProps) {
  const cleanedExpertiseAreas = session.profile.expertiseAreas?.filter((area) => {
    const normalized = area.trim().toLowerCase()
    return normalized.length > 0 && normalized !== 'true' && normalized !== 'false'
  }) ?? []

  const [form, setForm] = useState<ProfileFormState>({
    fullName: '',
    email: '',
    primaryExpertise: '',
    yearsOfExperience: '',
    expertiseAreas: '',
    available: true,
    serviceArea: HYDERABAD_AREAS[0]?.name ?? 'Madhapur',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    document.title = 'UrbanFix | Profile'
  }, [])

  useEffect(() => {
    if (!session.profile) {
      return
    }

    setForm({
      fullName: session.profile.fullName ?? '',
      email: session.profile.email ?? '',
      primaryExpertise: session.profile.primaryExpertise ?? '',
      yearsOfExperience: session.profile.yearsOfExperience?.toString() ?? '',
      expertiseAreas: cleanedExpertiseAreas.join(', '),
      available: session.profile.available ?? true,
      serviceArea: session.profile.serviceArea ?? HYDERABAD_AREAS[0]?.name ?? 'Madhapur',
    })
  }, [session.profile])

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

  const isExpert = session.profile.role === 'EXPERT'
  const hasChanges =
    form.fullName !== session.profile.fullName ||
    form.email !== session.profile.email ||
    (isExpert && (
      form.primaryExpertise !== (session.profile.primaryExpertise ?? '') ||
      form.yearsOfExperience !== (session.profile.yearsOfExperience?.toString() ?? '') ||
      form.expertiseAreas !== cleanedExpertiseAreas.join(', ') ||
      form.available !== (session.profile.available ?? true) ||
      form.serviceArea !== (session.profile.serviceArea ?? HYDERABAD_AREAS[0]?.name ?? 'Madhapur')
    ))

  const expertNavItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Messages', icon: MessageSquare, href: '/messages' },
    { label: 'Settings', icon: Settings, href: '/profile' },
  ]

  const updateField = (field: keyof ProfileFormState, value: string | boolean) => {
    setError('')
    setSuccess('')
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!session.updateProfile) {
      setError('Profile updates are unavailable right now.')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      await session.updateProfile({
        fullName: form.fullName,
        email: form.email,
        primaryExpertise: isExpert ? form.primaryExpertise : undefined,
        yearsOfExperience: isExpert ? Number.parseInt(form.yearsOfExperience, 10) || 0 : undefined,
        expertiseAreas: isExpert
          ? form.expertiseAreas
              .split(',')
              .map((item) => item.trim())
              .filter((item) => item.length > 0 && item.toLowerCase() !== 'true' && item.toLowerCase() !== 'false')
          : undefined,
        available: isExpert ? form.available : undefined,
        serviceArea: isExpert ? form.serviceArea : undefined,
      })
      setSuccess('Profile updated successfully.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fafafa] text-zinc-900">
      <CollapsibleSidebar
        userName={session.profile.fullName}
        userRole={isExpert ? 'Specialist' : 'Resident'}
        onLogout={session.logout}
        items={isExpert ? expertNavItems : undefined}
      />

      <main className="relative z-10 min-h-screen px-4 py-6 md:ml-[240px] md:px-8 md:py-8">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]">
          <GlassCard className="p-6 md:p-8">
            <SectionLabel>Profile</SectionLabel>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Edit your details</h1>
                <p className="mt-2 max-w-2xl text-sm text-zinc-500">
                  Keep your profile current so the app can route work and conversations accurately.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/70 bg-emerald-50/70 px-4 py-2 text-sm font-medium text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                Authenticated
              </div>
            </div>

            <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
              <section className="space-y-5">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" />
                  <SectionLabel variant="blue">Account details</SectionLabel>
                </div>
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full name</Label>
                    <Input
                      id="fullName"
                      value={form.fullName}
                      onChange={(event) => updateField('fullName', event.target.value)}
                      className="h-12 rounded-xl border-zinc-200/80 bg-white/85 px-4"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="flex items-center gap-2 rounded-xl border border-zinc-200/80 bg-white/85 px-4 shadow-sm">
                      <Mail className="h-4 w-4 shrink-0 text-zinc-400" />
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(event) => updateField('email', event.target.value)}
                        className="h-12 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                      />
                    </div>
                  </div>
                </div>
              </section>

              {isExpert ? (
                <section className="space-y-5 rounded-2xl border border-blue-100/80 bg-blue-50/35 p-5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    <SectionLabel variant="blue">Expert profile</SectionLabel>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="primaryExpertise">Primary expertise</Label>
                      <Input
                        id="primaryExpertise"
                        value={form.primaryExpertise}
                        onChange={(event) => updateField('primaryExpertise', event.target.value)}
                        className="h-12 rounded-xl border-zinc-200/80 bg-white/90 px-4"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="yearsOfExperience">Years of experience</Label>
                      <Input
                        id="yearsOfExperience"
                        type="number"
                        min={0}
                        value={form.yearsOfExperience}
                        onChange={(event) => updateField('yearsOfExperience', event.target.value)}
                        className="h-12 rounded-xl border-zinc-200/80 bg-white/90 px-4"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="expertiseAreas">Expertise areas</Label>
                      <Input
                        id="expertiseAreas"
                        value={form.expertiseAreas}
                        onChange={(event) => updateField('expertiseAreas', event.target.value)}
                        placeholder="Plumbing, Leak Repair, Pipe Installation"
                        className="h-12 rounded-xl border-zinc-200/80 bg-white/90 px-4"
                      />
                    </div>
                    <div className="space-y-2">
                      <Combobox
                        label="Service area"
                        helperText="Used to keep your service location and map coordinates in sync."
                        options={areaOptions}
                        value={form.serviceArea}
                        onValueChange={(value) => updateField('serviceArea', value)}
                        placeholder="Select area"
                        searchPlaceholder="Search area"
                      />
                    </div>
                    <label className="flex items-center gap-3 rounded-2xl border border-zinc-200/80 bg-white/85 px-4 py-4 shadow-sm md:mt-7">
                      <input
                        type="checkbox"
                        checked={form.available}
                        onChange={(event) => updateField('available', event.target.checked)}
                        className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>
                        <span className="block text-sm font-medium text-zinc-800">Available for jobs</span>
                        <span className="block text-xs text-zinc-500">Show your availability to matching requests.</span>
                      </span>
                    </label>
                  </div>
                </section>
              ) : null}

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              {success ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {success}
                </div>
              ) : null}

              <div className="flex items-center justify-end gap-3">
                <Button
                  type="submit"
                  disabled={saving || !hasChanges}
                  className="min-w-[180px] rounded-xl bg-blue-600 px-5 py-3 text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {saving ? 'Saving changes' : 'Save changes'}
                </Button>
              </div>
            </form>
          </GlassCard>

          <div className="space-y-6">
            <GlassCard className="p-6">
              <SectionLabel>Current details</SectionLabel>
              <div className="mt-4 space-y-4 text-sm">
                <div className="rounded-xl border border-zinc-200/70 bg-zinc-50/60 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Role</p>
                  <p className="mt-1 font-semibold text-zinc-800">{isExpert ? 'Specialist' : 'Resident'}</p>
                </div>
                <div className="rounded-xl border border-zinc-200/70 bg-zinc-50/60 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Email</p>
                  <p className="mt-1 break-words font-semibold text-zinc-800">{session.profile.email}</p>
                </div>
                {isExpert ? (
                  <div className="rounded-xl border border-zinc-200/70 bg-zinc-50/60 p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Service status</p>
                    <p className="mt-1 font-semibold text-zinc-800">
                      {session.profile.available ? 'Available' : 'Unavailable'}
                    </p>
                  </div>
                ) : null}
                {isExpert ? (
                  <div className="rounded-xl border border-zinc-200/70 bg-zinc-50/60 p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Location</p>
                    <p className="mt-1 font-semibold text-zinc-800">{session.profile.serviceArea ?? 'Not set'}</p>
                  </div>
                ) : null}
              </div>
            </GlassCard>

            {isExpert ? (
              <GlassCard className="p-6">
                <SectionLabel>Expert summary</SectionLabel>
                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div className="rounded-xl border border-zinc-200/70 bg-zinc-50/60 p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Primary</p>
                    <p className="mt-1 font-semibold text-zinc-800">{session.profile.primaryExpertise ?? 'Not set'}</p>
                  </div>
                  <div className="rounded-xl border border-zinc-200/70 bg-zinc-50/60 p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Experience</p>
                    <p className="mt-1 font-semibold text-zinc-800">{session.profile.yearsOfExperience ?? 0} years</p>
                  </div>
                  <div className="rounded-xl border border-zinc-200/70 bg-zinc-50/60 p-4 sm:col-span-2">
                    <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Expertise areas</p>
                    <p className="mt-1 font-semibold text-zinc-800">
                      {cleanedExpertiseAreas.length ? cleanedExpertiseAreas.join(', ') : 'Not set'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-zinc-200/70 bg-zinc-50/60 p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Rating</p>
                    <p className="mt-1 font-semibold text-zinc-800">{session.profile.avgRating ?? 0}</p>
                  </div>
                  <div className="rounded-xl border border-zinc-200/70 bg-zinc-50/60 p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Jobs</p>
                    <p className="mt-1 font-semibold text-zinc-800">{session.profile.totalJobs ?? 0}</p>
                  </div>
                </div>
              </GlassCard>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  )
}
