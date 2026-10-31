import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/store"
import { toast } from "sonner"
import { BrandMark, BrandName } from "@/components/brand/Logo"
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react"

const demoAccounts = [
  { role: "Administrator", email: "admin@tcgc.edu.ph" },
  { role: "Maintenance", email: "ben@tcgc.edu.ph" },
  { role: "ICS Office", email: "ics@tcgc.edu.ph" },
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
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas px-4 py-5 sm:px-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-[1080px] items-center justify-between">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center gap-1.5 text-[12px] font-medium text-muted-ink transition-colors hover:text-ink"
        >
          <ArrowLeft className="size-3.5" />
          Back to home
        </Link>
        <span className="hidden text-[10.5px] tracking-[0.04em] text-muted-ink sm:inline">
          Waste management &amp; monitoring
        </span>
      </div>

      <div className="mx-auto flex w-full max-w-[1080px] flex-1 items-center py-6 sm:py-10">
        <div className="grid w-full overflow-hidden rounded-[18px] border border-line bg-surface shadow-[var(--shadow-sm)] lg:grid-cols-[1.02fr_1fr]">
          <div className="hidden flex-col justify-between bg-sidebar p-8 lg:flex xl:p-10">
            <div className="flex items-center gap-2.5">
              <BrandMark size="sm" tileClassName="border-transparent" />
              <BrandName tone="light" subtitle="TCGC" />
            </div>

            <div className="max-w-[400px]">
              <p className="text-[10px] font-semibold tracking-[0.14em] text-sidebar-muted uppercase">
                Waste management &amp; monitoring
              </p>
              <h2 className="display mt-3 text-[34px] leading-[1.05] text-white xl:text-[38px]">
                Every collection accounted for.
              </h2>
              <p className="mt-3 text-[12.5px] leading-6 text-sidebar-text">
                Record waste, run the route and resolve concerns — one shared log for the whole campus.
              </p>

              <div className="mt-8 rounded-[12px] border border-white/10 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold text-white">Today's route</p>
                  <span className="num text-[10px] text-sidebar-muted">7 / 12 collected</span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[58%] rounded-full bg-lime" />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[
                    { value: "7", label: "Collected", tone: "text-ok" },
                    { value: "3", label: "Scheduled", tone: "text-info" },
                    { value: "2", label: "Missed", tone: "text-alarm" },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <p className={`display text-[22px] leading-none ${stat.tone}`}>{stat.value}</p>
                      <p className="mt-1 text-[9.5px] text-sidebar-muted">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-4 flex items-start gap-2 text-[10.5px] leading-4 text-sidebar-muted">
                <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-lime" />
                Every create, edit and status change is recorded in the audit log.
              </p>
            </div>

            <p className="text-[10px] text-sidebar-muted">
              Tangub City Global College · Waste Management and Monitoring
            </p>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2.5 bg-sidebar px-5 py-5 lg:hidden">
              <BrandMark size="sm" tileClassName="border-transparent" />
              <BrandName tone="light" subtitle="TCGC" />
            </div>

            <div className="p-5 sm:p-8 lg:p-10">
              <div className="mx-auto w-full max-w-[380px]">
                <h1 className="display text-[28px] leading-none text-ink sm:text-[30px]">Sign in</h1>
                <p className="mt-2 text-[12.5px] leading-5 text-muted-ink">
                  Use your campus account. You land on your role dashboard.
                </p>

                <form onSubmit={handleLogin} className="mt-6 space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="login">Email or username</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-ink" />
                      <Input
                        id="login"
                        value={loginValue}
                        onChange={(event) => setLoginValue(event.target.value)}
                        className="h-11 pl-9"
                        placeholder="admin@tcgc.edu.ph"
                        autoComplete="username"
                        aria-describedby={error ? "login-error" : undefined}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-ink" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="h-11 pr-12 pl-9"
                        autoComplete="current-password"
                        aria-describedby={error ? "login-error" : undefined}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((visible) => !visible)}
                        className="absolute top-1/2 right-1 flex size-9 -translate-y-1/2 items-center justify-center rounded-[6px] text-muted-ink transition-colors hover:bg-surface-2 hover:text-ink focus-visible:shadow-[var(--focus-ring)]"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div
                      id="login-error"
                      role="alert"
                      className="flex items-start gap-2 rounded-[8px] border border-alarm/20 bg-alarm-soft px-3 py-2.5"
                    >
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

                <div className="mt-6 border-t border-line pt-4">
                  <p className="label">Demo accounts</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {demoAccounts.map((account) => (
                      <button
                        key={account.email}
                        type="button"
                        onClick={() => {
                          setLoginValue(account.email)
                          setPassword("password")
                          setError(null)
                        }}
                        className={`min-h-11 rounded-[6px] border px-2.5 text-[11px] font-medium transition-colors sm:min-h-9 ${
                          loginValue === account.email
                            ? "border-brand/25 bg-brand-soft text-brand-ink"
                            : "border-line bg-surface text-muted-ink hover:border-line-strong hover:text-ink"
                        }`}
                      >
                        {account.role}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-[10px] text-muted-ink">
                    Password for all demo accounts: <span className="num">password</span>
                  </p>
                </div>

                <p className="mt-5 flex items-start gap-1.5 text-[10px] leading-4 text-muted-ink">
                  <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
                  JWT session · hashed passwords · role checks on the server.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="mx-auto w-full max-w-[1080px] text-center text-[10px] text-muted-ink">
        EcoTrack TCGC · Tangub City Global College · {new Date().getFullYear()}
      </p>
    </div>
  )
}
