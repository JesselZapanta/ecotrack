import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusTag } from "@/components/ecotrack/StatusTag"
import type { ApiSchedule, Meta, SortColumn, SortDirection } from "@/admin/schedules/types"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Pencil,
  Trash2,
  User,
} from "lucide-react"

function SortHead({
  label,
  column,
  currentSort,
  direction,
  onSort,
  className = "",
}: {
  label: string
  column: SortColumn
  currentSort: SortColumn
  direction: SortDirection
  onSort: (column: SortColumn) => void
  className?: string
}) {
  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSort(column)}
        className="inline-flex items-center gap-1 text-inherit transition-colors hover:text-ink"
      >
        {label}
        {currentSort === column ? (
          direction === "asc" ? (
            <ArrowUp className="size-3" />
          ) : (
            <ArrowDown className="size-3" />
          )
        ) : (
          <ArrowUpDown className="size-3 opacity-40" />
        )}
      </button>
    </TableHead>
  )
}

function CategoryDots({ categories }: { categories: ApiSchedule["categories"] }) {
  return (
    <span className="flex flex-col items-start gap-1">
      {categories.map((category) => (
        <span key={category.id} className="inline-flex items-center gap-1.5 text-[11.5px] whitespace-nowrap text-ink-2">
          <span
            className="size-[7px] shrink-0 rounded-full"
            style={{ background: category.color_code }}
            aria-hidden
          />
          {category.name}
        </span>
      ))}
    </span>
  )
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

type Props = {
  schedules: ApiSchedule[]
  meta: Meta | null
  loading: boolean
  sort: SortColumn
  direction: SortDirection
  perPage: number
  canManage: boolean
  canUpdateStatus: boolean
  showLocations?: boolean
  onSort: (column: SortColumn) => void
  onEdit: (schedule: ApiSchedule) => void
  onDelete: (schedule: ApiSchedule) => void
  onStatusChange: (schedule: ApiSchedule) => void
  onPerPageChange: (value: number) => void
  onPageChange: (page: number) => void
}

export function SchedulesTable({
  schedules,
  meta,
  loading,
  sort,
  direction,
  perPage,
  canManage,
  canUpdateStatus,
  showLocations = true,
  onSort,
  onEdit,
  onDelete,
  onStatusChange,
  onPerPageChange,
  onPageChange,
}: Props) {
  const today = new Date().toISOString().slice(0, 10)
  const showActions = canManage || canUpdateStatus
  const columnCount = 6 + (showLocations ? 1 : 0) + (showActions ? 1 : 0)

  return (
    <Card className="overflow-hidden" aria-busy={loading}>
      <CardContent className="p-0">
        {loading && (
          <div className="h-0.5 w-full overflow-hidden bg-surface-2" aria-hidden>
            <div className="loading-bar h-full w-1/3 rounded-full bg-brand" />
          </div>
        )}

        <div className="divide-y divide-line md:hidden">
          {loading &&
            Array.from({ length: 4 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="space-y-2 px-4 py-4">
                <div className="h-4 w-2/3 animate-pulse rounded-[4px] bg-surface-2" />
                <div className="h-3 w-1/2 animate-pulse rounded-[4px] bg-surface-2" />
                <div className="h-3 w-1/3 animate-pulse rounded-[4px] bg-surface-2" />
              </div>
            ))}

          {!loading &&
            schedules.map((schedule) => {
              const isToday = schedule.scheduled_date === today
              return (
              <div
                key={schedule.id}
                className={`space-y-2.5 px-4 py-4 ${
                  isToday
                    ? "bg-brand-soft border-l-[3px] border-l-brand"
                    : schedule.scheduled_date < today && schedule.status === "Scheduled"
                      ? "bg-alarm-soft/40 border-l-[3px] border-l-alarm"
                      : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-medium text-ink">
                      {schedule.locations.map((location) => location.name).join(", ") || "No location"}
                    </p>
                    <p className="num mt-0.5 text-[10.5px] text-muted-ink">
                      {formatDate(schedule.scheduled_date)} · {schedule.window_start}–{schedule.window_end}
                    </p>
                  </div>
                  <StatusTag status={schedule.status} />
                </div>

                <CategoryDots categories={schedule.categories} />

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[11.5px] text-muted-ink">
                    <User className="size-3" /> {schedule.assignee?.name ?? "Unassigned"}
                  </span>

                  <div className="flex items-center gap-1">
                    {canUpdateStatus && (
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => onStatusChange(schedule)}
                        className="min-h-9 px-2.5"
                      >
                        Update status
                      </Button>
                    )}
                    {canManage && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onEdit(schedule)}
                          aria-label={`Edit schedule ${schedule.id}`}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-alarm hover:bg-alarm-soft"
                          onClick={() => onDelete(schedule)}
                          aria-label={`Delete schedule ${schedule.id}`}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              )
            })}

          {!loading && schedules.length === 0 && (
            <div className="px-6 py-14 text-center">
              <CalendarDays className="mx-auto mb-2 size-5 text-muted-ink" />
              <p className="text-[13px] text-ink">No schedules match those filters</p>
              <p className="mt-1 text-[11.5px] text-muted-ink">Clear the filters or create a new schedule.</p>
            </div>
          )}
        </div>

        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <SortHead label="ID" column="id" currentSort={sort} direction={direction} onSort={onSort} className="pl-5" />
                <SortHead
                  label="Date"
                  column="scheduled_date"
                  currentSort={sort}
                  direction={direction}
                  onSort={onSort}
                />
                <TableHead>Time window</TableHead>
                {showLocations && <TableHead>Locations</TableHead>}
                <TableHead>Categories</TableHead>
                <TableHead>Assignee</TableHead>
                <SortHead label="Status" column="status" currentSort={sort} direction={direction} onSort={onSort} />
                {showActions && <TableHead className="pr-5 text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell className="pl-5" colSpan={columnCount}>
                        <div className="h-5 w-full animate-pulse rounded-[4px] bg-surface-2" />
                      </TableCell>
                    </TableRow>
                  ))
                : schedules.map((schedule) => (
                    <TableRow
                      key={schedule.id}
                      className={
                        schedule.scheduled_date === today
                          ? "bg-brand-soft border-l-[3px] border-l-brand"
                          : schedule.scheduled_date < today && schedule.status === "Scheduled"
                            ? "bg-alarm-soft/40 border-l-[3px] border-l-alarm"
                            : ""
                      }
                    >
                      <TableCell className="num pl-5 text-[11.5px] text-muted-ink">{schedule.id}</TableCell>
                      <TableCell className="num text-[12px]">
                        <span className="inline-flex items-center gap-1.5">
                          {formatDate(schedule.scheduled_date)}
                          {schedule.scheduled_date === today && (
                            <span className="rounded-[4px] bg-brand px-1.5 py-0.5 text-[9.5px] font-semibold text-white">
                              Today
                            </span>
                          )}
                          {schedule.scheduled_date < today && schedule.status === "Scheduled" && (
                            <span className="rounded-[4px] bg-alarm px-1.5 py-0.5 text-[9.5px] font-semibold text-white">
                              Past due
                            </span>
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="num text-[11.5px] text-muted-ink">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock className="size-3" />
                          {schedule.window_start}–{schedule.window_end}
                        </span>
                      </TableCell>
                      {showLocations && (
                        <TableCell className="max-w-[200px] text-[12px]">
                          <span className="inline-flex flex-wrap gap-1">
                            {schedule.locations.map((location) => (
                              <span
                                key={location.id}
                                className="inline-flex items-center gap-1 rounded-[5px] border border-line bg-surface-2 px-1.5 py-0.5 text-[10.5px] font-medium text-ink-2"
                              >
                                <MapPin className="size-2.5" />
                                {location.name}
                              </span>
                            ))}
                          </span>
                        </TableCell>
                      )}
                      <TableCell className="max-w-[230px]">
                        <CategoryDots categories={schedule.categories} />
                      </TableCell>
                      <TableCell className="text-[12px] text-muted-ink">
                        {schedule.assignee?.name ?? "Unassigned"}
                      </TableCell>
                      <TableCell>
                        <StatusTag status={schedule.status} />
                      </TableCell>
                      {showActions && (
                        <TableCell className="pr-5 text-right">
                          <div className="flex justify-end gap-1">
                            {canUpdateStatus && (
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={() => onStatusChange(schedule)}
                                className="mr-1"
                              >
                                Update status
                              </Button>
                            )}
                            {canManage && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => onEdit(schedule)}
                                  aria-label={`Edit schedule ${schedule.id}`}
                                >
                                  <Pencil className="size-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  className="text-alarm hover:bg-alarm-soft"
                                  onClick={() => onDelete(schedule)}
                                  aria-label={`Delete schedule ${schedule.id}`}
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}

              {!loading && schedules.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columnCount} className="py-14 text-center">
                    <CalendarDays className="mx-auto mb-2 size-5 text-muted-ink" />
                    <p className="text-[13px] text-ink">No schedules match those filters</p>
                    <p className="mt-1 text-[11.5px] text-muted-ink">Clear the filters or create a new schedule.</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {meta && (
          <div className="flex flex-col gap-3 border-t border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-muted-ink">
              Showing <span className="num">{meta.from ?? 0}</span>–
              <span className="num">{meta.to ?? 0}</span> of <span className="num">{meta.total}</span>
            </p>
            <div className="flex items-center gap-2">
              <Select value={String(perPage)} onValueChange={(value) => onPerPageChange(Number(value))}>
                <SelectTrigger size="sm" className="h-8 w-[86px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 / page</SelectItem>
                  <SelectItem value="25">25 / page</SelectItem>
                  <SelectItem value="50">50 / page</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon-sm"
                disabled={loading || meta.current_page <= 1}
                onClick={() => onPageChange(Math.max(1, meta.current_page - 1))}
                aria-label="Previous page"
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="num min-w-[52px] text-center text-[11px] text-muted-ink">
                {meta.current_page} / {meta.last_page}
              </span>
              <Button
                variant="outline"
                size="icon-sm"
                disabled={loading || meta.current_page >= meta.last_page}
                onClick={() => onPageChange(Math.min(meta.last_page, meta.current_page + 1))}
                aria-label="Next page"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
