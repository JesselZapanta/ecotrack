import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/store"
import { toast } from "sonner"
import { BrandMark } from "@/components/brand/Logo"
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Recycle,
  ShieldCheck,
  Truck,
} from "lucide-react"

const demoAccounts = [
  { role: "Administrator", email: "admin@tcgc.edu.ph", icon: ShieldCheck },
  { role: "Maintenance", email: "ben@tcgc.edu.ph", icon: Truck },
  { role: "Office", email: "educ@tcgc.edu.ph", icon: Recycle },
]

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [loginValue, setLoginValue] = useState("admin@tcgc.edu.ph")
  const [password, setPassword] = useState("password")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!loginValue.trim() || !password) {
      setError("Enter your email or username and password.")
      return
    }

    try {
      setSubmitting(true)
      const { redirect } = await login(loginValue.trim(), password)
      toast.success("Welcome back.")
      navigate(redirect, { replace: true })
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? ((err.response?.data?.message as string | undefined) ??
          "Cannot reach the server. Start the API with php artisan serve.")
        : "Something went wrong. Try again."

      setError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid min-h-screen bg-canvas lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-sidebar p-10 lg:flex xl:p-14">
        <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:56px_56px]" />

        <div className="relative flex items-center gap-2.5">
          <BrandMark size="sm" tileClassName="border-transparent" />
          <div>
            <p className="font-display text-[14px] leading-none font-bold tracking-[-0.03em] text-white">EcoTrack</p>
            <p className="mt-1 text-[9.5px] font-medium tracking-[0.14em] text-sidebar-muted uppercase">
              Tangub City Global College
            </p>
          </div>
        </div>

        <div className="relative max-w-[420px]">
          <p className="label text-sidebar-muted">Waste operations</p>
          <h1 className="display mt-3 text-[38px] leading-[1.04] text-white xl:text-[44px]">
            Every collection accounted for.
          </h1>
          <p className="mt-4 max-w-[360px] text-[13.5px] leading-6 text-sidebar-text">
            Record waste, run the route, and know what is overdue — one shared log for the whole campus.
          </p>

          <div className="mt-10 space-y-0 border-t border-white/10">
            {[
              { value: "7 / 12", label: "collections completed today" },
              { value: "825 kg", label: "waste logged this month" },
              { value: "2", label: "items need attention" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-baseline justify-between gap-4 border-b border-white/10 py-3.5">
                <span className="display text-[26px] leading-none text-white">{stat.value}</span>
                <span className="text-right text-[11.5px] text-sidebar-muted">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-[11px] text-sidebar-muted">
          Tangub City Global College · Waste Management and Monitoring
        </p>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-[380px]">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <BrandMark size="sm" />
            <div>
              <p className="font-display text-[14px] leading-none font-bold tracking-[-0.03em]">EcoTrack</p>
              <p className="mt-1 text-[9.5px] font-medium tracking-[0.14em] text-muted-ink uppercase">TCGC</p>
            </div>
          </div>

          <h2 className="display text-[30px] leading-none text-ink">Sign in</h2>
          <p className="mt-2 text-[12.5px] text-muted-ink">Use your campus account. You land on your role dashboard.</p>

          <div className="mt-6 space-y-1.5">
            {demoAccounts.map((account) => {
              const Icon = account.icon
              const active = loginValue === account.email
              return (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => {
                    setLoginValue(account.email)
                    setPassword("password")
                    setError(null)
                  }}
                  className={`flex w-full items-center gap-2.5 rounded-[8px] border px-3 py-2.5 text-left transition-colors ${
                    active ? "border-brand/30 bg-brand-soft" : "border-line bg-surface hover:border-line-strong"
                  }`}
                >
                  <Icon className={`size-4 ${active ? "text-brand" : "text-muted-ink"}`} />
                  <span className="flex-1 text-[12px] font-medium text-ink">{account.role}</span>
                  <span className="num text-[10.5px] text-muted-ink">{account.email}</span>
                </button>
              )
            })}
          </div>

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="login">Email or username</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-ink" />
                <Input
                  id="login"
                  value={loginValue}
                  onChange={(event) => setLoginValue(event.target.value)}
                  className="pl-9"
                  placeholder="admin@tcgc.edu.ph"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <span className="text-[10.5px] text-muted-ink">Demo: password</span>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-ink" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="pr-10 pl-9"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 items-center justify-center rounded-[5px] text-muted-ink hover:bg-surface-2 hover:text-ink"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-[8px] border border-alarm/20 bg-alarm-soft px-3 py-2.5">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-alarm" />
                <p className="text-[11.5px] leading-5 text-alarm">{error}</p>
              </div>
            )}

            <Button type="submit" className="h-11 w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Signing in…
                </>
              ) : (
                <>
                  Sign in <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-5 flex items-start gap-2 border-t border-line pt-4">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-muted-ink" />
            <p className="text-[10.5px] leading-4 text-muted-ink">
              JWT session · hashed passwords · role checks on the server.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
