import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "@/lib/store"
import { PublicOnly, RequireAuth, RoleHomeRedirect, RoleRoute } from "@/auth/require-auth"
import { RoleLayout } from "@/components/RoleLayout"
import LoginPage from "@/auth/login"
import LandingPage from "@/landing"
import AdminDashboardPage from "@/admin/dashboard"
import MaintenanceDashboardPage from "@/maintenance/dashboard"
import OfficeDashboardPage from "@/office/dashboard"
import AdminRecordsPage from "@/admin/records"
import OfficeRecordsPage from "@/office/records"
import AdminSchedulesPage from "@/admin/schedules"
import OfficeSchedulesPage from "@/office/schedules"
import OfficeConcernsPage from "@/office/concerns"
import MaintenanceSchedulesPage from "@/maintenance/schedules"
import MaintenanceReportsPage from "@/maintenance/reports"
import MaintenanceConcernsPage from "@/maintenance/concerns"
import ConcernsPage from "@/admin/concerns"
import AdminReportsPage from "@/admin/reports"
import OfficeReportsPage from "@/office/reports"
import LocationsPage from "@/admin/locations"
import OfficesPage from "@/admin/offices"
import CategoriesPage from "@/admin/categories"
import UsersPage from "@/admin/user"
import AuditLogPage from "@/admin/audit"
import AccountPage from "@/auth/account"
import ReportConcernPage from "@/auth/concern"
import { Toaster } from "@/components/ui/sonner"

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route element={<PublicOnly />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          <Route element={<RequireAuth />}>
            <Route element={<RoleLayout />}>
              <Route element={<RoleRoute role="admin" />}>
                <Route path="admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="admin/users" element={<UsersPage />} />
                <Route path="admin/records" element={<AdminRecordsPage />} />
                <Route path="admin/schedules" element={<AdminSchedulesPage />} />
                <Route path="admin/concerns" element={<ConcernsPage />} />
                <Route path="admin/reports" element={<AdminReportsPage />} />
                <Route path="admin/locations" element={<LocationsPage />} />
                <Route path="admin/offices" element={<OfficesPage />} />
                <Route path="admin/categories" element={<CategoriesPage />} />
                <Route path="admin/audit" element={<AuditLogPage />} />
                <Route path="admin/account" element={<AccountPage />} />
              </Route>

              <Route element={<RoleRoute role="office" />}>
                <Route path="office/dashboard" element={<OfficeDashboardPage />} />
                <Route path="office/records" element={<OfficeRecordsPage />} />
                <Route path="office/schedules" element={<OfficeSchedulesPage />} />
                <Route path="office/concerns" element={<OfficeConcernsPage />} />
                <Route path="office/reports" element={<OfficeReportsPage />} />
                <Route path="office/report-concern" element={<ReportConcernPage />} />
                <Route path="office/account" element={<AccountPage />} />
              </Route>

              <Route element={<RoleRoute role="maintenance" />}>
                <Route path="maintenance/dashboard" element={<MaintenanceDashboardPage />} />
                <Route path="maintenance/my-collections" element={<Navigate to="/maintenance/dashboard" replace />} />
                <Route path="maintenance/schedules" element={<MaintenanceSchedulesPage />} />
                <Route path="maintenance/reports" element={<MaintenanceReportsPage />} />
                <Route path="maintenance/concerns" element={<MaintenanceConcernsPage />} />
                <Route path="maintenance/account" element={<AccountPage />} />
              </Route>

              <Route path="*" element={<RoleHomeRedirect />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="bottom-right" offset={16} mobileOffset={{ bottom: 16 }} />
    </AuthProvider>
  )
}
