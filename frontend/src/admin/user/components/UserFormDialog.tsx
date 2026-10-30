import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiMessage, createUser, updateUser } from "@/admin/user/api"
import type { ApiUser, OfficeOption } from "@/admin/user/types"
import type { Role } from "@/lib/mockData"
import { AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

type Props = {
  editing: ApiUser | null
  offices: OfficeOption[]
  onClose: () => void
  onSaved: () => void
}

export function UserFormDialog({ editing, offices, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    name: editing?.name ?? "",
    username: editing?.username ?? "",
    email: editing?.email ?? "",
    role: (editing?.role ?? "office") as Role,
    officeId: editing?.office_id ? String(editing.office_id) : "",
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const save = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError("Enter a name and email.")
      return
    }

    setSaving(true)
    setError(null)

    const payload = {
      name: form.name.trim(),
      username: form.username.trim() || null,
      email: form.email.trim(),
      role: form.role,
      office_id: form.officeId ? Number(form.officeId) : null,
    }

    try {
      if (editing) {
        await updateUser(editing.id, payload)
        toast.success("User updated.")
      } else {
        const { temporary_password } = await createUser(payload)
        toast.success(`User created. Temporary password: ${temporary_password}`, { duration: 12000 })
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
          <DialogTitle>{editing ? "Edit user" : "Add user"}</DialogTitle>
          <DialogDescription>
            {editing
              ? "Update the account details. The password is unchanged."
              : "A temporary password is generated and shown once after saving."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Full name</Label>
              <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Username (optional)</Label>
              <Input
                value={form.username}
                onChange={(event) => setForm({ ...form, username: event.target.value })}
                placeholder="e.g. ben"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value as Role })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Office</Label>
              <Select
                value={form.officeId || "none"}
                onValueChange={(value) => setForm({ ...form, officeId: value === "none" ? "" : value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No office</SelectItem>
                  {offices.map((office) => (
                    <SelectItem key={office.id} value={String(office.id)}>
                      {office.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
            {editing ? "Save changes" : "Create user"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
