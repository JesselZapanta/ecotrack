export const OFFICE_TYPES = ["Office", "Lecture Room", "Laboratory", "Facility"] as const
export type OfficeType = (typeof OFFICE_TYPES)[number]

export type ApiOffice = {
  id: number
  name: string
  floor: string | null
  type: string | null
  status: string
  contact_person: string | null
  location_id: number
  location: { id: number; name: string } | null
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

export type OfficeFormValues = {
  name: string
  contact: string
  locationId: string
}

export type LocationOption = {
  id: number
  name: string
}

export type OfficePayload = {
  name: string
  floor: string | null
  type: string | null
  status: string
  contact_person: string | null
  location_id: number
}

export type OfficesQuery = {
  search: string
  locationId: string
  type: string
  sort: SortColumn
  direction: SortDirection
  perPage: number
  page: number
}
