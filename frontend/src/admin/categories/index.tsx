import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ConfirmDialog"
import { PageHeader } from "@/components/ecotrack/PageHeader"
import { CategoriesTable } from "@/admin/categories/components/CategoriesTable"
import { CategoriesToolbar } from "@/admin/categories/components/CategoriesToolbar"
import { CategoryFormDialog } from "@/admin/categories/components/CategoryFormDialog"
import { apiMessage, getCategories, updateCategoryStatus } from "@/admin/categories/api"
import type { ApiCategory, Meta, SortColumn, SortDirection } from "@/admin/categories/types"
import { AlertCircle, Info, Plus } from "lucide-react"
import { toast } from "sonner"

export default function Categories() {
  const [categories, setCategories] = useState<ApiCategory[]>([])
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
  const [editing, setEditing] = useState<ApiCategory | null>(null)
  const [toggleTarget, setToggleTarget] = useState<ApiCategory | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim())
      setPage(1)
    }, 300)

    return () => window.clearTimeout(timer)
  }, [query])

  useEffect(() => {
    let cancelled = false

    getCategories({
      search: debouncedQuery,
      sort,
      direction,
      perPage,
      page,
    })
      .then(({ data, meta: nextMeta }) => {
        if (cancelled) return
        setCategories(data)
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

  const openEdit = (category: ApiCategory) => {
    setEditing(category)
    setDialogOpen(true)
  }

  const confirmToggle = async () => {
    if (!toggleTarget) return

    try {
      const result = await updateCategoryStatus(toggleTarget.id, !toggleTarget.is_active)
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
        title="Waste categories"
        subtitle={
          loading
            ? "Updating categories…"
            : meta
              ? `${meta.total} categories · server-side search and pagination`
              : "Loading categories…"
        }
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" /> Add category
          </Button>
        }
      />

      <CategoriesToolbar
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
        <CategoriesTable
          categories={categories}
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

      <div className="flex items-start gap-2.5 rounded-[10px] border border-warn/20 bg-warn-soft p-3.5">
        <Info className="mt-0.5 size-4 shrink-0 text-warn" />
        <p className="text-[11.5px] leading-5 text-warn">
          Category colors never mean status. Yellow is a fill only — never text on a light background.
        </p>
      </div>

      {dialogOpen && (
        <CategoryFormDialog
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
