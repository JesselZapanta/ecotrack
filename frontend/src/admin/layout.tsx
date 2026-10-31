import { useEffect, useState } from "react"
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom"
import { useAuth, ROLE_LABEL } from "@/lib/store"
import { BrandMark, BrandName } from "@/components/brand/Logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { adminNav } from "@/components/nav"
import { LogOut, Menu, Search } from "lucide-react"
import { toast } from "sonner"

export function AdminLayout() {
  const { role, userName, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const [query, setQuery] = useState("")

  const current = adminNav.find(
    (item) => location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)
  )

  const results = adminNav.filter((item) =>
    item.label.toLowerCase().includes(query.trim().toLowerCase())
  )

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const handleLogout = async () => {
    await logout()
    toast("Logged out.")
    navigate("/login", { replace: true })
  }

  const rail = (
    <div className="flex h-full flex-col bg-sidebar" onClick={() => setNavOpen(false)}>
      <div className="px-4 pt-5 pb-4">
        <Link to="/admin/dashboard" className="flex items-center gap-2.5">
          <BrandMark size="sm" tileClassName="border-transparent" />
          <BrandName tone="light" subtitle="Admin workspace" />
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2 no-scrollbar">
        <p className="px-2.5 pt-2 pb-2 text-[9.5px] font-semibold tracking-[0.12em] text-sidebar-muted uppercase">
          Manage
        </p>
        <nav className="space-y-0.5">
          {adminNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin/dashboard"}
              className={({ isActive }) =>
                `relative flex items-center gap-2.5 rounded-[7px] px-2.5 py-2 text-[12.5px] font-medium transition-colors ${
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
        <div className="flex items-center gap-1 rounded-[8px] px-1 py-1">
          <Link
            to="/admin/account"
            title="My account"
            aria-label="My account"
            className="flex min-w-0 flex-1 items-center gap-2.5 rounded-[6px] px-1.5 py-1.5 outline-none transition-colors hover:bg-white/5 focus-visible:shadow-[var(--focus-ring)]"
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-[10.5px] font-semibold text-white">
              {userName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] leading-tight font-medium text-white">{userName}</p>
              <p className="truncate text-[10px] text-sidebar-muted">{ROLE_LABEL[role]}</p>
            </div>
          </Link>
          <button
            onClick={handleLogout}
            className="flex size-7 shrink-0 items-center justify-center rounded-[6px] text-sidebar-muted transition-colors hover:bg-white/10 hover:text-white"
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
              <span className="hidden sm:inline">EcoTrack</span>
              <span className="hidden text-line-strong sm:inline">/</span>
              <span className="truncate font-medium text-ink">{current?.label ?? "Overview"}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden h-8 items-center gap-2 rounded-[7px] border border-line bg-surface px-2.5 text-[12px] text-muted-ink transition-colors hover:border-line-strong sm:flex"
            >
              <Search className="size-3.5" />
              <span>Search</span>
              <kbd className="ml-4 rounded-[4px] border border-line bg-surface-2 px-1 font-mono text-[10px] text-muted-ink">
                ⌘K
              </kbd>
            </button>
            <Button variant="ghost" size="icon-sm" className="sm:hidden" onClick={() => setSearchOpen(true)}>
              <Search className="size-4" />
            </Button>
            <Link
              to="/admin/account"
              title="My account"
              aria-label="My account"
              className="ml-1 flex size-8 items-center justify-center rounded-full border border-line bg-surface text-[10.5px] font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
            >
              {userName.slice(0, 2).toUpperCase()}
            </Link>
          </div>
        </div>
      </header>

      <div className="md:pl-[248px]">
        <main className="mx-auto max-w-[1280px] px-4 py-6 pb-10 sm:px-6 sm:py-8 lg:px-8">
          <Outlet />
        </main>
      </div>

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="top-[20%] max-w-[520px] translate-y-0 gap-0 p-0" showCloseButton={false}>
          <DialogTitle className="sr-only">Search pages</DialogTitle>
          <div className="flex items-center gap-2 border-b border-line px-4">
            <Search className="size-4 text-muted-ink" />
            <Input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Jump to a page…"
              className="h-12 border-0 bg-transparent px-0 focus-visible:shadow-none"
            />
            <kbd className="rounded-[4px] border border-line bg-surface-2 px-1 font-mono text-[10px] text-muted-ink">
              esc
            </kbd>
          </div>
          <div className="max-h-[300px] overflow-y-auto p-2">
            {results.length === 0 ? (
              <p className="px-3 py-6 text-center text-[12.5px] text-muted-ink">No pages match “{query}”.</p>
            ) : (
              results.map((item) => (
                <button
                  key={item.to}
                  onClick={() => {
                    navigate(item.to)
                    setSearchOpen(false)
                    setQuery("")
                  }}
                  className="flex w-full items-center gap-2.5 rounded-[7px] px-3 py-2 text-left text-[13px] text-ink transition-colors hover:bg-surface-2"
                >
                  <span className="text-muted-ink">{item.icon}</span>
                  {item.label}
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
