import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import * as authService from '../services/auth'
import type { AppUser } from '../types'

export type AuthContextValue = {
  user: AppUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    authService.getCurrentUser().then((result) => {
      setUser(result)
      setLoading(false)
    })
    return authService.onAuthChange(setUser)
  }, [])

  const value: AuthContextValue = {
    user,
    loading,
    signIn: async (email, password) => {
      setUser(await authService.signIn(email, password))
    },
    signUp: async (email, password) => {
      setUser(await authService.signUp(email, password))
    },
    signOut: async () => {
      await authService.signOut()
      setUser(null)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth precisa estar dentro de AuthProvider')
  return ctx
}
