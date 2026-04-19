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
}

export type AuthSession = {
  profile: AuthProfile | null
  loading: boolean
  submitAuth: <T extends Record<string, string>>(endpoint: string, payload: T) => Promise<unknown>
  logout: () => void
}
