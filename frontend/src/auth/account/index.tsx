import { useState } from "react"
import {
  AtSign,
  Building2,
  CalendarDays,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  MapPin,
  ShieldCheck,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PageHeader } from "@/components/ecotrack/PageHeader"
import { ROLE_LABEL, useAuth } from "@/lib/store"
import { accountErrors, accountMessage, changePassword, updateProfile } from "./api"
import { toast } from "sonner"

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

function initials(name: string) {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
  return letters || "?"
}

export default function Account() {
  const { user, role, userName, updateUser } = useAuth()

  const [profile, setProfile] = useState({
    name: user?.name ?? "",
    username: user?.username ?? "",
    email: user?.email ?? "",
  })
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({})
  const [savingProfile, setSavingProfile] = useState(false)

  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [confirm, setConfirm] = useState("")
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})
  const [savingPassword, setSavingPassword] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)

  const roleAccess =
    role === "admin"
      ? "Full control of records, schedules, users and master lists."
      : role === "maintenance"
        ? "Assigned collection routes and status updates."
        : "View-only access to your office's records, schedules and concerns."

  const handleProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSavingProfile(true)
    setProfileErrors({})

    try {
      const updated = await updateProfile({
        name: profile.name.trim(),
        username: profile.username.trim() || null,
        email: profile.email.trim(),
      })
      updateUser(updated)
      toast.success("Profile updated.")
    } catch (err) {
      const errors = accountErrors(err)
      setProfileErrors(errors)
      if (Object.keys(errors).length === 0) toast.error(accountMessage(err))
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const errors: Record<string, string> = {}
    if (!current) errors.current_password = "Enter your current password."
    if (next.length < 8) errors.password = "Use at least 8 characters."
    if (next !== confirm) errors.password_confirmation = "The new passwords do not match."

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors)
      return
    }

    setSavingPassword(true)
    setPasswordErrors({})

    try {
      await changePassword({
        current_password: current,
        password: next,
        password_confirmation: confirm,
      })
      toast.success("Password changed. You're still signed in.")
      setCurrent("")
      setNext("")
      setConfirm("")
    } catch (err) {
      const nextErrors = accountErrors(err)
      setPasswordErrors(nextErrors)
      if (Object.keys(nextErrors).length === 0) toast.error(accountMessage(err))
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="mx-auto max-w-[960px] space-y-5">
      <PageHeader
        eyebrow="Account"
        title="My account"
        subtitle="Your profile, access and password."
      />

      <Card>
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[14px] font-semibold text-brand-ink">
              {initials(userName)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold text-ink">{userName}</p>
              <p className="flex items-center gap-1.5 truncate text-[11.5px] text-muted-ink">
                <Mail className="size-3.5 shrink-0" /> {user?.email}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10.5px] text-muted-ink">
                <span className="inline-flex items-center rounded-[5px] bg-brand-soft px-1.5 py-0.5 font-medium text-brand-ink">
                  {ROLE_LABEL[role]}
                </span>
                {user?.office?.name && (
                  <span className="inline-flex min-w-0 items-center gap-1">
                    <Building2 className="size-3 shrink-0" />
                    <span className="truncate">{user.office.name}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <span
            className={`inline-flex w-fit items-center gap-1.5 rounded-[6px] px-2 py-1 text-[11px] font-medium ${
              user?.is_active ? "bg-ok-soft text-ok" : "bg-surface-2 text-muted-ink"
            }`}
          >
            <span
              className={`size-[5px] rounded-full ${user?.is_active ? "bg-ok" : "bg-muted-ink/50"}`}
              aria-hidden
            />
            {user?.is_active ? "Active" : "Inactive"}
          </span>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader className="border-b border-line py-4">
            <CardTitle>Profile</CardTitle>
            <p className="text-[11.5px] text-muted-ink">
              This is how your name appears in records, concerns and audit logs.
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleProfile} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <div className="relative">
                  <User className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-ink" />
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(event) => setProfile({ ...profile, name: event.target.value })}
                    autoComplete="name"
                    className="h-11 pl-9 sm:h-10"
                    aria-invalid={Boolean(profileErrors.name)}
                  />
                </div>
                {profileErrors.name && <p className="text-[11px] text-alarm">{profileErrors.name}</p>}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <AtSign className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-ink" />
                    <Input
                      id="username"
                      value={profile.username}
                      onChange={(event) => setProfile({ ...profile, username: event.target.value })}
                      autoComplete="username"
                      className="h-11 pl-9 sm:h-10"
                      aria-invalid={Boolean(profileErrors.username)}
                    />
                  </div>
                  {profileErrors.username ? (
                    <p className="text-[11px] text-alarm">{profileErrors.username}</p>
                  ) : (
                    <p className="text-[10.5px] text-muted-ink">Optional — you can also log in with this.</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-ink" />
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(event) => setProfile({ ...profile, email: event.target.value })}
                      autoComplete="email"
                      className="h-11 pl-9 sm:h-10"
                      aria-invalid={Boolean(profileErrors.email)}
                    />
                  </div>
                  {profileErrors.email && <p className="text-[11px] text-alarm">{profileErrors.email}</p>}
                </div>
              </div>

              <div className="flex flex-col gap-2 border-t border-line pt-4 sm:flex-row sm:justify-end">
                <Button type="submit" className="min-h-11 sm:min-h-10" disabled={savingProfile}>
                  {savingProfile && <Loader2 className="size-4 animate-spin" />}
                  Save changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader className="border-b border-line py-4">
            <CardTitle>Access</CardTitle>
            <p className="text-[11.5px] text-muted-ink">Set by the administrator — read-only.</p>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" />
              <div className="min-w-0">
                <p className="label">Role</p>
                <p className="text-[12.5px] font-medium text-ink">{ROLE_LABEL[role]}</p>
                <p className="text-[11px] leading-4 text-muted-ink">{roleAccess}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Building2 className="mt-0.5 size-4 shrink-0 text-brand" />
              <div className="min-w-0">
                <p className="label">Office</p>
                <p className="truncate text-[12.5px] font-medium text-ink">
                  {user?.office?.name ?? "Unassigned"}
                </p>
                <p className="flex items-center gap-1 truncate text-[11px] text-muted-ink">
                  <MapPin className="size-3 shrink-0" />
                  {user?.office?.location?.name ?? "No location assigned"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <CalendarDays className="mt-0.5 size-4 shrink-0 text-brand" />
              <div className="min-w-0">
                <p className="label">Last login</p>
                <p className="num text-[12px] text-ink">{formatWhen(user?.last_login_at ?? null)}</p>
                <p className="text-[10.5px] text-muted-ink">
                  Member since {formatWhen(user?.created_at ?? null)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <KeyRound className="mt-0.5 size-4 shrink-0 text-brand" />
              <div className="min-w-0">
                <p className="label">Session</p>
                <p className="text-[11px] leading-4 text-muted-ink">
                  JWT bearer token, expires after 60 minutes. Logging out blacklists it immediately.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b border-line py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>Change password</CardTitle>
              <p className="text-[11.5px] text-muted-ink">
                Use at least 8 characters. Your current session stays signed in.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="min-h-11 shrink-0 sm:min-h-9"
              onClick={() => setShowPasswords((value) => !value)}
            >
              {showPasswords ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              {showPasswords ? "Hide" : "Show"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handlePassword} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type={showPasswords ? "text" : "password"}
                autoComplete="current-password"
                value={current}
                onChange={(event) => setCurrent(event.target.value)}
                className="h-11 sm:h-10"
                aria-invalid={Boolean(passwordErrors.current_password)}
              />
              {passwordErrors.current_password && (
                <p className="text-[11px] text-alarm">{passwordErrors.current_password}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type={showPasswords ? "text" : "password"}
                  autoComplete="new-password"
                  value={next}
                  onChange={(event) => setNext(event.target.value)}
                  className="h-11 sm:h-10"
                  aria-invalid={Boolean(passwordErrors.password)}
                />
                {passwordErrors.password && (
                  <p className="text-[11px] text-alarm">{passwordErrors.password}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm-password">Confirm new password</Label>
                <Input
                  id="confirm-password"
                  type={showPasswords ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  className="h-11 sm:h-10"
                  aria-invalid={Boolean(passwordErrors.password_confirmation)}
                />
                {passwordErrors.password_confirmation && (
                  <p className="text-[11px] text-alarm">{passwordErrors.password_confirmation}</p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] text-muted-ink">
                Forgot your password? Ask the administrator to reset it.
              </p>
              <Button type="submit" className="min-h-11 sm:min-h-10" disabled={savingPassword}>
                {savingPassword && <Loader2 className="size-4 animate-spin" />}
                Update password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
