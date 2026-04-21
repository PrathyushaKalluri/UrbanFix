import { SignupPage } from './SignupPage'
import type { AuthSession } from '../../types/auth'

type ExpertSignupPageProps = {
  session: AuthSession
}

export function ExpertSignupPage({ session }: ExpertSignupPageProps) {
  return <SignupPage session={session} role="EXPERT" />
}
