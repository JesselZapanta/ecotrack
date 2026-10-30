import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useAuth, ROLE_HOME } from "@/lib/store"
import type { Role } from "@/lib/mockData"
import { BrandMark, BrandName } from "@/components/brand/Logo"

function SessionSplash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <div className="flex items-center gap-3 rounded-[12px] border border-line bg-surface px-5 py-4 shadow-[var(--shadow-sm)]">
        <BrandMark size="md" />
        <div>
          <BrandName subtitle="Waste monitoring" />
          <p className="mt-1 text-[11px] text-muted-ink">Restoring your session…</p>
        </div>
      </div>
    </div>
  )
}

export function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <SessionSplash />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />

  return <Outlet />
}

export function PublicOnly() {
  const { user, loading } = useAuth()

  if (loading) return <SessionSplash />
  if (user) return <Navigate to={user.redirect || ROLE_HOME[user.role]} replace />

  return <Outlet />
}

export function RoleHomeRedirect() {
  const { user, loading } = useAuth()

  if (loading) return <SessionSplash />
  if (!user) return <Navigate to="/login" replace />

  return <Navigate to={user.redirect || ROLE_HOME[user.role]} replace />
}

export function RoleRoute({ role }: { role: Role }) {
  const { user, loading } = useAuth()

  if (loading) return <SessionSplash />
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to={user.redirect || ROLE_HOME[user.role]} replace />

  return <Outlet />
}

export function AllowRoles({ roles }: { roles: Role[] }) {
  const { user, loading } = useAuth()

  if (loading) return <SessionSplash />
  if (!user) return <Navigate to="/login" replace />
  if (!roles.includes(user.role)) return <Navigate to={user.redirect || ROLE_HOME[user.role]} replace />

  return <Outlet />
}
