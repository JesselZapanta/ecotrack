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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { MultiSelectField } from "@/admin/schedules/components/MultiSelectField"
import { apiMessage, createSchedule, updateSchedule } from "@/admin/schedules/api"
import type { ApiSchedule, FilterOption } from "@/admin/schedules/types"
import { AlertCircle, Check, Loader2 } from "lucide-react"
import { toast } from "sonner"

type Props = {
  editing: ApiSchedule | null
  categories: FilterOption[]
  locations: FilterOption[]
  assignees: FilterOption[]
  onClose: () => void
  onSaved: () => void
}

const today = () => new Date().toISOString().slice(0, 10)

export function ScheduleFormDialog({ editing, categories, locations, assignees, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    date: editing?.scheduled_date ?? today(),
    windowStart: editing?.window_start ?? "07:00",
    windowEnd: editing?.window_end ?? "09:00",
    recurrence: (editing?.recurrence_rule ?? "once") as "once" | "daily" | "weekly",
    assigneeId: editing?.assigned_to ? String(editing.assigned_to) : "",
    locationIds: editing?.locations.map((location) => location.id) ?? [],
    categoryIds: editing?.categories.map((category) => category.id) ?? [],
    notes: editing?.notes ?? "",
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const toggle = (key: "locationIds" | "categoryIds", id: number) => {
    setForm((current) => ({
      ...current,
      [key]: current[key].includes(id)
        ? current[key].filter((value) => value !== id)
        : [...current[key], id],
    }))
  }

  const save = async () => {
    setError(null)

    if (!form.date) return setError("Pick a collection date.")
    if (form.windowEnd <= form.windowStart) return setError("The end time must be after the start time.")
    if (form.locationIds.length === 0) return setError("Select at least one location.")
    if (form.categoryIds.length === 0) return setError("Select at least one waste category.")

    const payload = {
      scheduled_date: form.date,
      window_start: form.windowStart,
      window_end: form.windowEnd,
      recurrence_rule: form.recurrence,
      assigned_to: form.assigneeId ? Number(form.assigneeId) : null,
      location_ids: form.locationIds,
      category_ids: form.categoryIds,
      notes: form.notes.trim() || null,
    }

    setSaving(true)
    try {
      if (editing) {
        await updateSchedule(editing.id, payload)
        toast.success("Schedule updated.")
      } else {
        await createSchedule(payload)
        toast.success("Schedule created.")
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
      <DialogContent className="max-h-[92dvh] max-w-[560px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit schedule" : "Create schedule"}</DialogTitle>
          <DialogDescription>
            Date, time window, locations and every waste category collected on this run.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="schedule-date">Date</Label>
              <Input
                id="schedule-date"
                type="date"
                value={form.date}
                onChange={(event) => setForm({ ...form, date: event.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Recurrence</Label>
              <Select
                value={form.recurrence}
                onValueChange={(value) =>
                  setForm({ ...form, recurrence: value as "once" | "daily" | "weekly" })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">One-time</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="window-start">Start</Label>
              <Input
                id="window-start"
                type="time"
                value={form.windowStart}
                onChange={(event) => setForm({ ...form, windowStart: event.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="window-end">End</Label>
              <Input
                id="window-end"
                type="time"
                value={form.windowEnd}
                onChange={(event) => setForm({ ...form, windowEnd: event.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Assigned maintenance</Label>
            <Select
              value={form.assigneeId || "none"}
              onValueChange={(value) => setForm({ ...form, assigneeId: value === "none" ? "" : value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Unassigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned</SelectItem>
                {assignees.map((assignee) => (
                  <SelectItem key={assignee.id} value={String(assignee.id)}>
                    {assignee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between gap-2">
              <Label>Waste categories</Label>
              <span className="text-[11px] text-muted-ink">
                {form.categoryIds.length} selected
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => {
                const selected = form.categoryIds.includes(category.id)
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => toggle("categoryIds", category.id)}
                    aria-pressed={selected}
                    className={`inline-flex min-h-9 items-center gap-1.5 rounded-[7px] border px-2.5 text-[12px] font-medium transition-colors ${
                      selected
                        ? "border-brand/40 bg-brand-soft text-brand-ink"
                        : "border-line bg-surface text-muted-ink hover:border-line-strong hover:text-ink"
                    }`}
                  >
                    <span
                      className="size-[7px] shrink-0 rounded-full"
                      style={{ background: category.color_code ?? "#6E756D" }}
                      aria-hidden
                    />
                    {category.name}
                    {selected && <Check className="size-3" />}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-2">
              <Label htmlFor="schedule-locations">Locations</Label>
              <span className="text-[11px] text-muted-ink">{form.locationIds.length} selected</span>
            </div>
            <MultiSelectField
              id="schedule-locations"
              options={locations}
              selected={form.locationIds}
              onToggle={(id) => toggle("locationIds", id)}
              onClear={() => setForm((current) => ({ ...current, locationIds: [] }))}
              placeholder="Select locations"
              emptyLabel="No locations yet — add one under Master data"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="schedule-notes">Notes (optional)</Label>
            <Textarea
              id="schedule-notes"
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
              placeholder="e.g. Use the service entrance, avoid the 8am class change"
              rows={3}
            />
          </div>

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
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            {editing ? "Save changes" : "Create schedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
