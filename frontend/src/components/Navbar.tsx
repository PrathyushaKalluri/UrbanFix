import { Link } from 'react-router-dom'

type NavbarProps = {
  isAuthenticated?: boolean
  onLogout?: () => void
}

export function Navbar({ isAuthenticated, onLogout }: NavbarProps) {
  return (
    <header className="relative z-50 w-full border-b border-zinc-200/50 bg-stone-50/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
        <Link 
          to="/" 
          className="font-mono text-lg font-bold tracking-tighter text-zinc-900 hover:text-blue-600 transition-colors"
        >
          UrbanFix
        </Link>
        <div className="flex items-center gap-6">
          {isAuthenticated ? (
            <button
              onClick={onLogout}
              className="text-[11px] font-semibold tracking-[0.2em] text-zinc-500 uppercase transition-colors hover:text-blue-500"
            >
              Logout
            </button>
          ) : (
            <>
              <Link 
                to="/signup/user"
                className="text-[11px] font-semibold tracking-[0.2em] text-blue-600 uppercase hover:text-blue-700 transition-colors"
              >
                Join ecosystem
              </Link>
              <Link 
                to="/login"
                className="text-[11px] font-semibold tracking-[0.2em] text-zinc-500 uppercase transition-colors hover:text-blue-500"
              >
                Log In
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
