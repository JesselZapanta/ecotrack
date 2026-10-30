import { useState } from "react"
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  MessageSquareWarning,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EmptyState } from "@/components/ecotrack/EmptyState"
import { ConcernCard } from "./ConcernCard"
import { ConcernDetailDialog } from "./ConcernDetailDialog"
import { useConcerns } from "../useConcerns"

type Props = {
  canManage?: boolean
  emptyTitle?: string
  emptyDescription?: string
}

export function ConcernsList({
  canManage = false,
  emptyTitle = "No concerns yet",
  emptyDescription = "Overflowing bins, improper disposal and missed pickups will appear here.",
}: Props) {
  const {
    concerns,
    meta,
    loading,
    error,
    query,
    status,
    workingId,
    search,
    filterStatus,
    goToPage,
    changePerPage,
    changeStatus,
    refresh,
  } = useConcerns()

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const selected = concerns.find((concern) => concern.id === selectedId) ?? null

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-ink" />
          <Input
            placeholder="Search description, location or reporter"
            value={query}
            onChange={(event) => search(event.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={status} onValueChange={filterStatus}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="Acknowledged">Acknowledged</SelectItem>
            <SelectItem value="Resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
      ) : loading && concerns.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center gap-2 py-12 text-[12.5px] text-muted-ink">
            <Loader2 className="size-4 animate-spin" /> Loading concerns…
          </CardContent>
        </Card>
      ) : concerns.length === 0 ? (
        <EmptyState
          icon={<MessageSquareWarning className="size-5" />}
          title={emptyTitle}
          description={emptyDescription}
        />
      ) : (
        <>
          <div className={`stagger grid grid-cols-1 gap-3 xl:grid-cols-2 ${loading ? "opacity-60" : ""}`}>
            {concerns.map((concern) => (
              <ConcernCard
                key={concern.id}
                concern={concern}
                actions={
                  <Button
                    size="sm"
                    variant="outline"
                    className="min-h-11 sm:min-h-9"
                    onClick={() => setSelectedId(concern.id)}
                  >
                    <Eye className="size-3.5" /> View details
                  </Button>
                }
              />
            ))}
          </div>

          {meta && (
            <div className="flex flex-col gap-3 border-t border-line pt-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] text-muted-ink">
                Showing <span className="num">{meta.from ?? 0}</span>–<span className="num">{meta.to ?? 0}</span> of{" "}
                <span className="num">{meta.total}</span>
              </p>
              <div className="flex items-center gap-2">
                <Select value={String(meta.per_page)} onValueChange={(value) => changePerPage(Number(value))}>
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
                  onClick={() => goToPage(Math.max(1, meta.current_page - 1))}
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
                  onClick={() => goToPage(Math.min(meta.last_page, meta.current_page + 1))}
                  aria-label="Next page"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <ConcernDetailDialog
        key={selectedId ?? "closed"}
        concern={selected}
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null)
        }}
        canManage={canManage}
        working={selected ? workingId === selected.id : false}
        onStatusChange={changeStatus}
      />
    </div>
  )
}
