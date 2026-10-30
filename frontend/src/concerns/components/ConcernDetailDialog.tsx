import { useState } from "react"
import {
  CheckCircle2,
  ExternalLink,
  Eye,
  Loader2,
  MapPin,
  RotateCcw,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { StatusTag } from "@/components/ecotrack/StatusTag"
import { mediaUrl } from "../api"
import type { ApiConcern, ConcernStatus } from "../api"

type Props = {
  concern: ApiConcern | null
  open: boolean
  onOpenChange: (open: boolean) => void
  canManage?: boolean
  working?: boolean
  onStatusChange: (concern: ApiConcern, status: ConcernStatus, note?: string) => Promise<boolean>
}

function formatWhen(value: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function ConcernDetailDialog({
  concern,
  open,
  onOpenChange,
  canManage = false,
  working = false,
  onStatusChange,
}: Props) {
  const [mode, setMode] = useState<"view" | "resolve">("view")
  const [note, setNote] = useState("")
  const [noteError, setNoteError] = useState<string | null>(null)

  if (!concern) return null

  const photo = mediaUrl(concern.photo_url)
  const location = concern.location

  const handleOpenChange = (next: boolean) => {
    if (working) return
    if (!next) {
      setMode("view")
      setNote("")
      setNoteError(null)
    }
    onOpenChange(next)
  }

  const handleResolve = async () => {
    const trimmed = note.trim()

    if (trimmed.length < 5) {
      setNoteError("Describe what was done — at least 5 characters.")
      return
    }

    const ok = await onStatusChange(concern, "Resolved", trimmed)

    if (ok) {
      setMode("view")
      setNote("")
      setNoteError(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[88dvh] overflow-y-auto max-sm:top-auto max-sm:bottom-0 max-sm:max-h-[92dvh] max-sm:max-w-none max-sm:translate-y-0 max-sm:rounded-b-none max-sm:rounded-t-[14px]">
        <DialogHeader className="pr-8">
          <p className="label">Concern #{concern.id}</p>
          <DialogTitle>Problem details</DialogTitle>
          <DialogDescription>Reported {formatWhen(concern.created_at)}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <StatusTag status={concern.status} />
          {concern.resolved_at && (
            <span className="num text-[10.5px] text-muted-ink">
              Resolved {formatWhen(concern.resolved_at)}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 rounded-[10px] border border-line bg-surface-2 p-3 sm:grid-cols-2">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0 text-muted-ink" />
            <div className="min-w-0">
              <p className="label">Location</p>
              <p className="text-[12.5px] font-medium text-ink">{location?.name ?? "Unknown"}</p>
              <p className="text-[10.5px] text-muted-ink">
                {[location?.building, location?.floor_or_area].filter(Boolean).join(" · ") || "—"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <User className="mt-0.5 size-4 shrink-0 text-muted-ink" />
            <div className="min-w-0">
              <p className="label">Reported by</p>
              <p className="truncate text-[12.5px] font-medium text-ink">
                {concern.reporter?.name ?? "Unknown"}
              </p>
              <p className="truncate text-[10.5px] text-muted-ink">{concern.office?.name ?? "—"}</p>
            </div>
          </div>
        </div>

        <div>
          <p className="label mb-1.5">Description</p>
          <p className="text-[13px] leading-6 break-words text-ink-2">{concern.description}</p>
        </div>

        {photo && (
          <div>
            <p className="label mb-1.5">Photo</p>
            <a
              href={photo}
              target="_blank"
              rel="noreferrer"
              className="block overflow-hidden rounded-[8px] border border-line"
            >
              <img
                src={photo}
                alt="Concern attachment"
                className="max-h-[300px] w-full bg-surface-2 object-contain"
              />
            </a>
            <a
              href={photo}
              target="_blank"
              rel="noreferrer"
              className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium text-brand hover:underline"
            >
              <ExternalLink className="size-3" /> Open full size
            </a>
          </div>
        )}

        {concern.status === "Resolved" && concern.resolution_note && (
          <div className="rounded-[10px] border border-ok/25 bg-ok-soft p-3">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-ok">
              <CheckCircle2 className="size-3.5" /> Resolution
            </p>
            <p className="mt-1 text-[12.5px] leading-5 break-words text-ink-2">{concern.resolution_note}</p>
            {concern.resolved_by && (
              <p className="mt-1.5 text-[10.5px] text-muted-ink">
                By {concern.resolved_by.name}
                {concern.resolved_at ? ` · ${formatWhen(concern.resolved_at)}` : ""}
              </p>
            )}
          </div>
        )}

        {mode === "resolve" && (
          <div className="space-y-1.5 rounded-[10px] border border-line p-3">
            <Label htmlFor="resolution-note">Resolution note</Label>
            <p className="text-[11px] text-muted-ink">Explain what was done — the office will see this.</p>
            <Textarea
              id="resolution-note"
              value={note}
              onChange={(event) => {
                setNote(event.target.value)
                setNoteError(null)
              }}
              placeholder="e.g. Bin emptied, lid replaced, and the area was cleaned."
              className="min-h-[96px]"
              maxLength={1000}
              autoFocus
            />
            {noteError && <p className="text-[11px] text-alarm">{noteError}</p>}
          </div>
        )}

        <DialogFooter>
          {mode === "resolve" ? (
            <>
              <Button
                variant="outline"
                className="min-h-11 sm:min-h-10"
                disabled={working}
                onClick={() => {
                  setMode("view")
                  setNoteError(null)
                }}
              >
                Back
              </Button>
              <Button className="min-h-11 sm:min-h-10" disabled={working} onClick={handleResolve}>
                {working ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                Mark as resolved
              </Button>
            </>
          ) : (
            <>
              {canManage && concern.status === "Open" && (
                <Button
                  className="min-h-11 sm:min-h-10"
                  disabled={working}
                  onClick={() => onStatusChange(concern, "Acknowledged")}
                >
                  {working ? <Loader2 className="size-4 animate-spin" /> : <Eye className="size-4" />}
                  Acknowledge
                </Button>
              )}
              {canManage && concern.status !== "Resolved" && (
                <Button
                  variant="outline"
                  className="min-h-11 border-ok/30 text-ok sm:min-h-10"
                  disabled={working}
                  onClick={() => setMode("resolve")}
                >
                  <CheckCircle2 className="size-4" /> Resolve
                </Button>
              )}
              {canManage && concern.status === "Resolved" && (
                <Button
                  variant="outline"
                  className="min-h-11 sm:min-h-10"
                  disabled={working}
                  onClick={() => onStatusChange(concern, "Open")}
                >
                  <RotateCcw className="size-4" /> Reopen
                </Button>
              )}
              <Button
                variant="ghost"
                className="min-h-11 sm:min-h-10"
                disabled={working}
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
