export type ApiAuditLog = {
  id: number
  action: string
  entity_type: string
  entity_id: number | null
  description: string
  meta: Record<string, unknown> | null
  user: { id: number; name: string } | null
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

export type SortColumn = "id" | "action" | "created_at"
export type SortDirection = "asc" | "desc"

export type AuditQuery = {
  search: string
  action: string
  sort: SortColumn
  direction: SortDirection
  perPage: number
  page: number
}
