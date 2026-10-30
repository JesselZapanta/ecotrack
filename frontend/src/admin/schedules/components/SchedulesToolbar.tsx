import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { FilterOption } from "@/admin/schedules/types"
import { Loader2, Search, X } from "lucide-react"

type Props = {
  query: string
  onQueryChange: (value: string) => void
  status: string
  onStatusChange: (value: string) => void
  categoryId: string
  onCategoryChange: (value: string) => void
  locationId: string
  onLocationChange: (value: string) => void
  date: string
  onDateChange: (value: string) => void
  categories: FilterOption[]
  locations: FilterOption[]
  canFilterMasterData: boolean
  loading: boolean
  filtersActive: boolean
  onClear: () => void
}

export function SchedulesToolbar({
  query,
  onQueryChange,
  status,
  onStatusChange,
  categoryId,
  onCategoryChange,
  locationId,
  onLocationChange,
  date,
  onDateChange,
  categories,
  locations,
  canFilterMasterData,
  loading,
  filtersActive,
  onClear,
}: Props) {
  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-ink" />
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search location, assignee or notes"
            className="pr-9 pl-9"
          />
          {loading && (
            <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-ink" />
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger className="h-10 w-[calc(50vw-1.25rem)] min-w-[140px] sm:w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="Scheduled">Scheduled</SelectItem>
              <SelectItem value="Collected">Collected</SelectItem>
              <SelectItem value="Missed">Missed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={date}
            onChange={(event) => onDateChange(event.target.value)}
            aria-label="Filter by date"
            className="h-10 w-[calc(50vw-1.25rem)] min-w-[140px] sm:w-[156px]"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {canFilterMasterData && (
          <>
            <Select value={categoryId} onValueChange={onCategoryChange}>
              <SelectTrigger className="h-10 w-full sm:w-[190px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="size-[7px] rounded-full"
                        style={{ background: category.color_code ?? "#6E756D" }}
                        aria-hidden
                      />
                      {category.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={locationId} onValueChange={onLocationChange}>
              <SelectTrigger className="h-10 w-full sm:w-[190px]">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location.id} value={String(location.id)}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}

        {filtersActive && (
          <Button variant="ghost" size="sm" onClick={onClear} className="self-start sm:ml-auto">
            <X className="size-3.5" /> Clear filters
          </Button>
        )}
      </div>
    </div>
  )
}
