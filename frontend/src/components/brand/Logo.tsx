import { cn } from "@/lib/utils"

const markSizes = {
  xs: "size-7",
  sm: "size-8",
  md: "size-10",
  lg: "size-12",
  xl: "size-14",
}

export function BrandMark({
  size = "md",
  className,
  tileClassName,
  alt = "",
}: {
  size?: keyof typeof markSizes
  className?: string
  tileClassName?: string
  alt?: string
}) {
  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center", markSizes[size], tileClassName, className)}>
      <img src="/brand/tcgc-logo.png" alt={alt} className="block size-full object-contain" />
    </span>
  )
}

export function BrandLockup({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <img src="/brand/tcgc-logo.png" alt="" className="h-full w-auto shrink-0" />
      <span className="flex min-w-0 flex-col">
        <span className="font-display text-[15px] leading-none font-bold tracking-[-0.03em] text-ink">
          TCGC EcoTrack
        </span>
        <span className="mt-1 text-[8.5px] font-medium tracking-[0.12em] text-muted-ink uppercase">
          Tangub City Global College
        </span>
      </span>
    </span>
  )
}

export function BrandName({
  className,
  subtitle = "Waste monitoring",
  tone = "dark",
}: {
  className?: string
  subtitle?: string
  tone?: "dark" | "light"
}) {
  return (
    <span className={cn("min-w-0", className)}>
      <span
        className={cn(
          "block font-display text-[14px] leading-none font-bold tracking-[-0.03em]",
          tone === "light" ? "text-white" : "text-ink"
        )}
      >
        TCGC EcoTrack
      </span>
      <span
        className={cn(
          "mt-1 block text-[9.5px] font-medium tracking-[0.12em] uppercase",
          tone === "light" ? "text-white/60" : "text-muted-ink"
        )}
      >
        {subtitle}
      </span>
    </span>
  )
}
