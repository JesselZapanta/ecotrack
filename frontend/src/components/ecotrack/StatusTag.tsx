import { cn } from "@/lib/utils"

export type Status =
  | "Pending"
  | "Scheduled"
  | "Collected"
  | "Missed"
  | "Cancelled"
  | "Open"
  | "Acknowledged"
  | "Resolved"

type Tone = { text: string; bg: string; border: string; dot: string }

const tones: Record<Status, Tone> = {
  Pending: { text: "text-muted-ink", bg: "bg-surface-2", border: "border-line", dot: "bg-muted-ink/50" },
  Scheduled: { text: "text-info", bg: "bg-info-soft", border: "border-info/20", dot: "bg-info" },
  Collected: { text: "text-ok", bg: "bg-ok-soft", border: "border-ok/20", dot: "bg-ok" },
  Missed: { text: "text-alarm", bg: "bg-alarm-soft", border: "border-alarm/20", dot: "bg-alarm" },
  Cancelled: { text: "text-muted-ink", bg: "bg-transparent", border: "border-transparent", dot: "bg-muted-ink/40" },
  Open: { text: "text-warn", bg: "bg-warn-soft", border: "border-warn/20", dot: "bg-warn" },
  Acknowledged: { text: "text-info", bg: "bg-info-soft", border: "border-info/20", dot: "bg-info" },
  Resolved: { text: "text-ok", bg: "bg-ok-soft", border: "border-ok/20", dot: "bg-ok" },
}

export function StatusTag({ status, className }: { status: Status; className?: string }) {
  const tone = tones[status] ?? tones.Pending
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[6px] border px-2 py-0.5 text-[11px] leading-[18px] font-medium whitespace-nowrap",
        tone.text,
        tone.bg,
        tone.border,
        status === "Cancelled" && "line-through",
        className
      )}
    >
      <span className={cn("size-[5px] rounded-full", tone.dot)} aria-hidden />
      {status}
    </span>
  )
}
