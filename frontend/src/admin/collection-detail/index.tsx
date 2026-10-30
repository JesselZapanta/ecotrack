import { Link, useParams } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ecotrack/PageHeader"
import { StatusTag } from "@/components/ecotrack/StatusTag"
import { CategoryChip } from "@/components/ecotrack/CategoryChip"
import { schedules, locById } from "@/lib/mockData"
import { toast } from "sonner"
import { ArrowLeft, CalendarClock, MapPin, User } from "lucide-react"

export default function CollectionDetail() {
  const { id } = useParams()
  const schedule = schedules.find((item) => item.id === id)

  if (!schedule) {
    return (
      <div className="py-10 text-center text-[13px] text-muted-ink">
        Collection not found.{" "}
        <Link to="/admin/collections" className="text-brand underline">
          Back to board
        </Link>
      </div>
    )
  }

  const location = locById(schedule.locationIds[0])

  return (
    <div className="mx-auto max-w-[760px] space-y-5">
      <Link to="/admin/collections" className="inline-flex items-center gap-1.5 text-[12px] font-medium text-brand hover:underline">
        <ArrowLeft className="size-3.5" /> Back to board
      </Link>

      <PageHeader
        eyebrow={`Collection #${schedule.id.toUpperCase()}`}
        title={`${location.name}, ${location.area}`}
        subtitle={`${location.building} · ${schedule.date}`}
        actions={<StatusTag status={schedule.status} />}
      />

      <Card>
        <CardContent className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
          <div>
            <p className="label">Window</p>
            <p className="num mt-1 flex items-center gap-1.5 text-[13px]">
              <CalendarClock className="size-3.5 text-muted-ink" /> {schedule.windowStart}–{schedule.windowEnd}
            </p>
          </div>
          <div>
            <p className="label">Assigned</p>
            <p className="mt-1 flex items-center gap-1.5 text-[13px]">
              <User className="size-3.5 text-muted-ink" /> {schedule.assignedTo}
            </p>
          </div>
          <div>
            <p className="label">Location</p>
            <p className="mt-1 flex items-center gap-1.5 text-[13px]">
              <MapPin className="size-3.5 text-muted-ink" /> {location.building}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {schedule.categoryIds.map((categoryId) => (
            <CategoryChip key={categoryId} categoryId={categoryId} />
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <CardHeader>
            <CardTitle>Status history</CardTitle>
            <p className="text-[12px] text-muted-ink">Who changed it, when, and why.</p>
          </CardHeader>
          <CardContent>
            <ol className="relative space-y-4 border-l border-line pl-5">
              {[
                { at: "2026-10-25 07:00", status: "Scheduled", by: "Admin TCGC" },
                { at: "2026-10-25 07:05", status: "Collected", by: "Mang Ben" },
              ].map((entry) => (
                <li key={entry.at} className="relative">
                  <span className="absolute top-1.5 -left-[25px] size-2 rounded-full bg-brand ring-4 ring-surface" />
                  <p className="text-[12.5px] font-medium">{entry.status}</p>
                  <p className="num text-[10.5px] text-muted-ink">
                    {entry.at} · {entry.by}
                  </p>
                </li>
              ))}
            </ol>
            <p className="mt-4 border-t border-line pt-3 text-[11px] leading-5 text-muted-ink">
              Linked waste records move to Collected when this schedule is marked Collected.
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <p className="text-[12px] text-muted-ink">One clear next step.</p>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="h-11 w-full" onClick={() => toast.success("Marked as collected.")}>
              Mark as collected
            </Button>
            <Button variant="outline" className="h-11 w-full border-alarm/30 text-alarm" onClick={() => toast("Marked as missed.")}>
              Mark as missed
            </Button>
            <p className="pt-1 text-[11px] leading-5 text-muted-ink">
              A schedule not marked Collected after its window is flagged Overdue automatically.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
