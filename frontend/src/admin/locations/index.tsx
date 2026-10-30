import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { PageHeader } from "@/components/ecotrack/PageHeader"
import { LocationsTable } from "@/admin/locations/components/LocationsTable"
import { LocationsToolbar } from "@/admin/locations/components/LocationsToolbar"
import { LocationFormDialog } from "@/admin/locations/components/LocationFormDialog"
import { apiMessage, getLocations, updateLocationStatus } from "@/admin/locations/api"
import type { ApiLocation, Meta, SortColumn, SortDirection } from "@/admin/locations/types"
import { AlertCircle, Plus } from "lucide-react"
import { toast } from "sonner"

export default function Locations() {
  const [locations, setLocations] = useState<ApiLocation[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [sort, setSort] = useState<SortColumn>("id")
  const [direction, setDirection] = useState<SortDirection>("desc")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [refreshKey, setRefreshKey] = useState(0)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ApiLocation | null>(null)
  const [toggleTarget, setToggleTarget] = useState<ApiLocation | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim())
      setPage(1)
    }, 300)

    return () => window.clearTimeout(timer)
  }, [query])

  useEffect(() => {
    let cancelled = false

    getLocations({
      search: debouncedQuery,
      sort,
      direction,
      perPage,
      page,
    })
      .then(({ data, meta: nextMeta }) => {
        if (cancelled) return
        setLocations(data)
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
  }, [debouncedQuery, sort, direction, page, perPage, refreshKey])

  const refresh = () => {
    setLoading(true)
    setRefreshKey((key) => key + 1)
  }

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (location: ApiLocation) => {
    setEditing(location)
    setDialogOpen(true)
  }

  const confirmToggle = async () => {
    if (!toggleTarget) return

    try {
      const result = await updateLocationStatus(toggleTarget.id, !toggleTarget.is_active)
      toast.success(result.message)
      setToggleTarget(null)
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
    setPage(1)
  }

  const filtersActive = query !== ""

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Master data"
        title="Locations"
        subtitle={
          loading
            ? "Updating locations…"
            : meta
              ? `${meta.total} buildings, floors and areas · server-side search and pagination`
              : "Loading locations…"
        }
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Add location
          </Button>
        }
      />

      <LocationsToolbar
        query={query}
        onQueryChange={(value) => {
          setQuery(value)
          setLoading(true)
        }}
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
        <LocationsTable
          locations={locations}
          meta={meta}
          loading={loading}
          sort={sort}
          direction={direction}
          perPage={perPage}
          onSort={toggleSort}
          onEdit={openEdit}
          onToggle={setToggleTarget}
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

      {dialogOpen && (
        <LocationFormDialog
          editing={editing}
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

      <ConfirmDialog
        open={!!toggleTarget}
        onOpenChange={(open) => !open && setToggleTarget(null)}
        title={toggleTarget?.is_active ? `Deactivate ${toggleTarget?.name}?` : `Activate ${toggleTarget?.name}?`}
        description={
          toggleTarget?.is_active
            ? "It stays in the database and in existing schedules, but will be hidden from new selections."
            : "It will be available again for new schedules and records."
        }
        confirmLabel={toggleTarget?.is_active ? "Deactivate" : "Activate"}
        variant={toggleTarget?.is_active ? "destructive" : "default"}
        onConfirm={confirmToggle}
      />
    </div>
  )
}
