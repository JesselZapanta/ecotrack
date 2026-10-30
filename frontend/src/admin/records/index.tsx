import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/ecotrack/PageHeader"
import { EmptyState } from "@/components/ecotrack/EmptyState"
import {
  apiMessage,
  getCategoryOptions,
  getLocationOptions,
  getWasteRecords,
} from "@/admin/records/api"
import type { ApiWasteRecord, WasteRecordsQuery } from "@/admin/records/api"
import type { SortColumn, SortDirection } from "@/admin/records/types"
import { AlertCircle, ClipboardList, Search, ChevronLeft, ChevronRight } from "lucide-react"

export default function Records() {
  const [records, setRecords] = useState<ApiWasteRecord[]>([])
  const [meta, setMeta] = useState<{ current_page: number; last_page: number; per_page: number; total: number; from: number | null; to: number | null } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [category, setCategory] = useState("all")
  const [locationId, setLocationId] = useState("all")
  const [sort, setSort] = useState<SortColumn>("id")
  const [direction, setDirection] = useState<SortDirection>("desc")
  const [page, setPage] = useState(1)
  const perPage = 10
  const [refreshKey, setRefreshKey] = useState(0)

  const [locations, setLocations] = useState<{ id: number; name: string }[]>([])
  const [categories, setCategories] = useState<{ id: number; name: string; color_code: string }[]>([])


  useEffect(() => {
    const t = window.setTimeout(() => {
      setDebouncedQuery(query.trim())
      setPage(1)
    }, 300)
    return () => window.clearTimeout(t)
  }, [query])

  useEffect(() => {
    getLocationOptions().then(setLocations).catch(() => setLocations([]))
    getCategoryOptions().then(setCategories).catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    let cancelled = false
    const q: WasteRecordsQuery = {
      search: debouncedQuery,
      status: "all",
      categoryId: category,
      locationId,
      sort,
      direction,
      perPage,
      page,
    }
    getWasteRecords(q)
      .then(({ data, meta: m }) => {
        if (cancelled) return
        setRecords(data)
        setMeta(m)
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
  }, [debouncedQuery, category, locationId, sort, direction, page, perPage, refreshKey])

  const refresh = () => {
    setLoading(true)
    setRefreshKey((k) => k + 1)
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

  const totalKg = records.reduce((sum, r) => sum + r.quantity_kg, 0)

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Monitoring"
        title="Waste records"
        subtitle={
          loading
            ? "Updating records…"
            : meta
              ? `${meta.total} records · ${totalKg.toFixed(1)} kg`
              : "Loading records…"
        }
        actions={
          <span className="inline-flex items-center gap-1 rounded-[6px] border border-line bg-surface-2 px-2 py-1 text-[10.5px] font-medium text-muted-ink">
            View only
          </span>
        }
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-ink" />
          <Input
            placeholder="Search location, category or remarks"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={category} onValueChange={(v) => { setCategory(v); setLoading(true); setPage(1) }}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={locationId} onValueChange={(v) => { setLocationId(v); setLoading(true); setPage(1) }}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All locations</SelectItem>
              {locations.map((l) => (
                <SelectItem key={l.id} value={String(l.id)}>{l.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <AlertCircle className="size-5 text-alarm" />
            <p className="text-[13px] text-ink">{error}</p>
            <Button size="sm" variant="outline" onClick={refresh}>Try again</Button>
          </CardContent>
        </Card>
      ) : loading ? (
        <Card>
          <CardContent className="flex items-center justify-center gap-2 py-12 text-[12.5px] text-muted-ink">
            Loading records…
          </CardContent>
        </Card>
      ) : records.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="size-5" />}
          title="No records match"
          description="Adjust the filters or add the first record."
          actionLabel={undefined}
          onAction={undefined}
        />
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-5 cursor-pointer" onClick={() => toggleSort("id")}>ID</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => toggleSort("date")}>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => toggleSort("quantity_kg")}>Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="num pl-5 text-[11.5px] text-muted-ink">{record.id}</TableCell>
                    <TableCell className="num text-[12px]">{record.date}</TableCell>
                    <TableCell>
                      <p className="text-[13px] font-medium">{record.location?.name}</p>
                      <p className="text-[11px] text-muted-ink">{record.location?.building}</p>
                    </TableCell>
                    <TableCell>
                      {record.category && (
                        <span className="inline-flex items-center gap-1.5 text-[12px]">
                          <span className="size-[7px] rounded-full" style={{ background: record.category.color_code }} />
                          {record.category.name}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="num text-right text-[12px]">{record.quantity_kg} kg</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {meta && (
              <div className="flex items-center justify-between border-t border-line px-4 py-3">
                <p className="text-[11px] text-muted-ink">
                  Showing {meta.from ?? 0}–{meta.to ?? 0} of {meta.total}
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon-sm" disabled={loading || meta.current_page <= 1} onClick={() => { setLoading(true); setPage(Math.max(1, meta.current_page - 1)) }}>
                    <ChevronLeft className="size-4" />
                  </Button>
                  <span className="num text-[11px] text-muted-ink">{meta.current_page} / {meta.last_page}</span>
                  <Button variant="outline" size="icon-sm" disabled={loading || meta.current_page >= meta.last_page} onClick={() => { setLoading(true); setPage(Math.min(meta.last_page, meta.current_page + 1)) }}>
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}


    </div>
  )
}
