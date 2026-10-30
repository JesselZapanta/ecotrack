import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/ecotrack/PageHeader"
import { apiMessage, getAuditLogs } from "@/admin/audit/api"
import type { ApiAuditLog, Meta, SortColumn, SortDirection } from "@/admin/audit/types"
import { AlertCircle, ChevronLeft, ChevronRight, Search } from "lucide-react"

const ACTION_STYLES: Record<string, string> = {
  created: "bg-ok-soft text-ok",
  updated: "bg-info-soft text-info",
  activated: "bg-ok-soft text-ok",
  deactivated: "bg-alarm-soft text-alarm",
  status_changed: "bg-warn-soft text-warn",
  password_changed: "bg-warn-soft text-warn",
  deleted: "bg-alarm-soft text-alarm",
}

function formatWhen(value: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<ApiAuditLog[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [action, setAction] = useState("all")
  const sort: SortColumn = "created_at"
  const direction: SortDirection = "desc"
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim())
      setPage(1)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [query])

  useEffect(() => {
    let cancelled = false

    getAuditLogs({ search: debouncedQuery, action, sort, direction, perPage, page })
      .then(({ data, meta: nextMeta }) => {
        if (cancelled) return
        setLogs(data)
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
  }, [debouncedQuery, action, sort, direction, page, perPage, refreshKey])

  const refresh = () => {
    setLoading(true)
    setRefreshKey((key) => key + 1)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Traceability"
        title="Audit log"
        subtitle={
          loading
            ? "Updating activity…"
            : meta
              ? `${meta.total} recorded actions · admin only`
              : "Loading activity…"
        }
        actions={
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <div className="relative flex-1 sm:w-[240px]">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-ink" />
              <Input
                placeholder="Search actions"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setLoading(true)
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={action}
              onValueChange={(value) => {
                setAction(value)
                setLoading(true)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="updated">Updated</SelectItem>
                <SelectItem value="activated">Activated</SelectItem>
                <SelectItem value="deactivated">Deactivated</SelectItem>
                <SelectItem value="status_changed">Status changed</SelectItem>
                <SelectItem value="password_changed">Password changed</SelectItem>
                <SelectItem value="deleted">Deleted</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
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
        <Card className="overflow-hidden" aria-busy={loading}>
          <CardContent className="p-0">
            {loading && (
              <div className="h-0.5 w-full overflow-hidden bg-surface-2" aria-hidden>
                <div className="loading-bar h-full w-1/3 rounded-full bg-brand" />
              </div>
            )}

            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-5">When</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead className="pr-5">Detail</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading
                    ? Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={`skeleton-${index}`}>
                          <TableCell className="pl-5" colSpan={5}>
                            <div className="h-5 w-full animate-pulse rounded-[4px] bg-surface-2" />
                          </TableCell>
                        </TableRow>
                      ))
                    : logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="num pl-5 text-[11px] whitespace-nowrap text-muted-ink">
                            {formatWhen(log.created_at)}
                          </TableCell>
                          <TableCell className="text-[12px] font-medium">{log.user?.name ?? "System"}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex rounded-[5px] px-1.5 py-0.5 text-[10px] font-semibold ${
                                ACTION_STYLES[log.action] ?? "bg-surface-2 text-muted-ink"
                              }`}
                            >
                              {log.action.replace("_", " ")}
                            </span>
                          </TableCell>
                          <TableCell className="text-[12px]">
                            {log.entity_type}
                            {log.entity_id && <span className="num text-[10.5px] text-muted-ink"> #{log.entity_id}</span>}
                          </TableCell>
                          <TableCell className="pr-5 text-[11.5px] text-muted-ink">{log.description}</TableCell>
                        </TableRow>
                      ))}

                  {!loading && logs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-14 text-center">
                        <p className="text-[13px] text-ink">No activity matches</p>
                        <p className="mt-1 text-[11.5px] text-muted-ink">Clear the search or change the action filter.</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="divide-y divide-line md:hidden">
              {loading &&
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={`m-skeleton-${index}`} className="space-y-2 px-4 py-4">
                    <div className="h-4 w-2/3 animate-pulse rounded-[4px] bg-surface-2" />
                    <div className="h-3 w-1/2 animate-pulse rounded-[4px] bg-surface-2" />
                  </div>
                ))}

              {!loading &&
                logs.map((log) => (
                  <div key={log.id} className="space-y-1.5 px-4 py-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[12.5px] font-medium">{log.description}</p>
                      <span
                        className={`shrink-0 rounded-[5px] px-1.5 py-0.5 text-[9.5px] font-semibold ${
                          ACTION_STYLES[log.action] ?? "bg-surface-2 text-muted-ink"
                        }`}
                      >
                        {log.action.replace("_", " ")}
                      </span>
                    </div>
                    <p className="num text-[10.5px] text-muted-ink">
                      {log.user?.name ?? "System"} · {formatWhen(log.created_at)}
                    </p>
                  </div>
                ))}

              {!loading && logs.length === 0 && (
                <p className="px-4 py-10 text-center text-[12.5px] text-muted-ink">No activity matches.</p>
              )}
            </div>

            {meta && (
              <div className="flex flex-col gap-3 border-t border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[11px] text-muted-ink">
                  Showing <span className="num">{meta.from ?? 0}</span>–<span className="num">{meta.to ?? 0}</span> of{" "}
                  <span className="num">{meta.total}</span>
                </p>
                <div className="flex items-center gap-2">
                  <Select value={String(perPage)} onValueChange={(value) => { setLoading(true); setPerPage(Number(value)); setPage(1) }}>
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
                    onClick={() => { setLoading(true); setPage(Math.max(1, meta.current_page - 1)) }}
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
                    onClick={() => { setLoading(true); setPage(Math.min(meta.last_page, meta.current_page + 1)) }}
                    aria-label="Next page"
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <p className="text-[11px] text-muted-ink">
        Backed by the audit_logs table — creates, edits, activations, status changes and deletions record who, when and what.
      </p>
    </div>
  )
}
