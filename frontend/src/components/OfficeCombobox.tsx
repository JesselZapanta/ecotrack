import { useState } from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export type OfficeChoice = {
  id: number
  name: string
}

type Props = {
  offices: OfficeChoice[]
  value: string
  onChange: (value: string) => void
  emptyValue?: string
  emptyLabel?: string
  triggerClassName?: string
}

export function OfficeCombobox({
  offices,
  value,
  onChange,
  emptyValue = "",
  emptyLabel = "No office",
  triggerClassName,
}: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const selected = offices.find((office) => String(office.id) === value)
  const isEmpty = value === emptyValue
  const filtered = offices.filter((office) =>
    office.name.toLowerCase().includes(query.trim().toLowerCase())
  )

  const choose = (next: string) => {
    onChange(next)
    setOpen(false)
    setQuery("")
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setQuery("")
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("h-11 w-full justify-between px-3 font-normal sm:h-10", triggerClassName)}
        >
          <span className="truncate">
            {selected?.name ?? (isEmpty ? emptyLabel : "Selected office")}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-muted-ink" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] min-w-[260px] max-w-[calc(100vw-2rem)] p-0"
      >
        <div className="flex items-center gap-2 border-b border-line px-3">
          <Search className="size-4 shrink-0 text-muted-ink" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search office..."
            className="h-11 border-0 px-0 focus-visible:shadow-none sm:h-10"
            autoFocus
          />
        </div>

        <div className="max-h-[240px] overflow-y-auto p-1">
          <button
            type="button"
            onClick={() => choose(emptyValue)}
            className="flex min-h-11 w-full items-center justify-between gap-2 rounded-[6px] px-2.5 text-left text-[12.5px] transition-colors hover:bg-surface-2 sm:min-h-10"
          >
            <span className="text-muted-ink">{emptyLabel}</span>
            {isEmpty && <Check className="size-4 text-brand" />}
          </button>

          {filtered.map((office) => (
            <button
              key={office.id}
              type="button"
              onClick={() => choose(String(office.id))}
              className="flex min-h-11 w-full items-center justify-between gap-2 rounded-[6px] px-2.5 text-left text-[12.5px] transition-colors hover:bg-surface-2 sm:min-h-10"
            >
              <span className="truncate">{office.name}</span>
              {String(office.id) === value && <Check className="size-4 shrink-0 text-brand" />}
            </button>
          ))}

          {filtered.length === 0 && (
            <p className="px-2.5 py-6 text-center text-[11.5px] text-muted-ink">
              No office matches.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
