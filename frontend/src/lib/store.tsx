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
}

export const ROLE_LABEL: Record<Role, string> = {
  admin: "Administrator",
  maintenance: "Maintenance",
}

const USER_KEY = "ecotrack_user"
const USER_AT_KEY = "ecotrack_user_at"
const USER_TTL = 60_000

function readCachedUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

function readCachedUserAt() {
  return Number(localStorage.getItem(USER_AT_KEY) ?? 0)
}

function tokenIsFresh() {
  const token = localStorage.getItem(TOKEN_KEY)

  if (!token) return false

  try {
    const payload = JSON.parse(atob(token.split(".")[1] ?? ""))
    return typeof payload.exp !== "number" || payload.exp * 1000 > Date.now()
  } catch {
    return true
  }
}

function writeCachedUser(user: AuthUser | null) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    localStorage.setItem(USER_AT_KEY, String(Date.now()))
  } else {
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(USER_AT_KEY)
  }
}

const AuthContext = createContext<AuthContextType | null>(null)

let meRequest: Promise<{ user: AuthUser }> | null = null

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() =>
    tokenIsFresh() ? readCachedUser() : null
  )
  const [loading, setLoading] = useState<boolean>(() =>
    tokenIsFresh() ? !readCachedUser() : false
  )

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)

    if (!token) {
      return
    }

    if (!tokenIsFresh()) {
      localStorage.removeItem(TOKEN_KEY)
      writeCachedUser(null)
      return
    }

    const cached = readCachedUser()
    const fresh = cached && Date.now() - readCachedUserAt() < USER_TTL

    if (fresh) {
      return
    }

    let cancelled = false

    const loadUser = () => {
      meRequest ??= api.get<{ user: AuthUser }>("/auth/me").then(({ data }) => data)

      meRequest
        .then(({ user }) => {
          if (!cancelled && localStorage.getItem(TOKEN_KEY)) {
            setUser(user)
            writeCachedUser(user)
          }
        })
        .catch(() => {
          localStorage.removeItem(TOKEN_KEY)
          writeCachedUser(null)
          if (!cancelled) setUser(null)
        })
        .finally(() => {
          meRequest = null
          if (!cancelled) setLoading(false)
        })
    }

    const timer = window.setTimeout(loadUser, cached ? 500 : 0)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [])

  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem(TOKEN_KEY)
      writeCachedUser(null)
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
    writeCachedUser(data.user)
    setUser(data.user)

    return { user: data.user, redirect: data.redirect }
  }, [])

  const logout = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY)

    localStorage.removeItem(TOKEN_KEY)
    writeCachedUser(null)
    setUser(null)

    if (!token) return

    try {
      await api.post("/auth/logout", null, {
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch {
      // The token may already be expired or revoked.
    }
  }, [])

  const updateUser = useCallback((next: AuthUser) => {
    writeCachedUser(next)
    setUser(next)
  }, [])

  const role = user?.role ?? "maintenance"
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
