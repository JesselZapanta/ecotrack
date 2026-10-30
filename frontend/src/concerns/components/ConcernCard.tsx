import { ExternalLink, ImageIcon, MapPin, CheckCircle2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { StatusTag } from "@/components/ecotrack/StatusTag"
import { mediaUrl } from "../api"
import type { ApiConcern } from "../api"

const statusBorder: Record<ApiConcern["status"], string> = {
  Open: "border-l-warn",
  Acknowledged: "border-l-info",
  Resolved: "border-l-ok",
}

function formatWhen(value: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function ConcernCard({
  concern,
  actions,
}: {
  concern: ApiConcern
  actions?: React.ReactNode
}) {
  const photo = mediaUrl(concern.photo_url)
  const location = concern.location

  return (
    <Card className={`border-l-[3px] ${statusBorder[concern.status]}`}>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[13px] font-medium">
              <MapPin className="size-3.5 shrink-0 text-muted-ink" />
              <span className="truncate">{location?.name ?? "Unknown location"}</span>
            </p>
            <p className="num mt-0.5 truncate text-[10.5px] text-muted-ink">
              {location?.floor_or_area ? `${location.floor_or_area} · ` : ""}
              {concern.reporter?.name ?? "Unknown reporter"} · {formatWhen(concern.created_at)}
            </p>
          </div>
          <StatusTag status={concern.status} />
        </div>

        <p className="text-[12.5px] leading-5 break-words text-ink-2">{concern.description}</p>

        {concern.status === "Resolved" && concern.resolution_note && (
          <div className="rounded-[8px] border border-ok/20 bg-ok-soft px-2.5 py-2">
            <p className="flex items-center gap-1 text-[9.5px] font-semibold tracking-[0.06em] text-ok uppercase">
              <CheckCircle2 className="size-3" /> Resolution
            </p>
            <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-4 text-ink-2">{concern.resolution_note}</p>
          </div>
        )}

        {photo && (
          <a
            href={photo}
            target="_blank"
            rel="noreferrer"
            className="group relative block overflow-hidden rounded-[8px] border border-line"
          >
            <img
              src={photo}
              alt="Concern attachment"
              loading="lazy"
              className="h-32 w-full object-cover transition-opacity group-hover:opacity-90 sm:h-40"
            />
            <span className="absolute right-2 bottom-2 inline-flex items-center gap-1 rounded-[5px] bg-ink/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
              <ExternalLink className="size-3" /> Open
            </span>
          </a>
        )}

        {!photo && concern.photo_path && (
          <p className="inline-flex items-center gap-1.5 text-[11px] text-muted-ink">
            <ImageIcon className="size-3.5" /> Photo attached
          </p>
        )}

        {actions && <div className="flex flex-wrap gap-2 border-t border-line pt-3">{actions}</div>}
      </CardContent>
    </Card>
  )
}
