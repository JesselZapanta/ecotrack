export type ApiCategory = {
  id: number
  name: string
  color: string
  color_code: string
  description: string | null
  is_active: boolean
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

export type CategoryFormValues = {
  name: string
  color: string
  description: string
}

export type CategoryPayload = {
  name: string
  color_code: string
  description: string | null
}

export type CategoriesQuery = {
  search: string
  sort: SortColumn
  direction: SortDirection
  perPage: number
  page: number
}
