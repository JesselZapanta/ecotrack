import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiMessage, createLocation, updateLocation } from "@/admin/locations/api"
import type { ApiLocation } from "@/admin/locations/types"
import { AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

type Props = {
  editing: ApiLocation | null
  onClose: () => void
  onSaved: () => void
}

export function LocationFormDialog({ editing, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    name: editing?.name ?? "",
    building: editing?.building ?? "",
    floorOrArea: editing?.floor_or_area ?? "",
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const save = async () => {
    if (!form.name.trim()) {
      setError("Enter a location name.")
      return
    }
    if (!form.building.trim()) {
      setError("Enter a building.")
      return
    }

    setSaving(true)
    setError(null)

    const payload = {
      name: form.name.trim(),
      building: form.building.trim(),
      floor_or_area: form.floorOrArea.trim() || null,
    }

    try {
      if (editing) {
        await updateLocation(editing.id, payload)
        toast.success("Location updated.")
      } else {
        await createLocation(payload)
        toast.success("Location created.")
      }

      onSaved()
      onClose()
    } catch (err) {
      const message = apiMessage(err)
      setError(message)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit location" : "Add location"}</DialogTitle>
          <DialogDescription>
            Buildings, floors and areas where waste is recorded.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Location name</Label>
            <Input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="e.g. Library"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Building</Label>
              <Input
                value={form.building}
                onChange={(event) => setForm({ ...form, building: event.target.value })}
                placeholder="e.g. Library"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Floor / area (optional)</Label>
              <Input
                value={form.floorOrArea}
                onChange={(event) => setForm({ ...form, floorOrArea: event.target.value })}
                placeholder="e.g. 2nd floor"
              />
            </div>
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
            {editing ? "Save changes" : "Create location"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
