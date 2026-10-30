import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Search } from "lucide-react"

type Props = {
  query: string
  onQueryChange: (value: string) => void
  loading: boolean
  filtersActive: boolean
  onClear: () => void
}

export function CategoriesToolbar({ query, onQueryChange, loading, filtersActive, onClear }: Props) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-ink" />
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search name or description"
          className="pr-9 pl-9"
        />
        {loading && (
          <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-ink" />
        )}
      </div>

      {filtersActive && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear
        </Button>
      )}
    </div>
  )
}
