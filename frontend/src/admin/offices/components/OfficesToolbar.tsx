import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { LocationOption } from "@/admin/offices/types"
import { Loader2, Search } from "lucide-react"

type Props = {
  query: string
  onQueryChange: (value: string) => void
  location: string
  onLocationChange: (value: string) => void
  locations: LocationOption[]
  loading: boolean
  filtersActive: boolean
  onClear: () => void
}

export function OfficesToolbar({
  query,
  onQueryChange,
  location,
  onLocationChange,
  locations,
  loading,
  filtersActive,
  onClear,
}: Props) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-ink" />
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search name or contact person"
          className="pr-9 pl-9"
        />
        {loading && (
          <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-ink" />
        )}
      </div>

      <Select value={location} onValueChange={onLocationChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Location" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All locations</SelectItem>
          {locations.map((item) => (
            <SelectItem key={item.id} value={String(item.id)}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {filtersActive && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear
        </Button>
      )}
    </div>
  )
}
