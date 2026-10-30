import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { ApiCategory, Meta, SortColumn, SortDirection } from "@/admin/categories/types"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Power,
  Recycle,
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

type Props = {
  categories: ApiCategory[]
  meta: Meta | null
  loading: boolean
  sort: SortColumn
  direction: SortDirection
  perPage: number
  onSort: (column: SortColumn) => void
  onEdit: (category: ApiCategory) => void
  onToggle: (category: ApiCategory) => void
  onPerPageChange: (value: number) => void
  onPageChange: (page: number) => void
}

export function CategoriesTable({
  categories,
  meta,
  loading,
  sort,
  direction,
  perPage,
  onSort,
  onEdit,
  onToggle,
  onPerPageChange,
  onPageChange,
}: Props) {
  return (
    <Card className="overflow-hidden" aria-busy={loading}>
      <CardContent className="p-0">
        {loading && (
          <div className="h-0.5 w-full overflow-hidden bg-surface-2" aria-hidden>
            <div className="loading-bar h-full w-1/3 rounded-full bg-brand" />
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <SortHead label="ID" column="id" currentSort={sort} direction={direction} onSort={onSort} className="pl-5" />
              <TableHead>Color</TableHead>
              <SortHead label="Category" column="name" currentSort={sort} direction={direction} onSort={onSort} />
              <TableHead>Hex</TableHead>
              <TableHead className="hidden md:table-cell">Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="pr-5 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={`skeleton-${index}`}>
                    <TableCell className="pl-5" colSpan={7}>
                      <div className="h-5 w-full animate-pulse rounded-[4px] bg-surface-2" />
                    </TableCell>
                  </TableRow>
                ))
              : categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="num pl-5 text-[11.5px] text-muted-ink">{category.id}</TableCell>
                    <TableCell>
                      <span
                        className="inline-block size-4 rounded-[3px] border border-ink/10"
                        style={{ background: category.color }}
                        aria-hidden
                      />
                    </TableCell>
                    <TableCell className="text-[12.5px] font-medium">{category.name}</TableCell>
                    <TableCell className="num text-[11.5px] text-muted-ink">{category.color_code}</TableCell>
                    <TableCell className="hidden max-w-[280px] truncate text-[11.5px] text-muted-ink md:table-cell">
                      {category.description ?? "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-[5px] px-1.5 py-0.5 text-[10px] font-semibold ${
                          category.is_active ? "bg-ok-soft text-ok" : "bg-surface-2 text-muted-ink"
                        }`}
                      >
                        {category.is_active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => onEdit(category)} aria-label={`Edit ${category.name}`}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className={category.is_active ? "text-alarm hover:bg-alarm-soft" : "text-ok hover:bg-ok-soft"}
                          onClick={() => onToggle(category)}
                          aria-label={category.is_active ? `Deactivate ${category.name}` : `Activate ${category.name}`}
                        >
                          <Power className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

            {!loading && categories.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-14 text-center">
                  <Recycle className="mx-auto mb-2 size-5 text-muted-ink" />
                  <p className="text-[13px] text-ink">No categories match that search</p>
                  <p className="mt-1 text-[11.5px] text-muted-ink">Clear the search or add a new category.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

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
