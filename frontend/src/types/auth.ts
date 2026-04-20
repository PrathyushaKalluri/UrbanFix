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
  fullName: string
  email: string
  role: Role
  primaryExpertise?: string
  yearsOfExperience?: number
  expertiseAreas?: string[]
  bio?: string
  available?: boolean
  servesAsResident?: boolean
}

export type AuthSession = {
  profile: AuthProfile | null
  loading: boolean
  submitAuth: <T extends Record<string, unknown>>(endpoint: string, payload: T) => Promise<unknown>
  logout: () => void
}
