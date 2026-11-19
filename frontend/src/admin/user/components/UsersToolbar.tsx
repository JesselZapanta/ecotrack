import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { OfficeCombobox } from "@/components/OfficeCombobox"
import { SearchSelect } from "@/components/SearchSelect"
import type { OfficeOption } from "@/admin/user/types"
import { Loader2, Search } from "lucide-react"

type Props = {
  query: string
  onQueryChange: (value: string) => void
  role: string
  onRoleChange: (value: string) => void
  status: string
  onStatusChange: (value: string) => void
  office: string
  onOfficeChange: (value: string) => void
  offices: OfficeOption[]
  filtersActive: boolean
  loading: boolean
  onClear: () => void
}

export function UsersToolbar({
  query,
  onQueryChange,
  role,
  onRoleChange,
  status,
  onStatusChange,
  office,
  onOfficeChange,
  offices,
  filtersActive,
  loading,
  onClear,
}: Props) {
  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
      <div className="relative flex-1">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-ink" />
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search name, email or username"
          className="pr-9 pl-9"
        />
        {loading && (
          <Loader2 className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted-ink" />
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:flex">
        <SearchSelect
          options={[
            { value: "all", label: "All roles" },
            { value: "admin", label: "Administrator" },
            { value: "maintenance", label: "Maintenance" },
          ]}
          value={role}
          onValueChange={onRoleChange}
          placeholder="Role"
          triggerClassName="w-full sm:h-9 lg:w-[145px]"
        />

        <SearchSelect
          options={[
            { value: "all", label: "All status" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
          value={status}
          onValueChange={onStatusChange}
          placeholder="Status"
          triggerClassName="w-full sm:h-9 lg:w-[130px]"
        />

        <OfficeCombobox
          offices={offices}
          value={office}
          onChange={onOfficeChange}
          emptyValue="all"
          emptyLabel="All offices"
          triggerClassName="sm:h-9 lg:w-[200px]"
        />
      </div>

      {filtersActive && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear
        </Button>
      )}
    </div>
  )
}
