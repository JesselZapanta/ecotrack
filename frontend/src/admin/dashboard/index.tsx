import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { AlertCircle, ArrowRight, Loader2, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/ecotrack/PageHeader"
import { StatTile } from "@/components/ecotrack/StatTile"
import { RouteStrip } from "@/components/ecotrack/RouteStrip"
import { StatusTag } from "@/components/ecotrack/StatusTag"
import { getReport, reportMessage } from "@/admin/reports/api"
import type { Report } from "@/admin/reports/api"
import { getSchedules, getSchedulesForRange } from "@/admin/schedules/api"
import type { ApiSchedule } from "@/admin/schedules/types"

type Period = "today" | "week" | "month"

const PERIOD_LABEL: Record<Period, string> = {
  today: "Today",
  week: "This week",
  month: "This month",
}

function inputDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function periodRange(period: Period) {
  const now = new Date()
  const start = new Date(now)
  const end = new Date(now)

  if (period === "week") {
    const mondayOffset = (now.getDay() + 6) % 7
    start.setDate(now.getDate() - mondayOffset)
    end.setDate(start.getDate() + 6)
  } else if (period === "month") {
    start.setDate(1)
    end.setMonth(now.getMonth() + 1, 0)
  }

  return { from: inputDate(start), to: inputDate(end) }
}

export default function Dashboard() {
  const [period, setPeriod] = useState<Period>("month")
  const [report, setReport] = useState<Report | null>(null)
  const [periodSchedules, setPeriodSchedules] = useState<ApiSchedule[]>([])
  const [upcoming, setUpcoming] = useState<ApiSchedule[]>([])
  const [missed, setMissed] = useState<ApiSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    const range = periodRange(period)
    const today = inputDate(new Date())

    Promise.all([
      getReport({ dateFrom: range.from, dateTo: range.to, locationId: "all", categoryId: "all" }),
      getSchedulesForRange(range.from, range.to),
      getSchedules({
        search: "",
        status: "Scheduled",
        categoryId: "all",
        locationId: "all",
        date: "",
        dateFrom: today,
        sort: "scheduled_date",
        direction: "asc",
        perPage: 5,
        page: 1,
      }),
      getSchedules({
        search: "",
        status: "Missed",
        categoryId: "all",
        locationId: "all",
        date: "",
        dateFrom: range.from,
        dateTo: range.to,
        sort: "scheduled_date",
        direction: "desc",
        perPage: 5,
        page: 1,
      }),
    ])
      .then(([nextReport, schedules, nextUpcoming, nextMissed]) => {
        if (cancelled) return
        setReport(nextReport)
        setPeriodSchedules(schedules)
        setUpcoming(nextUpcoming.data)
        setMissed(nextMissed.data)
        setError(null)
      })
      .catch((err) => {
        if (!cancelled) setError(reportMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [period, refreshKey])

  const totalKg = report?.summary.total_kg ?? 0
  const counts = report?.collections.counts
  const collected = counts?.Collected ?? 0
  const totalCollections = report?.collections.total ?? 0
  const missedCount = counts?.Missed ?? 0
  const cancelledCount = counts?.Cancelled ?? 0
  const byCategory = report?.summary.by_category ?? []

  const stops = periodSchedules.map((schedule) => ({
    id: String(schedule.id),
    label: schedule.locations[0]?.name ?? "No location",
    time: schedule.window_start,
    status: schedule.status,
    color: schedule.categories[0]?.color_code ?? "#2F7D4F",
  }))

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={todayLabel}
        title="Operations overview"
        subtitle={
          report
            ? `${totalKg.toFixed(1)} kg logged · ${totalCollections} collections · ${PERIOD_LABEL[period].toLowerCase()}`
            : "Loading the latest campus data…"
        }
        actions={
          <>
            <Select
              value={period}
              onValueChange={(value) => {
                setPeriod(value as Period)
                setLoading(true)
              }}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This week</SelectItem>
                <SelectItem value="month">This month</SelectItem>
              </SelectContent>
            </Select>
            <Button asChild>
              <Link to="/admin/reports">Generate report</Link>
            </Button>
          </>
        }
      />

      {error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <AlertCircle className="size-5 text-alarm" />
            <p className="text-[13px] text-ink">{error}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setLoading(true)
                setRefreshKey((key) => key + 1)
              }}
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : loading && !report ? (
        <Card>
          <CardContent className="flex items-center justify-center gap-2 py-12 text-[12.5px] text-muted-ink">
            <Loader2 className="size-4 animate-spin" /> Loading dashboard…
          </CardContent>
        </Card>
      ) : report ? (
        <div className={`space-y-6 ${loading ? "opacity-60" : ""}`} aria-busy={loading}>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <StatTile
              label="Waste logged"
              value={totalKg.toFixed(1)}
              unit="kg"
              hint={PERIOD_LABEL[period].toLowerCase()}
            />
            <StatTile
              label="Collections"
              value={`${collected}/${totalCollections}`}
              hint="collected in the period"
            />
            <StatTile
              label="Missed"
              value={missedCount}
              accent="var(--alarm)"
              hint="needs a reschedule"
            />
            <StatTile
              label="Cancelled"
              value={cancelledCount}
              accent="var(--muted-ink)"
              hint="cancelled runs"
            />
          </div>

          <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-12">
            <Card className="xl:col-span-8">
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div>
                  <CardTitle>Collection route</CardTitle>
                  <p className="text-[12px] text-muted-ink">
                    {PERIOD_LABEL[period]} · all stops in collection order
                  </p>
                </div>
                <Button asChild variant="ghost" size="sm" className="shrink-0">
                  <Link to="/admin/schedules">
                    All schedules <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {stops.length === 0 ? (
                  <p className="py-8 text-center text-[12.5px] text-muted-ink">
                    No collections in this period.
                  </p>
                ) : (
                  <RouteStrip stops={stops} collected={collected} total={totalCollections} />
                )}
              </CardContent>
            </Card>

            <Card className="xl:col-span-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TriangleAlert className="size-4 text-alarm" /> Needs attention
                </CardTitle>
                <p className="text-[12px] text-muted-ink">{missedCount} missed in this period</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {missed.length === 0 ? (
                  <p className="py-6 text-center text-[12px] text-muted-ink">Nothing overdue.</p>
                ) : (
                  missed.map((schedule) => (
                    <Link
                      key={schedule.id}
                      to="/admin/schedules"
                      className="flex items-center justify-between gap-3 rounded-[9px] border border-line px-3 py-2.5 transition-colors hover:border-line-strong"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[12.5px] font-medium">
                          {schedule.locations[0]?.name ?? "No location"}
                        </p>
                        <p className="num text-[10.5px] text-muted-ink">
                          {schedule.scheduled_date} · {schedule.window_start}
                        </p>
                      </div>
                      <StatusTag status={schedule.status} />
                    </Link>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-12">
            <Card className="xl:col-span-5">
              <CardHeader>
                <CardTitle>Waste mix</CardTitle>
                <p className="text-[12px] text-muted-ink">{PERIOD_LABEL[period]} · by category</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {byCategory.length === 0 ? (
                  <p className="py-6 text-center text-[12.5px] text-muted-ink">
                    No waste logged in this period.
                  </p>
                ) : (
                  byCategory.map((category) => (
                    <div key={category.id}>
                      <div className="flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-2 text-[12px] text-ink-2">
                          <span
                            className="size-[7px] rounded-full"
                            style={{ background: category.color_code }}
                          />
                          {category.name}
                        </span>
                        <span className="num text-[11.5px] text-muted-ink">
                          {category.kg.toFixed(1)} kg
                        </span>
                      </div>
                      <div className="mt-1.5 h-1 w-full rounded-full bg-surface-2">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.max(3, category.share)}%`,
                            background: category.color_code,
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
                <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                  <span className="text-[11px] text-muted-ink">Total</span>
                  <span className="num text-[12px] font-medium">{totalKg.toFixed(1)} kg</span>
                </div>
              </CardContent>
            </Card>

            <Card className="xl:col-span-7">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Upcoming collections</CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin/schedules">All schedules</Link>
                </Button>
              </CardHeader>
              <CardContent className="px-0">
                {upcoming.length === 0 ? (
                  <p className="px-4 py-8 text-center text-[12.5px] text-muted-ink">
                    Nothing scheduled.
                  </p>
                ) : (
                  <>
                    <div className="hidden sm:block">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="pl-5">Location</TableHead>
                            <TableHead>Window</TableHead>
                            <TableHead>Assigned</TableHead>
                            <TableHead className="pr-5">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {upcoming.map((schedule) => (
                            <TableRow key={schedule.id}>
                              <TableCell className="pl-5 font-medium">
                                {schedule.locations[0]?.name ?? "No location"}
                              </TableCell>
                              <TableCell className="num text-[11.5px] text-muted-ink">
                                {schedule.scheduled_date} · {schedule.window_start}
                              </TableCell>
                              <TableCell className="text-[12px]">
                                {schedule.assignee?.name ?? "Unassigned"}
                              </TableCell>
                              <TableCell className="pr-5">
                                <StatusTag status={schedule.status} />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="divide-y divide-line sm:hidden">
                      {upcoming.map((schedule) => (
                        <div
                          key={schedule.id}
                          className="flex items-center justify-between gap-3 px-4 py-3"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-[12.5px] font-medium">
                              {schedule.locations[0]?.name ?? "No location"}
                            </p>
                            <p className="num text-[10.5px] text-muted-ink">
                              {schedule.scheduled_date} · {schedule.window_start}
                            </p>
                          </div>
                          <StatusTag status={schedule.status} />
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 no-print">
            <Button asChild className="w-full">
              <Link to="/admin/records">Manage records</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/admin/schedules">Manage schedules</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/admin/reports">View reports</Link>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
