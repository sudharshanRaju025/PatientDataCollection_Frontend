import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export type Session = {
  token: string
  username: string
  displayName: string
  role: string
  expiresAt: string
}

type AuthContextValue = {
  session: Session | null
  login: (session: Session) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)
const storageKey = 'meridian.session'

function readSession(): Session | null {
  const raw = sessionStorage.getItem(storageKey)
  if (!raw) return null
  try {
    const session = JSON.parse(raw) as Session
    if (!session.token || new Date(session.expiresAt).getTime() <= Date.now()) {
      sessionStorage.removeItem(storageKey)
      return null
    }
    return session
  } catch {
    sessionStorage.removeItem(storageKey)
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => readSession())

  const value = useMemo<AuthContextValue>(() => ({
    session,
    login: (next) => {
      sessionStorage.setItem(storageKey, JSON.stringify(next))
      setSession(next)
    },
    logout: () => {
      sessionStorage.removeItem(storageKey)
      setSession(null)
    }
  }), [session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
