import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchSelect } from "@/components/SearchSelect"
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
          <SearchSelect
            options={[
              { value: "all", label: "All statuses" },
              { value: "Scheduled", label: "Scheduled" },
              { value: "Collected", label: "Collected" },
              { value: "Missed", label: "Missed" },
              { value: "Cancelled", label: "Cancelled" },
            ]}
            value={status}
            onValueChange={onStatusChange}
            placeholder="Status"
            triggerClassName="h-10 w-[calc(50vw-1.25rem)] min-w-[140px] sm:w-[150px]"
          />

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
            <SearchSelect
              options={[
                { value: "all", label: "All categories" },
                ...categories.map((category) => ({
                  value: String(category.id),
                  label: category.name,
                  color: category.color_code,
                })),
              ]}
              value={categoryId}
              onValueChange={onCategoryChange}
              placeholder="Category"
              triggerClassName="h-10 w-full sm:w-[190px]"
            />

            <SearchSelect
              options={[
                { value: "all", label: "All locations" },
                ...locations.map((location) => ({
                  value: String(location.id),
                  label: location.name,
                })),
              ]}
              value={locationId}
              onValueChange={onLocationChange}
              placeholder="Location"
              triggerClassName="h-10 w-full sm:w-[190px]"
            />
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
