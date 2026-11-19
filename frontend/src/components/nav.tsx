import {
  BarChart3,
  Building2,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  MapPin,
  MessageSquareWarning,
  ScrollText,
  Tag,
  User,
  Users,
} from "lucide-react"
import type { NavBadgeKey } from "@/lib/nav-badges"

export type NavItem = {
  to: string
  label: string
  icon: React.ReactNode
  badgeKey?: NavBadgeKey
}

export const adminNav: NavItem[] = [
  { to: "/admin/dashboard", label: "Overview", icon: <LayoutDashboard className="size-4" /> },
  { to: "/admin/records", label: "Waste records", icon: <ClipboardList className="size-4" /> },
  {
    to: "/admin/schedules",
    label: "Schedules",
    icon: <CalendarDays className="size-4" />,
    badgeKey: "missed",
  },
  {
    to: "/admin/concerns",
    label: "Concerns",
    icon: <MessageSquareWarning className="size-4" />,
    badgeKey: "concerns",
  },
  { to: "/admin/locations", label: "Locations", icon: <MapPin className="size-4" /> },
  { to: "/admin/offices", label: "Rooms", icon: <Building2 className="size-4" /> },
  { to: "/admin/categories", label: "Categories", icon: <Tag className="size-4" /> },
  { to: "/admin/users", label: "Users", icon: <Users className="size-4" /> },
  { to: "/admin/reports", label: "Reports", icon: <BarChart3 className="size-4" /> },
  { to: "/admin/audit", label: "Audit log", icon: <ScrollText className="size-4" /> },
  { to: "/admin/account", label: "Account", icon: <User className="size-4" /> },
]

export const maintenanceNav: NavItem[] = [
  {
    to: "/maintenance/dashboard",
    label: "Today",
    icon: <LayoutDashboard className="size-4" />,
    badgeKey: "today",
  },
  {
    to: "/maintenance/schedules",
    label: "Schedules",
    icon: <CalendarDays className="size-4" />,
    badgeKey: "missed",
  },
  { to: "/maintenance/reports", label: "Reports", icon: <BarChart3 className="size-4" /> },
  {
    to: "/maintenance/concerns",
    label: "Concerns",
    icon: <MessageSquareWarning className="size-4" />,
    badgeKey: "concerns",
  },
  { to: "/maintenance/account", label: "Account", icon: <User className="size-4" /> },
]
