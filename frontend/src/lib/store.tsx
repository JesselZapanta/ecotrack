import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import api, { TOKEN_KEY } from "./api"
import type { Role } from "./mockData"

export type AuthUser = {
  id: number
  name: string
  full_name: string
  username: string | null
  email: string
  role: Role
  office_id: number | null
  office: { id: number; name: string; location: { id: number; name: string } | null } | null
  is_active: boolean
  last_login_at: string | null
  created_at: string | null
  redirect: string
}

type LoginResult = {
  user: AuthUser
  redirect: string
}

type AuthContextType = {
  user: AuthUser | null
  role: Role
  userName: string
  loading: boolean
  login: (login: string, password: string) => Promise<LoginResult>
  logout: () => Promise<void>
  updateUser: (user: AuthUser) => void
}

export const ROLE_HOME: Record<Role, string> = {
  admin: "/admin/dashboard",
  maintenance: "/maintenance/dashboard",
  office: "/office/dashboard",
}

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Administrator",
  maintenance: "Maintenance",
  office: "Office",
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState<boolean>(() => Boolean(localStorage.getItem(TOKEN_KEY)))

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      return
    }

    let cancelled = false

    api
      .get<{ user: AuthUser }>("/auth/me")
      .then(({ data }) => {
        if (!cancelled) setUser(data.user)
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY)
        if (!cancelled) setUser(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem(TOKEN_KEY)
      setUser(null)
    }

    window.addEventListener("ecotrack:unauthorized", handleUnauthorized)
    return () => window.removeEventListener("ecotrack:unauthorized", handleUnauthorized)
  }, [])

  const login = useCallback(async (loginValue: string, password: string): Promise<LoginResult> => {
    const { data } = await api.post<{
      access_token: string
      user: AuthUser
      redirect: string
    }>("/auth/login", { login: loginValue, password })

    localStorage.setItem(TOKEN_KEY, data.access_token)
    setUser(data.user)

    return { user: data.user, redirect: data.redirect }
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout")
    } catch {
      // The token may already be expired or revoked.
    } finally {
      localStorage.removeItem(TOKEN_KEY)
      setUser(null)
    }
  }, [])

  const updateUser = useCallback((next: AuthUser) => {
    setUser(next)
  }, [])

  const role = user?.role ?? "office"
  const userName = user?.name ?? ""

  const value = useMemo(
    () => ({ user, role, userName, loading, login, logout, updateUser }),
    [user, role, userName, loading, login, logout, updateUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
