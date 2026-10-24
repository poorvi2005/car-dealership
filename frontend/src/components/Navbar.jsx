import { useAuth } from '../context/AuthContext'
import Logo from './Logo'

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth()
  return (
    <header className="bg-petrol text-showroom">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <Logo />
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden sm:inline">{user?.full_name}</span>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              isAdmin ? 'bg-marigold text-asphalt' : 'bg-white/15 text-showroom'
            }`}
          >
            {isAdmin ? 'Admin' : 'Buyer'}
          </span>
          <button type="button" onClick={logout} className="rounded-full px-3 py-1.5 font-medium hover:bg-white/10">
            Log out
          </button>
        </div>
      </div>
    </header>
  )
}
