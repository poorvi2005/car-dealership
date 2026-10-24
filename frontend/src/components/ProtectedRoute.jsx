/** Route guards: send logged-out users to /login, and logged-in users away from the auth pages. */
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Checking() {
  return <p className="p-10 text-center text-gravel">Checking your session…</p>
}

export function ProtectedRoute({ children }) {
  const { user, checking } = useAuth()
  if (checking) return <Checking />
  return user ? children : <Navigate to="/login" replace />
}

export function GuestRoute({ children }) {
  const { user, checking } = useAuth()
  if (checking) return <Checking />
  return user ? <Navigate to="/" replace /> : children
}
