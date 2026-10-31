import { Link } from "react-router-dom"
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  MapPin,
  MessageSquareWarning,
  ShieldCheck,
  Truck,
  Users,
} from "lucide-react"
import { BrandLockup, BrandMark } from "@/components/brand/Logo"
import { Button } from "@/components/ui/button"
import { ROLE_HOME, useAuth } from "@/lib/store"

const previewStops = [
  {
    location: "Main Building — Third Floor",
    window: "07:00–09:00",
    status: "Collected",
    tone: "bg-ok-soft text-ok",
  },
  {
    location: "Annex Building — Ground Floor",
    window: "09:30–11:00",
    status: "Scheduled",
    tone: "bg-info-soft text-info",
  },
  {
    location: "Senior High School — Ground Floor",
    window: "13:00–14:30",
    status: "Missed",
    tone: "bg-alarm-soft text-alarm",
  },
]

const features = [
  {
    icon: CalendarDays,
    title: "Schedules & routes",
    text: "Plan multi-location collections, assign crews and follow every status change.",
  },
  {
    icon: BarChart3,
    title: "Waste records & reports",
    text: "Log collected waste by category, filter by period and export a PDF report.",
  },
  {
    icon: MessageSquareWarning,
    title: "Concerns & accountability",
    text: "Offices report problems; admin and crews acknowledge, resolve and record the fix.",
  },
]

const roles = [
  {
    icon: ShieldCheck,
    title: "Administrator",
    tag: "Full control",
    points: ["Master lists and users", "Schedules and waste records", "Concerns, reports and audit log"],
  },
  {
    icon: Users,
    title: "Office",
    tag: "View only",
    points: ["Waste and schedules for your location", "Report concerns", "Download your reports"],
  },
  {
    icon: Truck,
    title: "Maintenance",
    tag: "Field access",
    points: ["Today's route and schedules", "Update collection statuses", "Log waste and resolve concerns"],
  },
]

