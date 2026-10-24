/**
 * Holds "who is logged in" for the whole app.
 *
 * On first load we check if a token is saved; if so we ask the API who it belongs to
 * (GET /api/auth/me). Any component can call useAuth() to read the user or log in/out.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, setUnauthorizedHandler, tokenStore } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(() => Boolean(tokenStore.get()))

  const logout = useCallback(() => {
    tokenStore.clear()
    setUser(null)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(logout)
    if (!tokenStore.get()) return
    api
      .me()
      .then(setUser)
      .catch(logout)
      .finally(() => setChecking(false))
  }, [logout])

  const startSession = useCallback(({ access_token, user }) => {
    tokenStore.set(access_token)
    setUser(user)
    return user
  }, [])

  const login = useCallback((email, password) => api.login(email, password).then(startSession), [startSession])
  const register = useCallback((payload) => api.register(payload).then(startSession), [startSession])

  const value = useMemo(
    () => ({ user, checking, isAdmin: Boolean(user?.is_admin), login, register, logout }),
    [user, checking, login, register, logout],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
