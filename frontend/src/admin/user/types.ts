import type { Role } from "@/lib/mockData"

export type ApiUser = {
  id: number
  name: string
  full_name: string
  username: string | null
  email: string
  role: Role
  office_id: number | null
  office: { id: number; name: string; location: { id: number; name: string } | null } | null
  is_active: boolean
  last_login_at: string | null
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

export type OfficeOption = {
  id: number
  name: string
}

export type SortColumn = "id" | "name" | "email" | "role" | "created_at"
export type SortDirection = "asc" | "desc"

export type UserFormValues = {
  name: string
  username: string
  email: string
  role: Role
  officeId: string
}

export type UserPayload = {
  name: string
  username: string | null
  email: string
  role: Role
  office_id: number | null
}

export type UsersQuery = {
  search: string
  role: string
  status: string
  officeId: string
  sort: SortColumn
  direction: SortDirection
  perPage: number
  page: number
}
