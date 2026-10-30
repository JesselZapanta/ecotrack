import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { PageHeader } from "@/components/ecotrack/PageHeader"
import { OfficesTable } from "@/admin/offices/components/OfficesTable"
import { OfficesToolbar } from "@/admin/offices/components/OfficesToolbar"
import { OfficeFormDialog } from "@/admin/offices/components/OfficeFormDialog"
import { apiMessage, getLocations, getOffices, updateOfficeStatus } from "@/admin/offices/api"
import type { ApiOffice, LocationOption, Meta, SortColumn, SortDirection } from "@/admin/offices/types"
import { AlertCircle, Plus } from "lucide-react"
import { toast } from "sonner"

export default function Offices() {
  const [offices, setOffices] = useState<ApiOffice[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [locations, setLocations] = useState<LocationOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [location, setLocation] = useState("all")
  const [sort, setSort] = useState<SortColumn>("id")
  const [direction, setDirection] = useState<SortDirection>("desc")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [refreshKey, setRefreshKey] = useState(0)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ApiOffice | null>(null)
  const [toggleTarget, setToggleTarget] = useState<ApiOffice | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim())
      setPage(1)
    }, 300)

    return () => window.clearTimeout(timer)
  }, [query])

  useEffect(() => {
    getLocations()
      .then(setLocations)
      .catch(() => setLocations([]))
  }, [])

  useEffect(() => {
    let cancelled = false

    getOffices({
      search: debouncedQuery,
      locationId: location,
      sort,
      direction,
      perPage,
      page,
    })
      .then(({ data, meta: nextMeta }) => {
        if (cancelled) return
        setOffices(data)
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
  }, [debouncedQuery, location, sort, direction, page, perPage, refreshKey])

  const refresh = () => {
    setLoading(true)
    setRefreshKey((key) => key + 1)
  }

  const openCreate = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (office: ApiOffice) => {
    setEditing(office)
    setDialogOpen(true)
  }

  const confirmToggle = async () => {
    if (!toggleTarget) return

    try {
      const result = await updateOfficeStatus(toggleTarget.id, toggleTarget.status === "Active" ? "Inactive" : "Active")
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
    setLocation("all")
    setPage(1)
  }

  const filtersActive = query !== "" || location !== "all"

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Master data"
        title="Offices"
        subtitle={
          loading
            ? "Updating offices…"
            : meta
              ? `${meta.total} offices · server-side search and pagination`
              : "Loading offices…"
        }
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Add office
          </Button>
        }
      />

      <OfficesToolbar
        query={query}
        onQueryChange={(value) => {
          setQuery(value)
          setLoading(true)
        }}
        location={location}
        onLocationChange={(value) => {
          setLoading(true)
          setLocation(value)
          setPage(1)
        }}
        locations={locations}
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
        <OfficesTable
          offices={offices}
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
        <OfficeFormDialog
          editing={editing}
          locations={locations}
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
        title={toggleTarget?.status === "Active" ? `Deactivate ${toggleTarget?.name}?` : `Activate ${toggleTarget?.name}?`}
        description={
          toggleTarget?.status === "Active"
            ? "It stays in the database and in existing schedules, but will be hidden from new selections."
            : "It will be available again for new schedules and records."
        }
        confirmLabel={toggleTarget?.status === "Active" ? "Deactivate" : "Activate"}
        variant={toggleTarget?.status === "Active" ? "destructive" : "default"}
        onConfirm={confirmToggle}
      />
    </div>
  )
}
