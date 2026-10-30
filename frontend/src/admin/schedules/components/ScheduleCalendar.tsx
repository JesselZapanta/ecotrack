import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusTag } from "@/components/ecotrack/StatusTag"
import type { ApiSchedule } from "@/admin/schedules/types"
import { ChevronLeft, ChevronRight, Clock, Loader2 } from "lucide-react"

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

function isoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`
}

function buildGrid(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const offset = (first.getDay() + 6) % 7
  const start = new Date(first)
  start.setDate(first.getDate() - offset)

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start)
    day.setDate(start.getDate() + index)
    return day
  })
}

type Props = {
  month: Date
  onMonthChange: (month: Date) => void
  schedules: ApiSchedule[]
  loading: boolean
  selectedDate: string | null
  onSelectDate: (date: string | null) => void
}

export function ScheduleCalendar({
  month,
  onMonthChange,
  schedules,
  loading,
  selectedDate,
  onSelectDate,
}: Props) {
  const [expanded, setExpanded] = useState(false)

  const byDate = useMemo(() => {
    const map = new Map<string, ApiSchedule[]>()
    for (const schedule of schedules) {
      const key = schedule.scheduled_date
      const list = map.get(key) ?? []
      list.push(schedule)
      map.set(key, list)
    }
    return map
  }, [schedules])

  const grid = useMemo(() => buildGrid(month), [month])
  const todayIso = isoDate(new Date())

  const daySchedules = selectedDate ? (byDate.get(selectedDate) ?? []) : []
  const visible = expanded ? daySchedules : daySchedules.slice(0, 4)

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_340px]">
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between gap-2 border-b border-line py-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
              aria-label="Previous month"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <p className="min-w-[130px] text-center text-[13px] font-semibold">
              {month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
            </p>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
              aria-label="Next month"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {loading && <Loader2 className="size-3.5 animate-spin text-muted-ink" />}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onMonthChange(new Date())
                onSelectDate(todayIso)
              }}
            >
              Today
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-2 sm:p-3">
          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="pb-1 text-center text-[9.5px] font-bold tracking-[0.08em] text-muted-ink uppercase"
              >
                {day}
              </div>
            ))}

            {grid.map((day) => {
              const key = isoDate(day)
              const inMonth = day.getMonth() === month.getMonth()
              const entries = byDate.get(key) ?? []
              const isToday = key === todayIso
              const isSelected = key === selectedDate
              const collected = entries.filter((entry) => entry.status === "Collected").length

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onSelectDate(isSelected ? null : key)}
                  className={`relative flex min-h-[54px] flex-col items-start gap-1 rounded-[7px] border p-1.5 text-left transition-colors sm:min-h-[74px] sm:p-2 ${
                    isSelected
                      ? "border-brand bg-brand-soft"
                      : isToday
                        ? "border-brand/40 bg-surface"
                        : "border-line/70 bg-surface hover:border-line-strong"
                  } ${inMonth ? "" : "opacity-40"}`}
                >
                  <span
                    className={`num text-[11px] leading-none ${isToday ? "font-bold text-brand" : "text-ink-2"}`}
                  >
                    {day.getDate()}
                  </span>

                  {entries.length > 0 && (
                    <>
                      <span className="hidden flex-wrap gap-0.5 sm:flex">
                        {entries.slice(0, 4).map((entry) => (
                          <span
                            key={entry.id}
                            className="size-[6px] rounded-full"
                            style={{ background: entry.categories[0]?.color_code ?? "#6E756D" }}
                            aria-hidden
                          />
                        ))}
                      </span>
                      <span className="num text-[9.5px] text-muted-ink sm:hidden">
                        {entries.length}
                      </span>
                      <span className="num mt-auto hidden text-[9px] text-muted-ink sm:block">
                        {collected}/{entries.length}
                      </span>
                    </>
                  )}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader className="border-b border-line py-3">
          <CardTitle className="text-[13px]">
            {selectedDate
              ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "short",
                  day: "numeric",
                })
              : "Pick a day"}
          </CardTitle>
          <p className="text-[11.5px] text-muted-ink">
            {selectedDate ? `${daySchedules.length} stops on this date` : "Select a date to see its stops."}
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {!selectedDate && (
            <p className="px-4 py-8 text-center text-[12px] text-muted-ink">
              The calendar shows every scheduled collection for the month.
            </p>
          )}

          {selectedDate && daySchedules.length === 0 && (
            <p className="px-4 py-8 text-center text-[12px] text-muted-ink">
              No collections on this date.
            </p>
          )}

          <div className="divide-y divide-line">
            {visible.map((entry) => (
              <div key={entry.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-[12.5px] font-medium">
                      {entry.locations.map((location) => location.name).join(", ") || "No location"}
                    </p>
                    <p className="num mt-0.5 flex items-center gap-1 text-[10.5px] text-muted-ink">
                      <Clock className="size-3" /> {entry.window_start}–{entry.window_end}
                    </p>
                  </div>
                  <StatusTag status={entry.status} />
                </div>

                <div className="mt-1.5 flex flex-wrap gap-x-2 gap-y-1">
                  {entry.categories.map((category) => (
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
            ))}
          </div>

          {daySchedules.length > 4 && (
            <div className="border-t border-line p-2">
              <Button variant="ghost" size="sm" className="w-full" onClick={() => setExpanded(!expanded)}>
                {expanded ? "Show less" : `Show ${daySchedules.length - 4} more`}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
