import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/ecotrack/PageHeader"
import { StatTile } from "@/components/ecotrack/StatTile"
import { StatusTag } from "@/components/ecotrack/StatusTag"
import { useAuth } from "@/lib/store"
import { getReport, reportMessage } from "@/admin/reports/api"
import type { Report } from "@/admin/reports/api"
import { getSchedules } from "@/admin/schedules/api"
import type { ApiSchedule } from "@/admin/schedules/types"
import { getWasteRecords } from "@/admin/records/api"
import type { ApiWasteRecord } from "@/admin/records/api"
import { AlertCircle, ClipboardList, Loader2, MapPin } from "lucide-react"

function inputDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function monthRange() {
  const now = new Date()
  return {
    from: inputDate(new Date(now.getFullYear(), now.getMonth(), 1)),
    to: inputDate(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
  }
}

function formatDate(value: string | null) {
  if (!value) return "—"
  const date = new Date(`${value.slice(0, 10)}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

export default function OfficeDashboard() {
  const { user } = useAuth()
  const [report, setReport] = useState<Report | null>(null)
  const [upcoming, setUpcoming] = useState<ApiSchedule[]>([])
  const [records, setRecords] = useState<ApiWasteRecord[]>([])
  const [recordTotal, setRecordTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    const range = monthRange()
    const today = inputDate(new Date())

    Promise.all([
      getReport({
        dateFrom: range.from,
        dateTo: range.to,
        locationId: "all",
        categoryId: "all",
      }),
      getSchedules({
        search: "",
        status: "Scheduled",
        categoryId: "all",
        locationId: "all",
        date: "",
        dateFrom: today,
        sort: "scheduled_date",
        direction: "asc",
        perPage: 6,
        page: 1,
      }),
      getWasteRecords({
        search: "",
        status: "all",
        categoryId: "all",
        locationId: "all",
        sort: "date",
        direction: "desc",
        perPage: 6,
        page: 1,
      }),
    ])
      .then(([nextReport, scheduleResult, recordResult]) => {
        if (cancelled) return
        setReport(nextReport)
        setUpcoming(scheduleResult.data)
        setRecords(recordResult.data)
        setRecordTotal(recordResult.meta.total)
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
  }, [refreshKey])

  const refresh = () => {
    setLoading(true)
    setRefreshKey((key) => key + 1)
  }

  const scheduled = report?.collections.counts.Scheduled ?? 0
  const collected = report?.collections.counts.Collected ?? 0
  const missed = report?.collections.counts.Missed ?? 0
  const totalKg = report?.summary.total_kg ?? 0
  const byCategory = report?.summary.by_category ?? []
  const maxKg = Math.max(...byCategory.map((category) => category.kg), 1)

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Office view"
        title="Overview"
        subtitle={
          user?.office?.name
            ? `${user.office.name}${user.office.location?.name ? ` · ${user.office.location.name}` : ""}`
            : "Your office's collections and waste"
        }
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/office/schedules">View schedules</Link>
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
            <Loader2 className="size-4 animate-spin" /> Loading your overview…
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile label="Scheduled" value={scheduled} hint="this month" accent="var(--info)" />
            <StatTile label="Collected" value={collected} hint="this month" accent="var(--ok)" />
            <StatTile label="Missed" value={missed} hint="this month" accent="var(--alarm)" />
            <StatTile label="Waste logged" value={totalKg.toFixed(1)} unit="kg" hint="this month" />
          </div>

          <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-12">
            <Card className="xl:col-span-5">
              <CardHeader className="border-b border-line py-4">
                <CardTitle>Waste by category</CardTitle>
                <p className="text-[11.5px] text-muted-ink">
                  Collected waste at your office location · this month
                </p>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {byCategory.length === 0 && (
                  <p className="py-6 text-center text-[12.5px] text-muted-ink">
                    No waste recorded this month.
                  </p>
                )}

                {byCategory.map((category) => (
                  <div key={category.id} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex min-w-0 items-center gap-1.5 text-[12px] text-ink">
                        <span
                          className="size-[7px] shrink-0 rounded-full"
                          style={{ background: category.color_code }}
                          aria-hidden
                        />
                        <span className="truncate">{category.name}</span>
                      </span>
                      <span className="num shrink-0 text-[11.5px] text-muted-ink">
                        {category.kg.toFixed(1)} kg
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(category.kg / maxKg) * 100}%`,
                          background: category.color_code,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="overflow-hidden xl:col-span-7">
              <CardHeader className="flex flex-row items-center justify-between border-b border-line py-4">
                <div>
                  <CardTitle>Upcoming schedules</CardTitle>
                  <p className="text-[11.5px] text-muted-ink">Next collections for your location</p>
                </div>
                <Link to="/office/schedules" className="text-[11.5px] font-medium text-brand hover:underline">
                  View all
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-line">
                  {upcoming.length === 0 && (
                    <p className="px-4 py-10 text-center text-[12.5px] text-muted-ink">
                      No upcoming schedules.
                    </p>
                  )}

                  {upcoming.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[12.5px] font-medium">
                          {schedule.locations.map((location) => location.name).join(", ") || "No location"}
                        </p>
                        <p className="num text-[10.5px] text-muted-ink">
                          {formatDate(schedule.scheduled_date)} · {schedule.window_start}–{schedule.window_end}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1">
                          {schedule.categories.map((category) => (
                            <span
                              key={category.id}
                              className="inline-flex items-center gap-1 text-[10.5px] text-muted-ink"
                            >
                              <span
                                className="size-[6px] rounded-full"
                                style={{ background: category.color_code }}
                                aria-hidden
                              />
                              {category.name}
                            </span>
                          ))}
                        </div>
                      </div>
                      <StatusTag status={schedule.status} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-line py-4">
              <div>
                <CardTitle>Recent waste records</CardTitle>
                <p className="text-[11.5px] text-muted-ink">Collected waste at your location</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-ink">
                <ClipboardList className="size-3.5" /> {recordTotal}
              </span>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-line">
                {records.length === 0 && (
                  <p className="px-4 py-10 text-center text-[12.5px] text-muted-ink">
                    No waste records for your location yet.
                  </p>
                )}

                {records.map((record) => (
                  <div
                    key={record.id}
                    className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-2">
                      <span
                        className="mt-1 size-[7px] shrink-0 rounded-full"
                        style={{ background: record.category?.color_code ?? "var(--line-strong)" }}
                        aria-hidden
                      />
                      <div className="min-w-0">
                        <p className="truncate text-[12.5px] font-medium">
                          {record.category?.name ?? "Uncategorized"}
                        </p>
                        <p className="flex items-center gap-1 text-[10.5px] text-muted-ink">
                          <MapPin className="size-3" />
                          {record.location?.name ?? "—"} · {formatDate(record.date)}
                        </p>
                      </div>
                    </div>
                    <span className="num text-[12.5px] font-medium">
                      {Number(record.quantity_kg).toFixed(1)} kg
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
