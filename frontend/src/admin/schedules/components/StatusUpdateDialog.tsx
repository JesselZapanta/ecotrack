import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { StatusTag } from "@/components/ecotrack/StatusTag"
import { apiMessage, updateScheduleStatus } from "@/admin/schedules/api"
import { createWasteRecord, wasteRecordMessage } from "@/admin/records/api"
import type { ApiSchedule } from "@/admin/schedules/types"
import { AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

type Props = {
  schedule: ApiSchedule
  onClose: () => void
  onSaved: () => void
}

const ALL_STATUSES = [
  "Scheduled",
  "Collected",
  "Missed",
  "Cancelled",
] as const

export function StatusUpdateDialog({ schedule, onClose, onSaved }: Props) {
  const options = ALL_STATUSES.filter((status) => status !== schedule.status)

  const [status, setStatus] = useState<string>(options[0] ?? "")
  const [remark, setRemark] = useState("")
  const [quantities, setQuantities] = useState<Record<number, string>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requiresRemark = status === "Missed"

  const save = async () => {
    setError(null)

    if (!status) {
      setError("Pick a new status.")
      return
    }

    if (requiresRemark && !remark.trim()) {
      setError("Add a short reason so the administrator knows what happened.")
      return
    }

    setSaving(true)
    try {
      const result = await updateScheduleStatus(schedule.id, status, remark)
      toast.success(result.message)

      if (status === "Collected") {
        const locationId = schedule.locations[0]?.id
        const today = new Date().toISOString().slice(0, 10)
        const saved: string[] = []

        for (const category of schedule.categories) {
          const kg = Number(quantities[category.id] ?? "")
          if (!locationId || !(kg > 0)) continue

          try {
            await createWasteRecord({
              location_id: locationId,
              category_id: category.id,
              schedule_id: schedule.id,
              date: today,
              quantity_kg: kg,
              remarks: remark.trim() || null,
            })
            saved.push(category.name)
          } catch (err) {
            toast.error(wasteRecordMessage(err))
          }
        }

        if (saved.length > 0) {
          toast.success(`Waste record${saved.length > 1 ? "s" : ""} saved: ${saved.join(", ")}.`)
        }
      }

      onSaved()
      onClose()
    } catch (err) {
      setError(apiMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !saving && onClose()}>
      <DialogContent className="max-h-[92dvh] max-w-[460px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update collection status</DialogTitle>
          <DialogDescription>
            {schedule.locations.map((location) => location.name).join(", ") || "This schedule"} ·{" "}
            {schedule.scheduled_date}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 rounded-[8px] border border-line bg-surface-2 px-3 py-2.5">
            <span className="text-[11px] font-semibold tracking-[0.08em] text-muted-ink uppercase">Current</span>
            <StatusTag status={schedule.status} />
          </div>

          {options.length === 0 ? (
            <p className="text-[12.5px] leading-5 text-muted-ink">
              This collection is already finished. Ask an administrator to reschedule or reopen it.
            </p>
          ) : (
            <>
              <div className="space-y-2">
                <Label>New status</Label>
                <div className="grid grid-cols-3 gap-2">
                  {options.map((option) => {
                    const tone =
                      option === "Scheduled"
                        ? { on: "border-info/40 bg-info-soft text-info", off: "border-line bg-surface text-muted-ink hover:border-info/40 hover:text-info" }
                        : option === "Collected"
                          ? { on: "border-ok/40 bg-ok-soft text-ok", off: "border-line bg-surface text-muted-ink hover:border-ok/40 hover:text-ok" }
                          : option === "Missed"
                            ? { on: "border-alarm/40 bg-alarm-soft text-alarm", off: "border-line bg-surface text-muted-ink hover:border-alarm/40 hover:text-alarm" }
                            : { on: "border-line bg-surface-2 text-muted-ink", off: "border-line bg-surface text-muted-ink hover:border-line-strong hover:text-ink" }
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setStatus(option)}
                        aria-pressed={status === option}
                        className={`min-h-11 rounded-[8px] border px-3 text-[12.5px] font-semibold transition-colors ${
                          status === option ? tone.on : tone.off
                        }`}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>
              </div>

              {status === "Collected" && (
                <div className="space-y-2">
                  <Label>Estimated quantity per category (kg)</Label>
                  <div className="space-y-2">
                    {schedule.categories.map((category) => (
                      <div key={category.id} className="flex items-center gap-2">
                        <span className="inline-flex min-w-0 flex-1 items-center gap-2 text-[12px] text-ink-2">
                          <span
                            className="size-[7px] shrink-0 rounded-full"
                            style={{ background: category.color_code }}
                            aria-hidden
                          />
                          <span className="truncate">{category.name}</span>
                        </span>
                        <div className="relative w-[120px] shrink-0">
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            value={quantities[category.id] ?? ""}
                            onChange={(event) =>
                              setQuantities((current) => ({ ...current, [category.id]: event.target.value }))
                            }
                            placeholder="0.0"
                            className="pr-8"
                          />
                          <span className="absolute top-1/2 right-3 -translate-y-1/2 text-[11px] text-muted-ink">
                            kg
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-ink">
                    Optional — one waste record is saved per category with a quantity.
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="status-remark">
                  Remark {requiresRemark ? "(required)" : "(optional)"}
                </Label>
                <Textarea
                  id="status-remark"
                  value={remark}
                  onChange={(event) => setRemark(event.target.value)}
                  placeholder={requiresRemark ? "e.g. Rain, bin not accessible" : "Anything worth noting"}
                  rows={3}
                />
              </div>
              </>
          )}
          {error && (
            <div className="flex items-start gap-2 rounded-[8px] border border-alarm/20 bg-alarm-soft px-3 py-2.5">
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-alarm" />
              <p className="text-[11.5px] leading-5 text-alarm">{error}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving || options.length === 0}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            Save status
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
