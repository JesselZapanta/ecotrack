import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiMessage, createOffice, updateOffice } from "@/admin/offices/api"
import type { ApiOffice, LocationOption } from "@/admin/offices/types"
import { AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

type Props = {
  editing: ApiOffice | null
  locations: LocationOption[]
  onClose: () => void
  onSaved: () => void
}

export function OfficeFormDialog({ editing, locations, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    name: editing?.name ?? "",
    floor: editing?.floor ?? "",
    type: editing?.type ?? "",
    status: editing?.status ?? "Active",
    contact: editing?.contact_person ?? "",
    locationId: editing?.location_id ? String(editing.location_id) : "",
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const save = async () => {
    if (!form.name.trim()) {
      setError("Enter an office name.")
      return
    }

    if (!form.locationId) {
      setError("Choose a location for this office.")
      return
    }

    setSaving(true)
    setError(null)

    const payload = {
      name: form.name.trim(),
      floor: form.floor.trim() || null,
      type: form.type.trim() || null,
      status: form.status,
      contact_person: form.contact.trim() || null,
      location_id: Number(form.locationId),
    }

    try {
      if (editing) {
        await updateOffice(editing.id, payload)
        toast.success("Office updated.")
      } else {
        await createOffice(payload)
        toast.success("Office created.")
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
          <DialogTitle>{editing ? "Edit office" : "Add office"}</DialogTitle>
          <DialogDescription>
            Each office belongs to a location, which scopes what office accounts can see.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Office / room name</Label>
            <Input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="e.g. AB-102"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Floor (optional)</Label>
              <Input
                value={form.floor}
                onChange={(event) => setForm({ ...form, floor: event.target.value })}
                placeholder="e.g. Ground Floor"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Type (optional)</Label>
              <Input
                value={form.type}
                onChange={(event) => setForm({ ...form, type: event.target.value })}
                placeholder="e.g. Lecture Room"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value })}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Contact person (optional)</Label>
            <Input
              value={form.contact}
              onChange={(event) => setForm({ ...form, contact: event.target.value })}
              placeholder="e.g. Dean Santos"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Location</Label>
            <Select
              value={form.locationId}
              onValueChange={(value) => setForm({ ...form, locationId: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={String(location.id)}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            {editing ? "Save changes" : "Create office"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
