import { useState } from "react"
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useAuth, ROLE_LABEL } from "@/lib/store"
import { BrandMark, BrandName } from "@/components/brand/Logo"
import { officeNav } from "@/components/nav"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Eye, LogOut, Menu } from "lucide-react"
import { toast } from "sonner"

export function OfficeLayout() {
  const { user, role, userName, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [navOpen, setNavOpen] = useState(false)

  const current = officeNav.find(
    (item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)
  )

  const handleLogout = async () => {
    await logout()
    toast("Logged out.")
    navigate("/login", { replace: true })
  }

  const rail = (
    <div className="flex h-full flex-col border-r border-line bg-surface" onClick={() => setNavOpen(false)}>
      <div className="border-b border-line px-4 py-4">
        <Link to="/office/dashboard" className="flex items-center gap-2.5">
          <BrandMark size="sm" />
          <BrandName subtitle="Office view" />
        </Link>
      </div>

      <div className="border-b border-line px-4 py-3">
        <p className="label">Your office</p>
        <p className="mt-1 truncate text-[12.5px] font-medium">{user?.office?.name ?? "Office"}</p>
        {user?.office?.location?.name && (
          <p className="mt-0.5 truncate text-[10.5px] text-muted-ink">
            Location: {user.office.location.name}
          </p>
        )}
        <span className="mt-2 inline-flex items-center gap-1 rounded-[5px] border border-line bg-surface-2 px-1.5 py-0.5 text-[9.5px] font-medium text-muted-ink">
          <Eye className="size-3" /> View only
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3 no-scrollbar">
        <nav className="space-y-0.5">
          {officeNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/office/dashboard"}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-[7px] px-2.5 py-2 text-[12.5px] font-medium transition-colors ${
                  isActive
                    ? "bg-brand-soft text-brand-ink"
                    : "text-muted-ink hover:bg-surface-2 hover:text-ink"
                }`
              }
            >
              {item.icon}
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="border-t border-line p-3">
        <div className="flex items-center gap-2.5 px-1">
          <div className="flex size-8 items-center justify-center rounded-full bg-brand-soft text-[10.5px] font-semibold text-brand-ink">
            {userName.slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-medium">{userName}</p>
            <p className="text-[10px] text-muted-ink">{ROLE_LABEL[role]}</p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={handleLogout} aria-label="Log out">
            <LogOut className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-canvas">
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:flex md:w-[236px] md:flex-col">
        {rail}
      </aside>

      <header className="sticky top-0 z-20 border-b border-line bg-canvas/95 backdrop-blur-sm md:pl-[236px]">
        <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
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
              <span className="hidden sm:inline">Office</span>
              <span className="hidden text-line-strong sm:inline">/</span>
              <span className="truncate font-medium text-ink">{current?.label ?? "Overview"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-[5px] border border-line bg-surface px-2 py-1 text-[10px] font-medium text-muted-ink">
              <Eye className="size-3" /> Read-only
            </span>
            <div className="flex size-8 items-center justify-center rounded-full border border-line bg-surface text-[10.5px] font-semibold text-ink">
              {userName.slice(0, 2).toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <div className="md:pl-[236px]">
        <main className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
