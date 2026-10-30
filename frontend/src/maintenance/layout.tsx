import { useState } from "react"
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useAuth, ROLE_LABEL } from "@/lib/store"
import { BrandMark, BrandName } from "@/components/brand/Logo"
import { maintenanceNav } from "@/components/nav"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { LogOut, Menu } from "lucide-react"
import { toast } from "sonner"

export function MaintenanceLayout() {
  const { role, userName, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [navOpen, setNavOpen] = useState(false)

  const current = maintenanceNav.find(
    (item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)
  )

  const handleLogout = async () => {
    await logout()
    toast("Logged out.")
    navigate("/login", { replace: true })
  }

  const rail = (
    <div className="flex h-full flex-col bg-sidebar" onClick={() => setNavOpen(false)}>
      <div className="px-4 pt-5 pb-4">
        <Link to="/maintenance/dashboard" className="flex items-center gap-2.5">
          <BrandMark size="sm" tileClassName="border-transparent" />
          <BrandName tone="light" subtitle="Field crew" />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2 no-scrollbar">
        <p className="px-2.5 pt-2 pb-2 text-[9.5px] font-semibold tracking-[0.12em] text-sidebar-muted uppercase">
          Field work
        </p>
        <nav className="space-y-0.5">
          {maintenanceNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/maintenance/dashboard"}
              className={({ isActive }) =>
                `relative flex min-h-11 items-center gap-2.5 rounded-[7px] px-2.5 py-2 text-[12.5px] font-medium transition-colors md:min-h-0 ${
                  isActive
                    ? "bg-sidebar-2 text-white"
                    : "text-sidebar-text hover:bg-white/5 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute top-1/2 left-0 h-3.5 w-[2px] -translate-y-1/2 rounded-full bg-lime" />
                  )}
                  <span className={isActive ? "text-white" : "text-sidebar-muted"}>{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="border-t border-white/10 p-2.5">
        <div className="flex items-center gap-2.5 rounded-[8px] px-2 py-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10.5px] font-semibold text-white">
            {userName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] leading-tight font-medium text-white">{userName}</p>
            <p className="truncate text-[10px] text-sidebar-muted">{ROLE_LABEL[role]}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex size-8 items-center justify-center rounded-[6px] text-sidebar-muted transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Log out"
          >
            <LogOut className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-canvas">
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:flex md:w-[248px] md:flex-col">
        {rail}
      </aside>

      <header className="sticky top-0 z-20 border-b border-line bg-canvas/95 backdrop-blur-sm md:pl-[248px]">
        <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2">
            <Sheet open={navOpen} onOpenChange={setNavOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="md:hidden">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[268px] border-0 p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Navigation</SheetTitle>
                </SheetHeader>
                {rail}
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2 text-[12px] text-muted-ink">
              <span className="hidden sm:inline">Field crew</span>
              <span className="hidden text-line-strong sm:inline">/</span>
              <span className="truncate font-medium text-ink">{current?.label ?? "Today"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full border border-line bg-surface text-[10.5px] font-semibold text-ink">
              {userName.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <div className="md:pl-[248px]">
        <main className="mx-auto max-w-[1280px] px-4 py-6 pb-10 sm:px-6 sm:py-8 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
