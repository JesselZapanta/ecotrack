import { useAuth } from "@/lib/store"
import { AdminLayout } from "@/admin/layout"
import { MaintenanceLayout } from "@/maintenance/layout"

export function RoleLayout() {
  const { role } = useAuth()

  if (role === "admin") return <AdminLayout />
  return <MaintenanceLayout />
}
