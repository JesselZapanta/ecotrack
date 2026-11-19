import { NavLink } from "react-router-dom"
import { NavBadge } from "@/components/NavBadge"
import type { NavItem } from "@/components/nav"
import { useNavBadges } from "@/lib/nav-badges"

type Variant = "dark" | "dark-touch" | "light"

type Props = {
  items: NavItem[]
  variant?: Variant
}

export function SideNavLinks({ items, variant = "dark" }: Props) {
  const badges = useNavBadges()
  const light = variant === "light"

  return (
    <nav className="space-y-0.5">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to.endsWith("/dashboard")}
          className={({ isActive }) => {
            const layout = light
              ? "flex items-center gap-2.5 rounded-[7px] px-2.5 py-2 text-[12.5px] font-medium transition-colors"
              : [
                  "relative flex items-center gap-2.5 rounded-[7px] px-2.5 py-2 text-[12.5px] font-medium transition-colors",
                  variant === "dark-touch" ? "min-h-11 md:min-h-0" : "",
                ]
                  .filter(Boolean)
                  .join(" ")

            const tone = isActive
              ? light
                ? "bg-brand-soft text-brand-ink"
                : "bg-sidebar-2 text-white"
              : light
                ? "text-muted-ink hover:bg-surface-2 hover:text-ink"
                : "text-sidebar-text hover:bg-white/5 hover:text-white"

            return `${layout} ${tone}`
          }}
        >
          {({ isActive }) => (
            <>
              {!light && isActive && (
                <span className="absolute top-1/2 left-0 h-3.5 w-[2px] -translate-y-1/2 rounded-full bg-lime" />
              )}
              <span className={light ? undefined : isActive ? "text-white" : "text-sidebar-muted"}>
                {item.icon}
              </span>
              <span className="min-w-0 truncate">{item.label}</span>
              {item.badgeKey && <NavBadge badgeKey={item.badgeKey} count={badges[item.badgeKey]} />}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
