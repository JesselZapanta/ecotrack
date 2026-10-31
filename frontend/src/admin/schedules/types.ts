export type ScheduleStatus =
  | "Scheduled"
  | "Collected"
  | "Missed"
  | "Cancelled"

export type ApiScheduleCategory = {
  id: number
  name: string
  color_code: string
}

export type ApiScheduleLocation = {
  id: number
  name: string
  building: string
}

export type ApiScheduleAssignee = {
  id: number
  name: string
}

export type ApiStatusHistory = {
  id: number
  old_status: string | null
  new_status: string
  remark: string | null
  changed_by: ApiScheduleAssignee | null
  created_at: string | null
}

export type ApiSchedule = {
  id: number
  scheduled_date: string
  window_start: string
  window_end: string
  recurrence_rule: "once" | "daily" | "weekly" | null
  status: ScheduleStatus
  notes: string | null
  assigned_to: number | null
  assignee: ApiScheduleAssignee | null
  locations: ApiScheduleLocation[]
  categories: ApiScheduleCategory[]
  history?: ApiStatusHistory[]
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

export type SortColumn = "id" | "scheduled_date" | "created_at" | "status"
export type SortDirection = "asc" | "desc"

export type SchedulePayload = {
  scheduled_date: string
  window_start: string
  window_end: string
  recurrence_rule: "once" | "daily" | "weekly" | null
  assigned_to: number | null
  location_ids: number[]
  category_ids: number[]
  notes: string | null
}

export type SchedulesQuery = {
  search: string
  status: string
  categoryId: string
  locationId: string
  date: string
  dateFrom?: string
  dateTo?: string
  sort: SortColumn
  direction: SortDirection
  perPage: number
  page: number
}

export type ScheduleFormValues = {
  date: string
  windowStart: string
  windowEnd: string
  recurrence: "once" | "daily" | "weekly"
  assigneeId: string
  locationIds: number[]
  categoryIds: number[]
  notes: string
}

export type FilterOption = {
  id: number
  name: string
  color_code?: string
}
