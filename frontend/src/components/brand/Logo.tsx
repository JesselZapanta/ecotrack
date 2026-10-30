import { cn } from "@/lib/utils"

const tileSizes = {
  xs: "size-7 rounded-[8px]",
  sm: "size-8 rounded-[10px]",
  md: "size-10 rounded-[12px]",
  lg: "size-12 rounded-[14px]",
  xl: "size-14 rounded-[16px]",
}

const markSizes = {
  xs: "size-4",
  sm: "size-5",
  md: "size-6",
  lg: "size-7",
  xl: "size-9",
}

export function BrandMark({
  size = "md",
  className,
  tileClassName,
  alt = "",
}: {
  size?: keyof typeof tileSizes
  className?: string
  tileClassName?: string
  alt?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center border border-white/70 bg-white shadow-[var(--shadow-sm)]",
        tileSizes[size],
        tileClassName,
        className
      )}
    >
      <img src="/brand/logo-icon.svg" alt={alt} className={cn("block", markSizes[size])} />
    </span>
  )
}

export function BrandLockup({ className, alt = "EcoTrack TCGC — Tangub City Global College" }: { className?: string; alt?: string }) {
  return <img src="/brand/logo-horizontal.svg" alt={alt} className={cn("block h-9 w-auto", className)} />
}

export function BrandName({
  className,
  subtitle = "TCGC",
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
        EcoTrack
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
