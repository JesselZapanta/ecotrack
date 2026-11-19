import { useState } from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export type SearchSelectOption = {
  value: string
  label: string
  color?: string | null
}

type Props = {
  options: SearchSelectOption[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  triggerClassName?: string
  disabled?: boolean
}

export function SearchSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select",
  searchPlaceholder = "Search...",
  emptyMessage = "No options match.",
  triggerClassName,
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const selected = options.find((option) => option.value === value)
  const filtered = options.filter((option) =>
    option.label.toLowerCase().includes(query.trim().toLowerCase())
  )

  const choose = (next: string) => {
    onValueChange(next)
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
          disabled={disabled}
          className={cn("h-11 w-full justify-between px-3 font-normal sm:h-10", triggerClassName)}
        >
          <span className="flex min-w-0 items-center gap-1.5">
            {selected?.color && (
              <span
                className="size-[7px] shrink-0 rounded-full"
                style={{ background: selected.color }}
                aria-hidden
              />
            )}
            <span className="truncate">{selected?.label ?? placeholder}</span>
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-muted-ink" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] min-w-[220px] max-w-[calc(100vw-2rem)] p-0"
      >
        <div className="flex items-center gap-2 border-b border-line px-3">
          <Search className="size-4 shrink-0 text-muted-ink" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-11 border-0 px-0 focus-visible:shadow-none sm:h-10"
            autoFocus
          />
        </div>

        <div className="max-h-[240px] overflow-y-auto p-1">
          {filtered.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => choose(option.value)}
              className="flex min-h-11 w-full items-center justify-between gap-2 rounded-[6px] px-2.5 text-left text-[12.5px] transition-colors hover:bg-surface-2 sm:min-h-10"
            >
              <span className="flex min-w-0 items-center gap-1.5">
                {option.color && (
                  <span
                    className="size-[7px] shrink-0 rounded-full"
                    style={{ background: option.color }}
                    aria-hidden
                  />
                )}
                <span className="truncate">{option.label}</span>
              </span>
              {option.value === value && <Check className="size-4 shrink-0 text-brand" />}
            </button>
          ))}

          {filtered.length === 0 && (
            <p className="px-2.5 py-6 text-center text-[11.5px] text-muted-ink">{emptyMessage}</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
