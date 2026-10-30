import { cn } from "@/lib/utils"
import type { Status } from "./StatusTag"

export type RouteStop = {
  id: string
  label: string
  time: string
  status: Status
  color: string
}

const nodeStyles: Record<string, string> = {
  Collected: "bg-brand border-brand",
  Scheduled: "bg-surface border-line-strong",
  Missed: "bg-alarm border-alarm",
  Cancelled: "bg-surface-2 border-line",
}

export function RouteStrip({
  stops,
  collected,
  total,
  compact = false,
}: {
  stops: RouteStop[]
  collected: number
  total: number
  compact?: boolean
}) {
  const percent = total === 0 ? 0 : Math.round((collected / total) * 100)

  return (
    <div aria-label={`${collected} of ${total} collections completed`}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="display text-[34px] leading-none text-ink">
            {collected}
            <span className="text-[18px] text-muted-ink"> / {total}</span>
          </p>
          <p className="mt-1 text-[11.5px] text-muted-ink">collected</p>
        </div>
        <span className="num text-[12px] text-muted-ink">{percent}%</span>
      </div>

      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-brand transition-[width] duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="relative">
        <div className="no-scrollbar mt-5 flex items-start overflow-x-auto pb-1">
          {stops.map((stop, index) => (
            <div key={stop.id} className="flex items-start">
              <div className={cn("flex flex-col items-center gap-2", compact ? "min-w-[40px]" : "min-w-[52px]")}>
                <span
                  className={cn(
                    "size-[11px] rounded-full border-2",
                    nodeStyles[stop.status] ?? nodeStyles.Scheduled
                  )}
                  title={`${stop.label} · ${stop.status}`}
                />
                <span className="text-[10px] leading-none text-muted-ink">{stop.time}</span>
                {!compact && (
                  <span className="max-w-[64px] text-center text-[9.5px] leading-[1.15] text-ink-2">{stop.label}</span>
                )}
              </div>
              {index < stops.length - 1 && (
                <span className="mt-[5px] h-px w-4 shrink-0 bg-line-strong sm:w-7" aria-hidden />
              )}
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-surface to-transparent sm:hidden" />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-line pt-3">
        {[
          { label: "Collected", className: "bg-brand" },
          { label: "Scheduled", className: "bg-surface border-2 border-line-strong" },
          { label: "Missed", className: "bg-alarm" },
        ].map((item) => (
          <span key={item.label} className="inline-flex items-center gap-1.5 text-[10.5px] text-muted-ink">
            <span className={cn("size-[7px] rounded-full", item.className)} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  )
}
