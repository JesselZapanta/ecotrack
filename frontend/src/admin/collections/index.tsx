import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/ecotrack/PageHeader"
import { StatusTag } from "@/components/ecotrack/StatusTag"
import { CategoryChip } from "@/components/ecotrack/CategoryChip"
import { schedules as initial, locById, type CollectionSchedule } from "@/lib/mockData"
import { toast } from "sonner"
import { Clock, User } from "lucide-react"

const columns: { status: CollectionSchedule["status"]; label: string; dot: string }[] = [
  { status: "Scheduled", label: "Scheduled", dot: "bg-info" },
  { status: "Collected", label: "Collected", dot: "bg-ok" },
  { status: "Missed", label: "Missed", dot: "bg-alarm" },
]

export default function CollectionsBoard() {
  const [schedules, setSchedules] = useState<CollectionSchedule[]>(initial)
  const [selected, setSelected] = useState<CollectionSchedule | null>(null)
  const [action, setAction] = useState<CollectionSchedule["status"]>("Collected")
  const [remark, setRemark] = useState("")

  const updateStatus = () => {
    if (!selected) return
    setSchedules(schedules.map((schedule) => (schedule.id === selected.id ? { ...schedule, status: action } : schedule)))
    toast.success(`Collection marked as ${action.toLowerCase()}.`)
    setSelected(null)
    setRemark("")
  }

  const open = (schedule: CollectionSchedule) => {
    setSelected(schedule)
    setAction("Collected")
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Live board"
        title="Collections"
        subtitle="A route board grouped by status. Open a card to move it forward."

      />

      <div className="flex gap-3 overflow-x-auto pb-2">
        {columns.map((column) => {
          const items = schedules.filter((schedule) => schedule.status === column.status)
          return (
            <div key={column.status} className="w-[224px] shrink-0">
              <div className="mb-2 flex items-center justify-between px-1">
                <span className="inline-flex items-center gap-2 text-[11.5px] font-medium text-ink">
                  <span className={`size-[6px] rounded-full ${column.dot}`} />
                  {column.label}
                </span>
                <span className="num text-[10.5px] text-muted-ink">{items.length}</span>
              </div>

              <div className="space-y-2">
                {items.map((schedule) => {
                  const location = locById(schedule.locationIds[0])
                  return (
                    <button
                      key={schedule.id}
                      onClick={() => open(schedule)}
                      className="w-full rounded-[10px] border border-line bg-surface p-3 text-left transition-colors hover:border-line-strong"
                    >
                      <p className="text-[12.5px] font-medium text-ink">{location.name}</p>
                      <p className="text-[10.5px] text-muted-ink">{location.area}</p>
                      <div className="mt-2 flex items-center gap-3 text-[10.5px] text-muted-ink">
                        <span className="num inline-flex items-center gap-1">
                          <Clock className="size-3" /> {schedule.windowStart}–{schedule.windowEnd}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <User className="size-3" /> {schedule.assignedTo}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 border-t border-line pt-2">
                        {schedule.categoryIds.map((id) => (
                          <CategoryChip key={id} categoryId={id} size="xs" />
                        ))}
                      </div>
                    </button>
                  )
                })}

                {items.length === 0 && (
                  <div className="rounded-[10px] border border-dashed border-line px-3 py-8 text-center text-[11px] text-muted-ink">
                    Nothing here
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <Dialog open={!!selected} onOpenChange={(isOpen) => !isOpen && setSelected(null)}>
        <DialogContent className="max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Update collection status</DialogTitle>
            <DialogDescription>Each change stores who changed it, when, and an optional remark.</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="rounded-[9px] border border-line bg-surface-2 p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[13px] font-medium">
                      {locById(selected.locationIds[0]).name} · {locById(selected.locationIds[0]).area}
                    </p>
                    <p className="num text-[11px] text-muted-ink">
                      {selected.date} · {selected.windowStart} to {selected.windowEnd}
                    </p>
                  </div>
                  <StatusTag status={selected.status} />
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-[12.5px] font-medium">New status</p>
                <Select value={action} onValueChange={(value) => setAction(value as never)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Collected">Collected</SelectItem>
                    <SelectItem value="Missed">Missed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <p className="text-[12.5px] font-medium">Remark (optional)</p>
                <Textarea
                  value={remark}
                  onChange={(event) => setRemark(event.target.value)}
                  placeholder="Reason for missed, note for the admin, etc."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>
              Cancel
            </Button>
            <Button onClick={updateStatus}>Save status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
