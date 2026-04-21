import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type AuthTabsProps = {
  activeRoute: string
  showExpertSignup?: boolean
}

type TabLinkProps = {
  active: boolean
  to: string
  children: ReactNode
}

function TabLink({ active, to, children }: TabLinkProps) {
  return (
    <Link className={active ? 'tab active' : 'tab'} to={to}>
      {children}
    </Link>
  )
}

export function AuthTabs({ activeRoute, showExpertSignup = true }: AuthTabsProps) {
  return (
    <div className="tabs" role="navigation" aria-label="Auth navigation">
      <TabLink active={activeRoute === '/login'} to="/login">
        Login
      </TabLink>
      <TabLink active={activeRoute === '/signup/user'} to="/signup/user">
        User signup
      </TabLink>
      {showExpertSignup && (
        <TabLink active={activeRoute === '/signup/expert'} to="/signup/expert">
          Expert signup
        </TabLink>
      )}
    </div>
  )
}
