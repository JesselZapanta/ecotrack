import { Button } from "@/components/ui/button"
import { wasteCategories } from "@/lib/mockData"

type Props = {
  title: string
  subtitle: string
  status: React.ReactNode
  categoryIds: string[]
  actionLabel: string
  onAction?: () => void
  meta?: string
  actionIcon?: React.ReactNode
  className?: string
  actionClassName?: string
}

export function LidCard({
  title,
  subtitle,
  status,
  categoryIds,
  actionLabel,
  onAction,
  meta,
  actionIcon,
  className = "",
  actionClassName = "",
}: Props) {
  const categories = categoryIds
    .map((id) => wasteCategories.find((category) => category.id === id))
    .filter(Boolean) as typeof wasteCategories

  const accent = categories[0]?.color ?? "var(--line-strong)"

  return (
    <div
      className={`rounded-[12px] border border-l-[3px] border-line bg-surface p-4 transition-colors hover:border-line-strong ${className}`}
      style={{ borderLeftColor: accent }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[13.5px] leading-snug font-medium text-ink">{title}</p>
          <p className="mt-0.5 text-[11.5px] text-muted-ink">{subtitle}</p>
          {meta && <p className="mt-0.5 text-[11.5px] text-muted-ink">{meta}</p>}
        </div>
        {status}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        {categories.map((category) => (
          <span key={category.id} className="inline-flex items-center gap-1.5 text-[11px] text-ink-2">
            <span className="size-[6px] rounded-full" style={{ background: category.color }} aria-hidden />
            {category.name}
          </span>
        ))}
      </div>

      <Button onClick={onAction} className={`mt-3 w-full ${actionClassName}`}>
        {actionIcon}
        {actionLabel}
      </Button>
    </div>
  )
}
