import { useState } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/lib/store"
import { PageHeader } from "@/components/ecotrack/PageHeader"
import { StatTile } from "@/components/ecotrack/StatTile"
import { RouteStrip } from "@/components/ecotrack/RouteStrip"
import { StatusTag } from "@/components/ecotrack/StatusTag"
import { CategoryChip } from "@/components/ecotrack/CategoryChip"
import { wasteCategories, wasteRecords, schedules, locations, offices, locById } from "@/lib/mockData"
import { toast } from "sonner"
import { ArrowRight, CalendarDays, TriangleAlert } from "lucide-react"

const todayLabel = "Tuesday, 25 October 2026"

export default function Dashboard() {
  const { role, userName, user } = useAuth()
  const [period, setPeriod] = useState("This month")

  /* ── Maintenance ── */
  if (role === "maintenance") {
    const mine = schedules.filter((schedule) => schedule.assignedTo === userName)
    const today = mine.filter((schedule) => schedule.date === "2026-10-25")
    const next =
      today.find((schedule) => schedule.status === "Scheduled") ??
      today[0]
    const nextLocation = next ? locById(next.locationIds[0]) : null
    const collected = today.filter((schedule) => schedule.status === "Collected").length

    const stops = today.map((schedule) => ({
      id: schedule.id,
      label: locById(schedule.locationIds[0]).name,
      time: schedule.windowStart,
      status: schedule.status,
      color: wasteCategories.find((category) => category.id === schedule.categoryIds[0])?.color ?? "#2F7D4F",
    }))

    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow={todayLabel}
          title={`Good morning, ${userName}`}
          subtitle="Your route for today. One clear action per stop."
          actions={
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/schedules">
                <CalendarDays className="size-4" /> Full schedule
              </Link>
            </Button>
          }
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <Card className="lg:col-span-7">
            <CardHeader>
              <CardTitle>Today’s route</CardTitle>
              <p className="text-[12px] text-muted-ink">{today.length} stops assigned to you</p>
            </CardHeader>
            <CardContent>
              <RouteStrip stops={stops} collected={collected} total={today.length} compact />
            </CardContent>
          </Card>

          <Card className="border-l-[3px] border-l-brand lg:col-span-5">
            <CardHeader>
              <p className="label">Next stop</p>
              <CardTitle className="text-[20px]">{nextLocation ? nextLocation.name : "No stops left"}</CardTitle>
              <p className="text-[12px] text-muted-ink">
                {next ? `${next.windowStart}–${next.windowEnd} · ${nextLocation?.area}` : "You are clear for today."}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {next && (
                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {next.categoryIds.map((id) => (
                    <CategoryChip key={id} categoryId={id} />
                  ))}
                </div>
              )}
              <div className="grid grid-cols-1 gap-2">
                <Button
                  className="h-12 w-full"
                  onClick={() => toast.success("Marked as collected.")}
                >
                  Mark as collected
                </Button>
                <Button variant="outline" className="h-11 w-full" onClick={() => toast("Marked as missed.")}>
                  Mark as missed
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>All stops</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/maintenance/dashboard">
                Open dashboard <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {mine.map((schedule) => {
              const location = locById(schedule.locationIds[0])
              return (
                <div
                  key={schedule.id}
                  className="flex flex-col gap-2 rounded-[9px] border border-line bg-surface px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="num text-[11px] text-muted-ink">{schedule.windowStart}</span>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium">{location.name}</p>
                      <p className="text-[11px] text-muted-ink">
                        {location.area} · {schedule.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusTag status={schedule.status} />
                    <Button asChild size="sm" variant="outline">
                      <Link to="/admin/schedules">Open</Link>
                    </Button>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    )
  }

  /* ── Office ── */
  if (role === "office") {
    const officeKey = offices.find((office) => office.name === user?.office?.name)?.id ?? "o1"
    const myLocations = locations.filter((location) => location.officeId === officeKey)
    const mySchedules = schedules.filter((schedule) =>
      schedule.locationIds.some((id) => myLocations.some((location) => location.id === id))
    )
    const myRecords = wasteRecords.filter((record) =>
      myLocations.some((location) => location.id === record.locationId)
    )
    const collected = mySchedules.filter((schedule) => schedule.status === "Collected").length
    const next = mySchedules.find((schedule) => schedule.status === "Scheduled")

    const stops = mySchedules.map((schedule) => ({
      id: schedule.id,
      label: locById(schedule.locationIds[0]).name,
      time: schedule.windowStart,
      status: schedule.status,
      color: wasteCategories.find((category) => category.id === schedule.categoryIds[0])?.color ?? "#2F7D4F",
    }))

    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Office view"
          title="Office overview"
          subtitle={`${user?.office?.name ?? "Your office"} · read-only access to your locations`}
          actions={
            <Button asChild size="sm">
              <Link to="/admin/report-concern">Report a concern</Link>
            </Button>
          }
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatTile label="Records this month" value={myRecords.length} hint="Across your locations" />
          <StatTile label="Collections completed" value={`${collected}/${mySchedules.length}`} hint="This week" />
          <StatTile
            label="Next collection"
            value={next ? next.windowStart : "—"}
            hint={next ? `${locById(next.locationIds[0]).name} · ${next.date}` : "Nothing scheduled"}
          />
        </div>

        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12">
          <Card className="lg:col-span-7">
            <CardHeader>
              <CardTitle>Your collection route</CardTitle>
              <p className="text-[12px] text-muted-ink">Only locations assigned to your office</p>
            </CardHeader>
            <CardContent>
              <RouteStrip stops={stops} collected={collected} total={mySchedules.length} />
            </CardContent>
          </Card>

          <Card className="lg:col-span-5">
            <CardHeader>
              <CardTitle>Recent records</CardTitle>
              <p className="text-[12px] text-muted-ink">Latest entries for your locations</p>
            </CardHeader>
            <CardContent className="space-y-2">
              {myRecords.slice(0, 4).map((record) => (
                <div key={record.id} className="flex items-center justify-between gap-3 rounded-[9px] border border-line px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px] font-medium">{locById(record.locationId).name}</p>
                    <p className="num text-[10.5px] text-muted-ink">{record.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="num text-[11.5px]">{record.quantityKg} kg</span>
                    <StatusTag status={record.status} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col items-start justify-between gap-3 rounded-[12px] border border-warn/20 bg-warn-soft px-4 py-3 sm:flex-row sm:items-center">
          <p className="text-[12.5px] text-warn">Your account can view this page but not change it.</p>
          <Button asChild size="sm" variant="outline" className="border-warn/30 text-warn">
            <Link to="/admin/report-concern">Report a concern</Link>
          </Button>
        </div>
      </div>
    )
  }

  /* ── Admin ── */
  const totalKg = wasteRecords.reduce((sum, record) => sum + record.quantityKg, 0)
  const collected = schedules.filter((schedule) => schedule.status === "Collected").length
  const missed = schedules.filter((schedule) => schedule.status === "Missed").length
  const attention = schedules.filter((schedule) => schedule.status === "Missed")

  const byCategory = wasteCategories.map((category) => {
    const sum = wasteRecords
      .filter((record) => record.categoryId === category.id)
      .reduce((total, record) => total + record.quantityKg, 0)
    return { ...category, sum, percent: Math.round((sum / totalKg) * 100) }
  })

  const stops = schedules.map((schedule) => ({
    id: schedule.id,
    label: locById(schedule.locationIds[0]).name,
    time: schedule.windowStart,
    status: schedule.status,
    color: wasteCategories.find((category) => category.id === schedule.categoryIds[0])?.color ?? "#2F7D4F",
  }))

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={todayLabel}
        title="Operations overview"
        subtitle={`${totalKg.toFixed(1)} kg logged · ${schedules.length} collections on the board`}
        actions={
          <>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Today">Today</SelectItem>
                <SelectItem value="This week">This week</SelectItem>
                <SelectItem value="This month">This month</SelectItem>
                <SelectItem value="Custom range">Custom range</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => toast.success("Report generated.")}>Generate report</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatTile
          label="Waste logged"
          value={totalKg.toFixed(1)}
          unit="kg"
          trend={{ value: "12%", up: true }}
          spark={[18, 26, 22, 34, 30, 42, 38]}
          hint={period.toLowerCase()}
        />
        <StatTile
          label="Collections"
          value={`${collected}/${schedules.length}`}
          trend={{ value: "8%", up: true }}
          spark={[2, 3, 2, 4, 3, 5, 4]}
          hint="on the board"
        />
        <StatTile
          label="Missed"
          value={missed}
          spark={[1, 0, 1, 1, 0, 1, 1]}
          accent="var(--alarm)"
          hint="needs a reschedule"
        />
        <StatTile
          label="Cancelled"
          value={schedules.filter((schedule) => schedule.status === "Cancelled").length}
          spark={[0, 0, 1, 0, 0, 1, 0]}
          accent="var(--muted-ink)"
          hint="cancelled runs"
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-8">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>This week’s route</CardTitle>
              <p className="text-[12px] text-muted-ink">All stops, in collection order</p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin/collections">
                Board <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <RouteStrip stops={stops} collected={collected} total={schedules.length} />
          </CardContent>
        </Card>

        <Card className="xl:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TriangleAlert className="size-4 text-alarm" /> Needs attention
            </CardTitle>
            <p className="text-[12px] text-muted-ink">{attention.length} items past or missed</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {attention.map((schedule) => {
              const location = locById(schedule.locationIds[0])
              return (
                <Link
                  key={schedule.id}
                  to="/admin/schedules"
                  className="flex items-center justify-between gap-3 rounded-[9px] border border-line px-3 py-2.5 transition-colors hover:border-line-strong"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px] font-medium">{location.name}</p>
                    <p className="num text-[10.5px] text-muted-ink">
                      {schedule.date} · {schedule.windowStart}
                    </p>
                  </div>
                  <StatusTag status={schedule.status} />
                </Link>
              )
            })}
            {attention.length === 0 && <p className="py-6 text-center text-[12px] text-muted-ink">Nothing overdue.</p>}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-12">
        <Card className="xl:col-span-5">
          <CardHeader>
            <CardTitle>Waste mix</CardTitle>
            <p className="text-[12px] text-muted-ink">{period} · by category</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {byCategory.map((category) => (
              <div key={category.id}>
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2 text-[12px] text-ink-2">
                    <span className="size-[7px] rounded-full" style={{ background: category.color }} />
                    {category.name}
                  </span>
                  <span className="num text-[11.5px] text-muted-ink">{category.sum.toFixed(1)} kg</span>
                </div>
                <div className="mt-1.5 h-1 w-full rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${Math.max(3, category.percent)}%`, background: category.color }}
                  />
                </div>
              </div>
            ))}
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
                  {schedules.slice(0, 5).map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell className="pl-5 font-medium">{locById(schedule.locationIds[0]).name}</TableCell>
                      <TableCell className="num text-[11.5px] text-muted-ink">
                        {schedule.date} · {schedule.windowStart}
                      </TableCell>
                      <TableCell className="text-[12px]">{schedule.assignedTo}</TableCell>
                      <TableCell className="pr-5">
                        <StatusTag status={schedule.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="divide-y divide-line sm:hidden">
              {schedules.slice(0, 5).map((schedule) => (
                <div key={schedule.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px] font-medium">{locById(schedule.locationIds[0]).name}</p>
                    <p className="num text-[10.5px] text-muted-ink">
                      {schedule.date} · {schedule.windowStart}
                    </p>
                  </div>
                  <StatusTag status={schedule.status} />
                </div>
              ))}
            </div>
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
          <Link to="/admin/schedules">Schedules board</Link>
        </Button>
      </div>
    </div>
  )
}
