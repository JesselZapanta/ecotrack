import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { ApiUser, Meta, SortColumn, SortDirection } from "@/admin/user/types"
import type { Role } from "@/lib/mockData"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Power,
  UsersRound,
} from "lucide-react"

const roleLabel: Record<Role, string> = {
  admin: "Administrator",
  maintenance: "Maintenance",
  office: "Office",
}

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
  users: ApiUser[]
  meta: Meta | null
  loading: boolean
  sort: SortColumn
  direction: SortDirection
  perPage: number
  onSort: (column: SortColumn) => void
  onEdit: (user: ApiUser) => void
  onToggle: (user: ApiUser) => void
  onPerPageChange: (value: number) => void
  onPageChange: (page: number) => void
}

export function UsersTable({
  users,
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
              <SortHead label="Name" column="name" currentSort={sort} direction={direction} onSort={onSort} />
              <SortHead label="Email" column="email" currentSort={sort} direction={direction} onSort={onSort} />
              <SortHead label="Role" column="role" currentSort={sort} direction={direction} onSort={onSort} />
              <TableHead>Office</TableHead>
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
              : users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="num pl-5 text-[11.5px] text-muted-ink">{user.id}</TableCell>
                    <TableCell>
                      <p className="text-[12.5px] font-medium">{user.name}</p>
                      {user.username && (
                        <p className="num text-[10.5px] text-muted-ink">@{user.username}</p>
                      )}
                    </TableCell>
                    <TableCell className="num text-[11.5px] text-muted-ink">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "admin" ? "soft" : "outline"} className="capitalize">
                        {roleLabel[user.role]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[12px]">{user.office?.name ?? "—"}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${
                          user.is_active ? "text-ok" : "text-alarm"
                        }`}
                      >
                        <span className={`size-[5px] rounded-full ${user.is_active ? "bg-ok" : "bg-alarm"}`} />
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="pr-5 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => onEdit(user)}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className={user.is_active ? "text-alarm hover:bg-alarm-soft" : "text-ok hover:bg-ok-soft"}
                          onClick={() => onToggle(user)}
                          aria-label={user.is_active ? "Deactivate user" : "Activate user"}
                        >
                          <Power className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

            {!loading && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-14 text-center">
                  <UsersRound className="mx-auto mb-2 size-5 text-muted-ink" />
                  <p className="text-[13px] text-ink">No users match those filters</p>
                  <p className="mt-1 text-[11.5px] text-muted-ink">Clear the filters or add a new user.</p>
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
