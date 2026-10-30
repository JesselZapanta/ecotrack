import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/ecotrack/PageHeader"
import { StatusTag } from "@/components/ecotrack/StatusTag"
import { RouteStrip } from "@/components/ecotrack/RouteStrip"
import { useAuth } from "@/lib/store"
import { StatusUpdateDialog } from "@/admin/schedules/components/StatusUpdateDialog"
import { apiMessage, getSchedules, sweepSchedules, updateScheduleStatus } from "@/admin/schedules/api"
import type { ApiSchedule } from "@/admin/schedules/types"
import { toast } from "sonner"
import { AlertCircle, CheckCircle2, Loader2, MapPin, XCircle } from "lucide-react"

const REASONS = ["Rain", "Bin not accessible", "Needs extra trip", "Other"]

export default function MyCollections() {
  const { userName } = useAuth()
  const [schedules, setSchedules] = useState<ApiSchedule[]>([])
  const [missedRuns, setMissedRuns] = useState<ApiSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const [statusTarget, setStatusTarget] = useState<ApiSchedule | null>(null)
  const [missed, setMissed] = useState<ApiSchedule | null>(null)
  const [reason, setReason] = useState("")
  const [savingMissed, setSavingMissed] = useState(false)

  useEffect(() => {
    let cancelled = false

    sweepSchedules()
      .then((result) => {
        if (cancelled) return
        if (result.swept > 0) toast.success(result.message)
      })
      .catch(() => {})
      .finally(() => {
        if (cancelled) return
        const today = new Date().toISOString().slice(0, 10)
        getSchedules({
          search: "",
          status: "all",
          categoryId: "all",
          locationId: "all",
          date: "",
          sort: "scheduled_date",
          direction: "asc",
          perPage: 50,
          page: 1,
        })
          .then(({ data }) => {
            if (cancelled) return
            const all = data.filter((schedule) => schedule.status === "Scheduled" || schedule.status === "Missed")
            setSchedules(all.filter((schedule) => schedule.scheduled_date === today))
            setMissedRuns(all.filter((schedule) => schedule.status === "Missed"))
            setError(null)
          })
          .catch((err) => {
            if (!cancelled) setError(apiMessage(err))
          })
          .finally(() => {
            if (!cancelled) setLoading(false)
          })
      })

    return () => {
      cancelled = true
    }
  }, [refreshKey])

  const refresh = () => {
    setLoading(true)
    setRefreshKey((key) => key + 1)
  }

  const missedCount = missedRuns.length
  const next =
    schedules.find((schedule) => schedule.status === "Missed") ??
    schedules.find((schedule) => schedule.status === "Scheduled")
  const ordered = [...schedules].sort((a, b) => {
    const rank = (s: string) => (s === "Missed" ? 0 : s === "Scheduled" ? 1 : 2)
    const r = rank(a.status) - rank(b.status)
    if (r !== 0) return r
    return a.scheduled_date.localeCompare(b.scheduled_date)
  })

  const stops = schedules.map((schedule) => ({
    id: String(schedule.id),
    label: schedule.locations[0]?.name ?? "Stop",
    time: schedule.window_start,
    status: schedule.status,
    color: schedule.categories[0]?.color_code ?? "#2F7D4F",
  }))

  const confirmMissed = async () => {
    if (!missed) return

    if (!reason.trim()) {
      toast.error("Pick a reason before confirming.")
      return
    }

    setSavingMissed(true)
    try {
      const result = await updateScheduleStatus(missed.id, "Missed", reason)
      toast.success(result.message)
      setMissed(null)
      setReason("")
      refresh()
    } catch (err) {
      toast.error(apiMessage(err))
    } finally {
      setSavingMissed(false)
    }
  }

  return (
    <div className="mx-auto max-w-[880px] space-y-5">
      <PageHeader
        eyebrow="Field route"
        title="Dashboard"
        subtitle={`Today's route · ${schedules.length} runs · ${missedCount} missed · ${userName}`}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/maintenance/schedules">Full schedule</Link>
          </Button>
        }
      />

      {error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <AlertCircle className="size-5 text-alarm" />
            <p className="text-[13px] text-ink">{error}</p>
            <Button size="sm" variant="outline" onClick={refresh}>
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : loading ? (
        <Card>
          <CardContent className="flex items-center justify-center gap-2 py-12 text-[12.5px] text-muted-ink">
            <Loader2 className="size-4 animate-spin" /> Loading your route…
          </CardContent>
        </Card>
      ) : (
        <>
          {missedCount > 0 && (
            <Card className="border-l-[3px] border-l-alarm">
              <CardHeader className="flex flex-row items-center justify-between border-b border-line py-4">
                <div>
                  <p className="label text-alarm">Missed — needs attention</p>
                  <CardTitle className="text-[16px]">
                    {missedCount} run{missedCount === 1 ? "" : "s"} missed
                  </CardTitle>
                </div>
                <span className="rounded-[6px] bg-alarm-soft px-2 py-0.5 text-[10.5px] font-semibold text-alarm">
                  Action needed
                </span>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-line">
                  {missedRuns.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <span className="num flex w-[48px] shrink-0 flex-col text-[10.5px] text-muted-ink">
                            <span className="font-medium text-ink">{schedule.window_start}</span>
                            <span>{schedule.window_end}</span>
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-medium">
                              {schedule.locations.map((location) => location.name).join(", ") || "No location"}
                            </p>
                            <p className="text-[11px] text-muted-ink">
                              {schedule.scheduled_date} · {schedule.locations[0]?.building ?? "—"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:justify-end">
                          <StatusTag status={schedule.status} />
                          <Button size="sm" variant="outline" onClick={() => setStatusTarget(schedule)}>
                            Update status
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="pt-5">
              <RouteStrip stops={stops} collected={0} total={schedules.length} compact />
            </CardContent>
          </Card>

          {next && (
            <Card className={`border-l-[3px] ${next.status === "Missed" ? "border-l-alarm" : "border-l-brand"}`}>
              <CardHeader>
                <p className="label">{next.status === "Missed" ? "Missed — needs attention" : "Next stop"}</p>
                <CardTitle className="text-[22px]">
                  {next.locations.map((location) => location.name).join(", ") || "Unassigned location"}
                </CardTitle>
                <p className="text-[12px] text-muted-ink">
                  {next.scheduled_date} · {next.window_start}–{next.window_end}
                  
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {next.categories.map((category) => (
                    <span
                      key={category.id}
                      className="inline-flex items-center gap-1.5 text-[12px] text-ink-2"
                    >
                      <span
                        className="size-[7px] shrink-0 rounded-full"
                        style={{ background: category.color_code }}
                        aria-hidden
                      />
                      {category.name}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Button className="h-12" onClick={() => setStatusTarget(next)}>
                    <CheckCircle2 className="size-4" /> Update status
                  </Button>
                  {next.status !== "Missed" && (
                    <Button
                      variant="outline"
                      className="h-12 border-alarm/30 text-alarm"
                      onClick={() => {
                        setMissed(next)
                        setReason("")
                      }}
                    >
                      <XCircle className="size-4" /> Mark as missed
                    </Button>
                  )}
                </div>

                {next.notes && (
                  <p className="text-[11.5px] leading-5 text-muted-ink">{next.notes}</p>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-line py-4">
              <CardTitle>All stops</CardTitle>
              <span className="text-[11.5px] text-muted-ink">{schedules.length} assigned</span>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-line">
                {schedules.length === 0 && (
                  <p className="px-4 py-10 text-center text-[12.5px] text-muted-ink">
                    No scheduled or missed runs for today.
                  </p>
                )}

                {ordered.map((schedule) => (
                  <div
                    key={schedule.id}
                    className={`flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5 ${schedule.status === "Missed" ? "bg-alarm-soft/40 border-l-[3px] border-l-alarm" : ""}`}
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="num flex w-[48px] shrink-0 flex-col text-[10.5px] text-muted-ink">
                        <span className="font-medium text-ink">{schedule.window_start}</span>
                        <span>{schedule.window_end}</span>
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium">
                          {schedule.locations.map((location) => location.name).join(", ") || "No location"}
                        </p>
                        <p className="flex items-center gap-1 text-[11px] text-muted-ink">
                          <MapPin className="size-3" />
                          {schedule.locations[0]?.building ?? "—"} · {schedule.scheduled_date}
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-2">
                          {schedule.categories.map((category) => (
                            <span
                              key={category.id}
                              className="inline-flex items-center gap-1.5 text-[11px] text-ink-2"
                            >
                              <span
                                className="size-[7px] shrink-0 rounded-full"
                                style={{ background: category.color_code }}
                                aria-hidden
                              />
                              {category.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:justify-end">
                      <StatusTag status={schedule.status} />
                      <Button size="sm" variant="outline" onClick={() => setStatusTarget(schedule)}>
                        Update status
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {statusTarget && (
        <StatusUpdateDialog
          schedule={statusTarget}
          onClose={() => setStatusTarget(null)}
          onSaved={refresh}
        />
      )}

      <Dialog open={!!missed} onOpenChange={(isOpen) => !isOpen && !savingMissed && setMissed(null)}>
        <DialogContent className="max-h-[92dvh] max-w-[460px] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Mark as missed</DialogTitle>
            <DialogDescription>
              Pick a reason, then confirm. The administrator can reschedule it.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {REASONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setReason(option)}
                  className={`min-h-11 rounded-[8px] border px-3 text-[12px] font-medium transition-colors ${
                    reason === option
                      ? "border-brand/30 bg-brand-soft text-brand-ink"
                      : "border-line bg-surface text-muted-ink hover:border-line-strong"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Add detail (required if you picked Other)"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setMissed(null)} disabled={savingMissed}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmMissed} disabled={savingMissed}>
              {savingMissed && <Loader2 className="size-4 animate-spin" />}
              Confirm missed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