export default function LandingPage() {
  const { user, role } = useAuth()
  const primaryTo = user ? ROLE_HOME[role] : "/login"
  const primaryLabel = user ? "Open dashboard" : "Sign in"

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-30 border-b border-line bg-canvas">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label="EcoTrack home" className="shrink-0">
            <BrandLockup className="h-8 sm:h-9" />
          </Link>

          <nav className="hidden items-center gap-6 text-[12.5px] font-medium text-muted-ink sm:flex">
            <a href="#features" className="transition-colors hover:text-ink">
              Features
            </a>
            <a href="#roles" className="transition-colors hover:text-ink">
              Roles
            </a>
          </nav>

          <Button asChild size="sm" className="min-h-11 sm:min-h-9">
            <Link to={primaryTo}>
              {user ? "Dashboard" : "Sign in"}
              <ArrowRight className="size-3.5" />
            </Link>
          </Button>
        </div>
      </header>

      <section className="border-b border-line">
        <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-20">
          <div className="min-w-0">
            <p className="label">Waste management & monitoring</p>
            <h1 className="display mt-3 text-[38px] leading-[1.02] tracking-[-0.03em] text-ink sm:text-[52px]">
              Cleaner campus.
              <br />
              Clearer data.
            </h1>
            <p className="mt-4 max-w-[520px] text-[13.5px] leading-6 text-muted-ink sm:text-[14px]">
              EcoTrack helps Tangub City Global College schedule collections, record waste and resolve
              concerns — all in one place.
            </p>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button asChild size="lg" className="min-h-11">
                <Link to={primaryTo}>
                  {primaryLabel}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="min-h-11">
                <a href="#features">See features</a>
              </Button>
            </div>

            <p className="mt-4 text-[11px] text-muted-ink">
              For administrators, offices and maintenance crews.
            </p>
          </div>

          <div className="min-w-0">
            <div className="rounded-[16px] border border-line bg-surface p-4 shadow-[var(--shadow-sm)] sm:p-5">
              <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <BrandMark size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-semibold text-ink">Today at TCGC</p>
                    <p className="text-[10px] text-muted-ink">Collection overview</p>
                  </div>
                </div>
                <span className="shrink-0 rounded-[5px] border border-line bg-surface-2 px-1.5 py-0.5 text-[9px] font-medium text-muted-ink">
                  Sample view
                </span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { label: "Locations", value: "9" },
                  { label: "Collections", value: "12" },
                  { label: "Collected", value: "48.6", unit: "kg" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-[9px] border border-line bg-surface-2 px-2.5 py-2">
                    <p className="text-[9px] font-medium tracking-[0.08em] text-muted-ink uppercase">
                      {stat.label}
                    </p>
                    <p className="num mt-1 text-[17px] leading-none font-semibold text-ink">
                      {stat.value}
                      {stat.unit && <span className="ml-0.5 text-[9px] font-medium text-muted-ink">{stat.unit}</span>}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2">
                {previewStops.map((stop) => (
                  <div
                    key={stop.location}
                    className="flex flex-col gap-1.5 rounded-[9px] border border-line px-2.5 py-2 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 truncate text-[11.5px] font-medium text-ink">
                        <MapPin className="size-3 shrink-0 text-muted-ink" />
                        {stop.location}
                      </p>
                      <p className="num text-[9.5px] text-muted-ink">{stop.window}</p>
                    </div>
                    <span
                      className={`inline-flex w-fit shrink-0 items-center gap-1 rounded-[5px] px-1.5 py-0.5 text-[9.5px] font-medium ${stop.tone}`}
                    >
                      <span className="size-[4px] rounded-full bg-current" aria-hidden />
                      {stop.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 rounded-[10px] border border-brand/15 bg-brand-soft p-3">
                <p className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-ink">
                  <CheckCircle2 className="size-3.5" /> One source of truth
                </p>
                <p className="mt-1 text-[10.5px] leading-4 text-muted-ink">
                  Every create, edit and status change is recorded in the audit log.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <p className="label">What it does</p>
        <h2 className="display mt-2 text-[26px] leading-tight tracking-[-0.02em] text-ink sm:text-[32px]">
          Everything the campus needs
        </h2>
        <p className="mt-2 max-w-[560px] text-[12.5px] leading-5 text-muted-ink">
          From the first schedule to the final report, EcoTrack keeps the work visible and accountable.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-[12px] border border-line bg-surface p-4">
              <div className="flex size-9 items-center justify-center rounded-[9px] bg-brand-soft text-brand">
                <feature.icon className="size-4" />
              </div>
              <p className="mt-3 text-[13.5px] font-semibold text-ink">{feature.title}</p>
              <p className="mt-1 text-[12px] leading-5 text-muted-ink">{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="roles" className="border-y border-line bg-surface">
        <div className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <p className="label">Built for every role</p>
          <h2 className="display mt-2 text-[26px] leading-tight tracking-[-0.02em] text-ink sm:text-[32px]">
            One system, three views
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-3">
            {roles.map((item) => (
              <div key={item.title} className="rounded-[12px] border border-line bg-canvas p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-[8px] bg-brand-soft text-brand">
                      <item.icon className="size-4" />
                    </span>
                    <p className="text-[13px] font-semibold text-ink">{item.title}</p>
                  </div>
                  <span className="rounded-[5px] border border-line bg-surface px-1.5 py-0.5 text-[9.5px] font-medium text-muted-ink">
                    {item.tag}
                  </span>
                </div>
                <ul className="mt-3 space-y-1.5">
                  {item.points.map((point) => (
                    <li key={point} className="flex items-start gap-1.5 text-[11.5px] leading-4 text-muted-ink">
                      <CheckCircle2 className="mt-0.5 size-3 shrink-0 text-ok" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="rounded-[16px] bg-brand px-5 py-10 text-center sm:px-10">
          <p className="text-[10px] font-semibold tracking-[0.14em] text-lime uppercase">Ready when you are</p>
          <h2 className="display mt-2 text-[26px] leading-tight tracking-[-0.02em] text-white sm:text-[32px]">
            Start with a cleaner campus.
          </h2>
          <p className="mx-auto mt-3 max-w-[480px] text-[12.5px] leading-5 text-white/70">
            Sign in with your TCGC account to see your dashboard, schedules and records.
          </p>
          <Button asChild size="lg" className="mt-5 min-h-11 bg-lime text-brand-ink hover:bg-lime/90">
            <Link to={primaryTo}>
              {primaryLabel}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-4 py-6 text-[10.5px] text-muted-ink sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <BrandMark size="xs" />
            <span>EcoTrack TCGC · Waste Management &amp; Monitoring</span>
          </div>
          <span>Tangub City Global College · {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  )
}
