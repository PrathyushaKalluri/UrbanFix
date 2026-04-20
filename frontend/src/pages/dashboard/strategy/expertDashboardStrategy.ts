import type { AuthProfile } from '../../../types/auth'

export type ExpertProfileView = AuthProfile & {
  primaryExpertise: string
  yearsOfExperience: number
  expertiseAreas: string[]
  available?: boolean
}

export type ExpertMetric = {
  label: string
  value: string
  detail: string
}

export type ExpertJobCard = {
  id: string
  residentName: string
  issue: string
  area: string
  schedule: string
  note: string
  priority: 'High' | 'Medium' | 'Low'
  stage: 'New request' | 'In progress' | 'Completed'
}

export type ExpertConversation = {
  id: string
  name: string
  preview: string
  time: string
  unread: boolean
}

export type ExpertDashboardContent = {
  heroTitle: string
  heroBody: string
  metrics: ExpertMetric[]
  newRequests: ExpertJobCard[]
  activeJobs: ExpertJobCard[]
  completedJobs: ExpertJobCard[]
  conversations: ExpertConversation[]
  profileHighlights: Array<{
    label: string
    value: string
  }>
}

export function getExpertDashboardContent(profile: ExpertProfileView): ExpertDashboardContent {
  const expertiseCount = profile.expertiseAreas.length
  const availabilityLabel = profile.available ? 'Accepting jobs now' : 'Currently paused'

  return {
    heroTitle: `Welcome back, ${profile.fullName}`,
    heroBody: 'Manage incoming requests, keep your queue moving, and jump into the message stream when a resident needs help.',
    metrics: [
      {
        label: 'Current status',
        value: availabilityLabel,
        detail: 'Controls how residents see your profile in the network.',
      },
      {
        label: 'Experience',
        value: `${profile.yearsOfExperience} years`,
        detail: 'Hands-on experience shown on your expert card.',
      },
      {
        label: 'Expertise areas',
        value: `${expertiseCount}`,
        detail: 'Topics and specializations currently attached to your profile.',
      },
      {
        label: 'Response health',
        value: '98%',
        detail: 'Track quick replies and job hand-offs from the console.',
      },
    ],
    newRequests: [
      {
        id: 'req-1',
        residentName: 'Resident 001',
        issue: 'Kitchen sink leak',
        area: 'Baner, Pune',
        schedule: 'Requested now',
        note: 'Needs urgent plumbing assistance and a quick call back.',
        priority: 'High',
        stage: 'New request',
      },
      {
        id: 'req-2',
        residentName: 'Resident 014',
        issue: 'Circuit breaker trip',
        area: 'Hinjewadi, Pune',
        schedule: 'Today, 6:30 PM',
        note: 'Electrical panel requires inspection before evening use.',
        priority: 'Medium',
        stage: 'New request',
      },
    ],
    activeJobs: [
      {
        id: 'job-1',
        residentName: 'Resident 021',
        issue: 'AC cooling drop',
        area: 'Kothrud, Pune',
        schedule: 'In progress',
        note: 'Resident is waiting for a status update and ETA.',
        priority: 'High',
        stage: 'In progress',
      },
      {
        id: 'job-2',
        residentName: 'Resident 033',
        issue: 'Door lock replacement',
        area: 'Wakad, Pune',
        schedule: 'Queued next',
        note: 'Quick locksmith follow-up after current stop.',
        priority: 'Low',
        stage: 'In progress',
      },
    ],
    completedJobs: [
      {
        id: 'done-1',
        residentName: 'Resident 008',
        issue: 'Fan wiring fix',
        area: 'Aundh, Pune',
        schedule: 'Completed 2h ago',
        note: 'Job closed with a clean hand-off and no follow-up needed.',
        priority: 'Low',
        stage: 'Completed',
      },
    ],
    conversations: [
      {
        id: 'chat-1',
        name: 'Resident 001',
        preview: 'Please confirm if you can arrive within 30 minutes.',
        time: '10:42',
        unread: true,
      },
      {
        id: 'chat-2',
        name: 'Resident 021',
        preview: 'Thanks — the AC is still not cooling properly.',
        time: '09:15',
        unread: false,
      },
      {
        id: 'chat-3',
        name: 'Resident 033',
        preview: 'Can you bring a replacement lock cylinder?',
        time: 'Yesterday',
        unread: false,
      },
    ],
    profileHighlights: [
      {
        label: 'Primary expertise',
        value: profile.primaryExpertise,
      },
      {
        label: 'Current mode',
        value: availabilityLabel,
      },
      {
        label: 'Working areas',
        value: profile.expertiseAreas.join(', '),
      },
    ],
  }
}