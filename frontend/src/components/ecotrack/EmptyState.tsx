import { Button } from "@/components/ui/button"

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: React.ReactNode
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[12px] border border-line bg-surface px-6 py-14 text-center">
      <div className="mb-3 flex size-10 items-center justify-center rounded-[10px] bg-surface-2 text-muted-ink">
        {icon}
      </div>
      <p className="text-[14px] font-medium text-ink">{title}</p>
      {description && <p className="mt-1 max-w-[340px] text-[12.5px] leading-5 text-muted-ink">{description}</p>}
      {actionLabel && onAction && (
        <Button size="sm" className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
