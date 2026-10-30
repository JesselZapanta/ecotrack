import { ChevronDown } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { FilterOption } from "@/admin/schedules/types"

type Props = {
  id?: string
  options: FilterOption[]
  selected: number[]
  onToggle: (id: number) => void
  onClear: () => void
  placeholder: string
  emptyLabel?: string
}

export function MultiSelectField({
  id,
  options,
  selected,
  onToggle,
  onClear,
  placeholder,
  emptyLabel = "No options available",
}: Props) {
  const selectedOptions = options.filter((option) => selected.includes(option.id))

  const label =
    selectedOptions.length === 0
      ? placeholder
      : selectedOptions.length === 1
        ? selectedOptions[0].name
        : `${selectedOptions.length} selected`

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          id={id}
          type="button"
          className="flex h-10 w-full items-center justify-between gap-2 rounded-[8px] border border-line-strong bg-surface px-3 text-[13px] text-ink transition-[border-color,box-shadow] outline-none focus-visible:border-brand focus-visible:shadow-[0_0_0_3px_rgba(14,74,54,0.12)] data-[state=open]:border-brand"
        >
          <span className={`truncate text-left ${selectedOptions.length === 0 ? "text-muted-ink" : ""}`}>
            {label}
          </span>
          <ChevronDown className="size-4 shrink-0 text-muted-ink opacity-60" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={4}
        className="max-h-[280px] w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto"
      >
        {options.length === 0 && (
          <p className="px-2 py-3 text-center text-[12px] text-muted-ink">{emptyLabel}</p>
        )}

        {options.map((option) => {
          const isSelected = selected.includes(option.id)

          return (
            <DropdownMenuCheckboxItem
              key={option.id}
              checked={isSelected}
              onCheckedChange={() => onToggle(option.id)}
              className="min-h-9 text-[12.5px]"
            >
              <span className="flex min-w-0 items-center gap-2">
                {option.color_code && (
                  <span
                    className="size-[7px] shrink-0 rounded-full"
                    style={{ background: option.color_code }}
                    aria-hidden
                  />
                )}
                <span className="truncate">{option.name}</span>
              </span>
            </DropdownMenuCheckboxItem>
          )
        })}

        {selected.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={onClear}
              className="justify-center text-[11.5px] font-medium text-muted-ink"
            >
              Clear selection
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
