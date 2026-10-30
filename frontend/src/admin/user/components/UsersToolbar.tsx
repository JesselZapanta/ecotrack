import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

      <div className="grid grid-cols-3 gap-2 lg:flex">
        <Select value={role} onValueChange={onRoleChange}>
          <SelectTrigger className="w-full lg:w-[145px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="admin">Administrator</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="office">Office</SelectItem>
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="w-full lg:w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select value={office} onValueChange={onOfficeChange}>
          <SelectTrigger className="w-full lg:w-[170px]">
            <SelectValue placeholder="Office" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All offices</SelectItem>
            {offices.map((item) => (
              <SelectItem key={item.id} value={String(item.id)}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtersActive && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          Clear
        </Button>
      )}
    </div>
  )
}
