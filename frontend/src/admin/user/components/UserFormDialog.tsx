import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { OfficeCombobox } from "@/components/OfficeCombobox"
import { SearchSelect } from "@/components/SearchSelect"
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
    role: (editing?.role ?? "maintenance") as Role,
    officeId: editing?.office_id ? String(editing.office_id) : "",
    password: "",
    passwordConfirmation: "",
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const officeOptions =
    editing?.office && !offices.some((office) => office.id === editing.office?.id)
      ? [...offices, { id: editing.office.id, name: editing.office.name }]
      : offices

  const save = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError("Enter a name and email.")
      return
    }

    if (!editing) {
      if (form.password.length < 8) {
        setError("Use at least 8 characters for the password.")
        return
      }

      if (form.password !== form.passwordConfirmation) {
        setError("The passwords do not match.")
        return
      }
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
        await createUser({
          ...payload,
          password: form.password,
          password_confirmation: form.passwordConfirmation,
        })
        toast.success("User created.")
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
              : "Set the account password — it must be at least 8 characters."}
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
              <SearchSelect
                options={[
                  { value: "admin", label: "Administrator" },
                  { value: "maintenance", label: "Maintenance" },
                ]}
                value={form.role}
                onValueChange={(value) => setForm({ ...form, role: value as Role })}
                placeholder="Role"
                triggerClassName="w-full"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Office</Label>
              <OfficeCombobox
                offices={officeOptions}
                value={form.officeId}
                onChange={(value) => setForm({ ...form, officeId: value })}
              />
            </div>
          </div>

          {!editing && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Confirm password</Label>
                <Input
                  type="password"
                  value={form.passwordConfirmation}
                  onChange={(event) =>
                    setForm({ ...form, passwordConfirmation: event.target.value })
                  }
                  autoComplete="new-password"
                  placeholder="Re-enter the password"
                />
              </div>
            </div>
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
          <Button onClick={save} disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            {editing ? "Save changes" : "Create user"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
