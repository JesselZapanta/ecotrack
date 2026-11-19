import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchSelect } from "@/components/SearchSelect"
import { OFFICE_TYPES, type LocationOption } from "@/admin/offices/types"
import { Loader2, Search } from "lucide-react"

type Props = {
  query: string
  onQueryChange: (value: string) => void
  location: string
  onLocationChange: (value: string) => void
  type: string
  onTypeChange: (value: string) => void
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
  type,
  onTypeChange,
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

      <SearchSelect
        options={[
          { value: "all", label: "All locations" },
          ...locations.map((item) => ({ value: String(item.id), label: item.name })),
        ]}
        value={location}
        onValueChange={onLocationChange}
        placeholder="Location"
        triggerClassName="w-full sm:w-[180px]"
      />

      <SearchSelect
        options={[
          { value: "all", label: "All types" },
          ...OFFICE_TYPES.map((item) => ({ value: item, label: item })),
        ]}
        value={type}
        onValueChange={onTypeChange}
        placeholder="Type"
        triggerClassName="w-full sm:w-[160px]"
      />

      {filtersActive && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear
        </Button>
      )}
    </div>
  )
}
