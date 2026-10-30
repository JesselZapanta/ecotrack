import { ArrowDownRight, ArrowUpRight } from "lucide-react"

type Props = {
  label: string
  value: string | number
  unit?: string
  trend?: { value: string; up?: boolean }
  spark?: number[]
  accent?: string
  hint?: string
}

function Sparkline({ points, color }: { points: number[]; color: string }) {
  const width = 76
  const height = 26
  const max = Math.max(...points, 1)
  const min = Math.min(...points, 0)
  const span = max - min || 1
  const step = width / Math.max(points.length - 1, 1)

  const path = points
    .map((point, index) => {
      const x = index * step
      const y = height - ((point - min) / span) * (height - 4) - 2
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(" ")

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" aria-hidden>
      <path d={path} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function StatTile({ label, value, unit, trend, spark, accent = "var(--brand)", hint }: Props) {
  return (
    <div className="rounded-[12px] border border-line bg-surface p-4 sm:p-5">
      <p className="label">{label}</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div className="flex items-baseline gap-1.5">
          <p className="display text-[30px] leading-none text-ink sm:text-[34px]">{value}</p>
          {unit && <span className="text-[11.5px] font-medium text-muted-ink">{unit}</span>}
        </div>
        {spark && (
          <span className="hidden sm:block">
            <Sparkline points={spark} color={accent} />
          </span>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2">
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${
              trend.up ? "text-ok" : "text-alarm"
            }`}
          >
            {trend.up ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
            {trend.value}
          </span>
        )}
        {hint && <span className="text-[11px] text-muted-ink">{hint}</span>}
      </div>
    </div>
  )
}
