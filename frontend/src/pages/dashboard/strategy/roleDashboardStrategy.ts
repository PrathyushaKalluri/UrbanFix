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
      title: 'User workspace',
      body: 'You will be able to raise home service requests and track their status from here.',
      accent: 'Customer',
    },
  },
  EXPERT: {
    supports: 'EXPERT',
    content: {
      title: 'Expert workspace',
      body: 'Incoming home repair requests will appear here once the request module is added.',
      accent: 'Technician',
    },
  },
}

export function getDashboardContent(role: Role): DashboardContent {
  return roleStrategies[role].content
}
