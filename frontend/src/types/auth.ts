export type Role = 'USER' | 'EXPERT'

export type SignupRouteConfig = {
  route: string
  endpoint: string
  eyebrow: string
  title: string
  description: string
  button: string
}

export type SignupRoutes = Record<Role, SignupRouteConfig>

export type AuthProfile = {
  id: number
  fullName: string
  email: string
  role: Role
  primaryExpertise?: string
  yearsOfExperience?: number
  expertiseAreas?: string[]
  available?: boolean
  serviceArea?: string
  latitude?: number | null
  longitude?: number | null
  avgRating?: number
  totalJobs?: number
  acceptanceRate?: number
  completionRate?: number
  cancellationRate?: number
  avgResponseTimeSec?: number
}

export type AuthSession = {
  profile: AuthProfile | null
  loading: boolean
  submitAuth: <T extends Record<string, unknown>>(endpoint: string, payload: T) => Promise<unknown>
  updateProfile: <T extends Record<string, unknown>>(payload: T) => Promise<AuthProfile>
  refreshProfile?: () => Promise<void>
  logout: () => void
}
