import type { Role } from '../../../types/auth'

type DashboardContent = {
  title: string
  body: string
  accent: string
}

type RoleDashboardStrategy = {
  supports: Role
  content: DashboardContent
}

const roleStrategies: Record<Role, RoleDashboardStrategy> = {
  USER: {
    supports: 'USER',
    content: {
      title: 'Expert directory',
      body: 'Browse experts who are available right now, review their skills, and open a chat when you are ready to connect.',
      accent: 'Resident user',
    },
  },
  EXPERT: {
    supports: 'EXPERT',
    content: {
      title: 'Expert console',
      body: 'Track incoming requests, chat with residents, and manage your availability from one work-oriented dashboard.',
      accent: 'Specialist',
    },
  },
}

export function getDashboardContent(role: Role): DashboardContent {
  return roleStrategies[role].content
}
