import { SignupPage } from './SignupPage'
import type { AuthSession } from '../../types/auth'

type UserSignupPageProps = {
  session: AuthSession
}

export function UserSignupPage({ session }: UserSignupPageProps) {
  return <SignupPage session={session} role="USER" />
}
