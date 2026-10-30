export type ApiLocation = {
  id: number
  name: string
  building: string
  floor_or_area: string | null
  is_active: boolean
  offices: { id: number; name: string }[]
  created_at: string | null
}

export type Meta = {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
}

export type SortColumn = "id" | "name" | "created_at"
export type SortDirection = "asc" | "desc"

export type LocationFormValues = {
  name: string
  building: string
  floorOrArea: string
}

export type LocationPayload = {
  name: string
  building: string
  floor_or_area: string | null
}

export type LocationsQuery = {
  search: string
  sort: SortColumn
  direction: SortDirection
  perPage: number
  page: number
}
