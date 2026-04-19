import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardPage } from '../pages/dashboard/DashboardPage'
import { HomePage } from '../pages/home/HomePage'
import { LandingPage } from '../pages/landing/LandingPage'
import { LoginPage } from '../pages/login/LoginPage'
import { ExpertSignupPage } from '../pages/signup/ExpertSignupPage'
import { UserSignupPage } from '../pages/signup/UserSignupPage'
import { useAuthSession } from '../hooks/useAuthSession'

export function AppRoutes() {
  const session = useAuthSession()

  return (
    <Routes>
      <Route path="/" element={session.profile ? <HomePage session={session} /> : <LandingPage />} />
      <Route path="/home" element={<HomePage session={session} />} />
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage session={session} />} />
      <Route path="/signup/user" element={<UserSignupPage session={session} />} />
      <Route path="/signup/expert" element={<ExpertSignupPage session={session} />} />
      <Route path="/dashboard" element={<DashboardPage session={session} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
