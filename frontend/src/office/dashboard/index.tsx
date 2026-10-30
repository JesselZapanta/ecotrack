import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/ecotrack/PageHeader"
import { StatTile } from "@/components/ecotrack/StatTile"
import { StatusTag } from "@/components/ecotrack/StatusTag"
import { useAuth } from "@/lib/store"
import { getSchedules } from "@/admin/schedules/api"
import type { ApiSchedule } from "@/admin/schedules/types"
import { getWasteRecords } from "@/admin/records/api"
import type { ApiWasteRecord } from "@/admin/records/api"
import { AlertCircle, ClipboardList, Loader2, MapPin } from "lucide-react"

function formatDate(value: string | null) {
  if (!value) return "—"
  const date = new Date(`${value.slice(0, 10)}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

export default function OfficeDashboard() {
  const { user } = useAuth()
  const [schedules, setSchedules] = useState<ApiSchedule[]>([])
  const [records, setRecords] = useState<ApiWasteRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    Promise.all([
      getSchedules({
        search: "",
        status: "all",
        categoryId: "all",
        locationId: "all",
        date: "",
        sort: "scheduled_date",
        direction: "desc",
        perPage: 100,
        page: 1,
      }),
      getWasteRecords({
        search: "",
        status: "all",
        categoryId: "all",
        locationId: "all",
        sort: "date",
        direction: "desc",
        perPage: 100,
        page: 1,
      }),
    ])
      .then(([scheduleResult, recordResult]) => {
        if (cancelled) return
        setSchedules(scheduleResult.data)
        setRecords(recordResult.data)
        setError(null)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load your dashboard.")
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

  const collected = schedules.filter((schedule) => schedule.status === "Collected").length
  const scheduled = schedules.filter((schedule) => schedule.status === "Scheduled").length
  const missed = schedules.filter((schedule) => schedule.status === "Missed").length
  const totalKg = records.reduce((sum, record) => sum + record.quantity_kg, 0)

  const byCategory = Object.values(
    records.reduce<Record<number, { id: number; name: string; color: string; kg: number }>>((acc, record) => {
      if (!record.category) return acc
      const current = acc[record.category.id] ?? {
        id: record.category.id,
        name: record.category.name,
        color: record.category.color_code,
        kg: 0,
      }
      current.kg += record.quantity_kg
      acc[record.category.id] = current
      return acc
    }, {})
  ).sort((a, b) => b.kg - a.kg)

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
            <StatTile label="Scheduled" value={scheduled} hint="upcoming collections" accent="var(--info)" />
            <StatTile label="Collected" value={collected} hint="completed runs" accent="var(--ok)" />
            <StatTile label="Missed" value={missed} hint="needs follow-up" accent="var(--alarm)" />
            <StatTile label="Waste logged" value={totalKg.toFixed(1)} unit="kg" hint="from your location" />
          </div>

          <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-12">
            <Card className="xl:col-span-5">
              <CardHeader className="border-b border-line py-4">
                <CardTitle>Waste by category</CardTitle>
                <p className="text-[11.5px] text-muted-ink">Collected waste at your office location</p>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {byCategory.length === 0 && (
                  <p className="py-6 text-center text-[12.5px] text-muted-ink">No waste recorded yet.</p>
                )}

                {byCategory.map((category) => (
                  <div key={category.id} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex min-w-0 items-center gap-1.5 text-[12px] text-ink">
                        <span
                          className="size-[7px] shrink-0 rounded-full"
                          style={{ background: category.color }}
                          aria-hidden
                        />
                        <span className="truncate">{category.name}</span>
                      </span>
                      <span className="num shrink-0 text-[11.5px] text-muted-ink">{category.kg.toFixed(1)} kg</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(category.kg / maxKg) * 100}%`, background: category.color }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="overflow-hidden xl:col-span-7">
              <CardHeader className="flex flex-row items-center justify-between border-b border-line py-4">
                <CardTitle>Schedules</CardTitle>
                <Link to="/office/schedules" className="text-[11.5px] font-medium text-brand hover:underline">
                  View all
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-line">
                  {schedules.length === 0 && (
                    <p className="px-4 py-10 text-center text-[12.5px] text-muted-ink">
                      No schedules for your office location yet.
                    </p>
                  )}

                  {schedules.slice(0, 6).map((schedule) => (
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
                <ClipboardList className="size-3.5" /> {records.length}
              </span>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-line">
                {records.length === 0 && (
                  <p className="px-4 py-10 text-center text-[12.5px] text-muted-ink">
                    No waste records for your location yet.
                  </p>
                )}

                {records.slice(0, 6).map((record) => (
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
                        <p className="truncate text-[12.5px] font-medium">{record.category?.name ?? "Uncategorized"}</p>
                        <p className="flex items-center gap-1 text-[10.5px] text-muted-ink">
                          <MapPin className="size-3" />
                          {record.location?.name ?? "—"} · {formatDate(record.date)}
                        </p>
                      </div>
                    </div>
                    <span className="num text-[12.5px] font-medium">{record.quantity_kg} kg</span>
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
