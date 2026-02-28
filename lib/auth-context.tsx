"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { authService } from "@/lib/services/auth.service"
import type { UserResponse } from "@/lib/types"

interface AuthContextType {
  user: UserResponse | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const bootstrapAuth = async () => {
      const stored = authService.getStoredUser()
      const hasToken = authService.isAuthenticated()

      if (stored) {
        setUser(stored)
      }

      if (hasToken) {
        try {
          const freshUser = await authService.getMe()
          if (!isMounted) return
          setUser(freshUser)
          localStorage.setItem("artistlog_user", JSON.stringify(freshUser))
        } catch (err) {
          console.error("Erro ao buscar usuário fresco:", err)
          if (!isMounted) return
          setUser(null)
        }
      }

      if (isMounted) {
        setIsLoading(false)
      }
    }

    bootstrapAuth()

    return () => {
      isMounted = false
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const response = await authService.login({ email, password })
    setUser(response.user)
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    authService.logout()
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const freshUser = await authService.getMe()
      setUser(freshUser)
      localStorage.setItem("artistlog_user", JSON.stringify(freshUser))
    } catch {
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
