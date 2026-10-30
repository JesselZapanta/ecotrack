import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { PageHeader } from "@/components/ecotrack/PageHeader"
import { useAuth } from "@/lib/store"
import { SchedulesTable } from "@/admin/schedules/components/SchedulesTable"
import { SchedulesToolbar } from "@/admin/schedules/components/SchedulesToolbar"
import { ScheduleFormDialog } from "@/admin/schedules/components/ScheduleFormDialog"
import { ScheduleCalendar } from "@/admin/schedules/components/ScheduleCalendar"
import { StatusUpdateDialog } from "@/admin/schedules/components/StatusUpdateDialog"
import {
  apiMessage,
  deleteSchedule,
  getCategoryOptions,
  getLocationOptions,
  getMaintenanceUsers,
  getSchedules,
  getSchedulesForRange,
  sweepSchedules,
} from "@/admin/schedules/api"
import type {
  ApiSchedule,
  FilterOption,
  Meta,
  SortColumn,
  SortDirection,
} from "@/admin/schedules/types"
import { AlertCircle, CalendarDays, List, Plus } from "lucide-react"
import { toast } from "sonner"

function isoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`
}

function monthBounds(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0)
  return { from: isoDate(first), to: isoDate(last) }
}

export default function Schedules() {
  const { role, user } = useAuth()
  const isAdmin = role === "admin"
  const canUpdateStatus = role === "admin" || role === "maintenance"

  const [view, setView] = useState<"list" | "calendar">("list")

  const [schedules, setSchedules] = useState<ApiSchedule[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [status, setStatus] = useState("all")
  const [categoryId, setCategoryId] = useState("all")
  const [locationId, setLocationId] = useState("all")
  const [date, setDate] = useState("")
  const [sort, setSort] = useState<SortColumn>("status")
  const [direction, setDirection] = useState<SortDirection>("asc")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [refreshKey, setRefreshKey] = useState(0)
  const [ready, setReady] = useState(false)

  const [categories, setCategories] = useState<FilterOption[]>([])
  const [locations, setLocations] = useState<FilterOption[]>([])
  const [assignees, setAssignees] = useState<FilterOption[]>([])

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ApiSchedule | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ApiSchedule | null>(null)
  const [statusTarget, setStatusTarget] = useState<ApiSchedule | null>(null)

  const [month, setMonth] = useState(() => new Date())
  const [monthSchedules, setMonthSchedules] = useState<ApiSchedule[]>([])
  const [monthLoading, setMonthLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim())
      setPage(1)
    }, 300)

    return () => window.clearTimeout(timer)
  }, [query])

  useEffect(() => {
    if (!isAdmin) return

    getCategoryOptions().then(setCategories).catch(() => setCategories([]))
    getLocationOptions().then(setLocations).catch(() => setLocations([]))
    getMaintenanceUsers().then(setAssignees).catch(() => setAssignees([]))
  }, [isAdmin])

  useEffect(() => {
    let cancelled = false

    sweepSchedules()
      .then((result) => {
        if (cancelled) return
        if (result.swept > 0) {
          toast.success(result.message)
        }
      })
      .catch(() => {
        // Sweep is best-effort; the list still loads.
      })
      .finally(() => {
        if (!cancelled) setReady(true)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!ready) return
    let cancelled = false

    getSchedules({
      search: debouncedQuery,
      status,
      categoryId,
      locationId,
      date,
      sort,
      direction,
      perPage,
      page,
    })
      .then(({ data, meta: nextMeta }) => {
        if (cancelled) return
        setSchedules(data)
        setMeta(nextMeta)
        setError(null)
      })
      .catch((err) => {
        if (!cancelled) setError(apiMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [ready, debouncedQuery, status, categoryId, locationId, date, sort, direction, page, perPage, refreshKey])

  useEffect(() => {
    if (view !== "calendar") return

    let cancelled = false
    const { from, to } = monthBounds(month)

    getSchedulesForRange(from, to)
      .then((data) => {
        if (!cancelled) setMonthSchedules(data)
      })
      .catch((err) => {
        if (!cancelled) toast.error(apiMessage(err))
      })
      .finally(() => {
        if (!cancelled) setMonthLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [view, month, refreshKey])

  const refresh = () => {
    setLoading(true)
    setMonthLoading(true)
    setRefreshKey((key) => key + 1)
  }

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (schedule: ApiSchedule) => {
    setEditing(schedule)
    setDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return

    try {
      const message = await deleteSchedule(deleteTarget.id)
      toast.success(message)
      setDeleteTarget(null)
      refresh()
    } catch (err) {
      toast.error(apiMessage(err))
      throw err
    }
  }

  const toggleSort = (column: SortColumn) => {
    setLoading(true)
    if (sort === column) {
      setDirection((current) => (current === "asc" ? "desc" : "asc"))
    } else {
      setSort(column)
      setDirection("asc")
    }
    setPage(1)
  }

  const clearFilters = () => {
    setLoading(true)
    setQuery("")
    setDebouncedQuery("")
    setStatus("all")
    setCategoryId("all")
    setLocationId("all")
    setDate("")
    setPage(1)
  }

  const filtersActive =
    query !== "" ||
    status !== "all" ||
    categoryId !== "all" ||
    locationId !== "all" ||
    date !== ""

  const subtitle = useMemo(() => {
    if (loading) return "Updating schedules…"
    if (!meta) return "Loading schedules…"

    if (role === "maintenance") return `${meta.total} collections assigned to you`
    if (role === "office") {
      const officeName = user?.office?.name ?? "your office"
      const locationName = user?.office?.location?.name
      return `${meta.total} collections at ${locationName ?? "your office location"} · ${officeName}`
    }
    return `${meta.total} collection schedules · multi-category routes`
  }, [loading, meta, role, user])

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Planning"
        title="Schedules"
        subtitle={subtitle}
        actions={
          isAdmin ? (
            <Button onClick={openCreate}>
              <Plus className="size-4" /> Create schedule
            </Button>
          ) : undefined
        }
      />

      <Tabs value={view} onValueChange={(value) => {
        if (value === "calendar") setMonthLoading(true)
        setView(value as "list" | "calendar")
      }} className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">
            <List className="size-4" /> List
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <CalendarDays className="size-4" /> Calendar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <SchedulesToolbar
            query={query}
            onQueryChange={(value) => {
              setQuery(value)
              setLoading(true)
            }}
            status={status}
            onStatusChange={(value) => {
              setLoading(true)
              setStatus(value)
              setPage(1)
            }}
            categoryId={categoryId}
            onCategoryChange={(value) => {
              setLoading(true)
              setCategoryId(value)
              setPage(1)
            }}
            locationId={locationId}
            onLocationChange={(value) => {
              setLoading(true)
              setLocationId(value)
              setPage(1)
            }}
            date={date}
            onDateChange={(value) => {
              setLoading(true)
              setDate(value)
              setPage(1)
            }}
            categories={categories}
            locations={locations}
            canFilterMasterData={isAdmin}
            loading={loading}
            filtersActive={filtersActive}
            onClear={clearFilters}
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
          ) : (
            <SchedulesTable
              schedules={schedules}
              meta={meta}
              loading={loading}
              sort={sort}
              direction={direction}
              perPage={perPage}
              canManage={isAdmin}
              canUpdateStatus={canUpdateStatus}
              showLocations={role !== "office"}
              onSort={toggleSort}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
              onStatusChange={setStatusTarget}
              onPerPageChange={(value) => {
                setLoading(true)
                setPerPage(value)
                setPage(1)
              }}
              onPageChange={(nextPage) => {
                setLoading(true)
                setPage(nextPage)
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="calendar">
          <ScheduleCalendar
            month={month}
            onMonthChange={(next) => {
              setMonthLoading(true)
              setMonth(next)
            }}
            schedules={monthSchedules}
            loading={monthLoading}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </TabsContent>
      </Tabs>

      {dialogOpen && (
        <ScheduleFormDialog
          editing={editing}
          categories={categories}
          locations={locations}
          assignees={assignees}
          onClose={() => {
            setDialogOpen(false)
            setEditing(null)
          }}
          onSaved={() => {
            refresh()
            setPage(1)
          }}
        />
      )}

      {statusTarget && (
        <StatusUpdateDialog
          schedule={statusTarget}
          onClose={() => setStatusTarget(null)}
          onSaved={refresh}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={`Delete schedule #${deleteTarget?.id ?? ""}?`}
        description="Its status history is removed too. This cannot be undone."
        confirmLabel="Delete schedule"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  )
}
