import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { apiMessage, createCategory, updateCategory } from "@/admin/categories/api"
import type { ApiCategory } from "@/admin/categories/types"
import { AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

type Props = {
  editing: ApiCategory | null
  onClose: () => void
  onSaved: () => void
}

const HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/

export function CategoryFormDialog({ editing, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    name: editing?.name ?? "",
    color: editing?.color_code ?? "#2E7D4F",
    description: editing?.description ?? "",
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const save = async () => {
    if (!form.name.trim()) {
      setError("Enter a category name.")
      return
    }
    if (!HEX_PATTERN.test(form.color.trim())) {
      setError("Enter a valid hex color, e.g. #2E7D4F.")
      return
    }

    setSaving(true)
    setError(null)

    const payload = {
      name: form.name.trim(),
      color_code: form.color.trim().toUpperCase(),
      description: form.description.trim() || null,
    }

    try {
      if (editing) {
        await updateCategory(editing.id, payload)
        toast.success("Category updated.")
      } else {
        await createCategory(payload)
        toast.success("Category created.")
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
          <DialogTitle>{editing ? "Edit category" : "Add category"}</DialogTitle>
          <DialogDescription>
            Category colors identify waste type and nothing else.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Category name</Label>
            <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Biodegradable" />
          </div>

          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={HEX_PATTERN.test(form.color) ? form.color : "#2E7D4F"}
                onChange={(event) => setForm({ ...form, color: event.target.value })}
                className="w-14 p-1"
                aria-label="Pick a color"
              />
              <Input
                value={form.color}
                onChange={(event) => setForm({ ...form, color: event.target.value })}
                placeholder="#2E7D4F"
                className="num flex-1"
              />
            </div>
            <div className="mt-2 h-8 rounded-[6px] border border-line" style={{ background: HEX_PATTERN.test(form.color) ? form.color : "transparent" }} />
          </div>

          <div className="space-y-1.5">
            <Label>Description (optional)</Label>
            <Textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="What belongs in this bin?"
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
            {editing ? "Save changes" : "Create category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
