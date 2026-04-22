import { ModernNavbar } from './design-system/ModernNavbar'

type NavbarProps = {
  isAuthenticated?: boolean
  onLogout?: () => void
}

export function Navbar({ isAuthenticated, onLogout }: NavbarProps) {
  return <ModernNavbar isAuthenticated={isAuthenticated} onLogout={onLogout} />
}
