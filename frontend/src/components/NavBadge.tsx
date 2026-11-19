import type { NavBadgeKey } from "@/lib/nav-badges"

const BADGE_LABEL: Record<NavBadgeKey, string> = {
  concerns: "unresolved concerns",
  missed: "missed collections",
  today: "collections scheduled today",
}

type Props = {
  badgeKey: NavBadgeKey
  count?: number
}

export function NavBadge({ badgeKey, count }: Props) {
  if (!count || count < 1) return null

  const label = `${count} ${BADGE_LABEL[badgeKey]}`

  return (
    <span
      title={label}
      aria-label={label}
      className="ml-auto inline-flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-alarm px-1.5 text-[10px] leading-none font-semibold tabular-nums text-white"
    >
      {count > 99 ? "99+" : count}
    </span>
  )
}
