import { useAuth } from "@/lib/store"
import { AdminLayout } from "@/admin/layout"
import { MaintenanceLayout } from "@/maintenance/layout"
import { OfficeLayout } from "@/office/layout"

export function RoleLayout() {
  const { role } = useAuth()

  if (role === "admin") return <AdminLayout />
  if (role === "maintenance") return <MaintenanceLayout />
  return <OfficeLayout />
}
