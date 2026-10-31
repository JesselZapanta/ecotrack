import axios from "axios"
import api from "@/lib/api"
import type { ApiSchedule, FilterOption, Meta, SchedulePayload, SchedulesQuery } from "./types"

export async function getSchedules(
  query: SchedulesQuery
): Promise<{ data: ApiSchedule[]; meta: Meta }> {
  const { data } = await api.get<{ data: ApiSchedule[]; meta: Meta }>("/schedules", {
    params: {
      search: query.search || undefined,
      status: query.status !== "all" ? query.status : undefined,
      category_id: query.categoryId !== "all" ? query.categoryId : undefined,
      location_id: query.locationId !== "all" ? query.locationId : undefined,
      date: query.date || undefined,
      date_from: query.dateFrom || undefined,
      date_to: query.dateTo || undefined,
      sort: query.sort,
      direction: query.direction,
      per_page: query.perPage,
      page: query.page,
    },
  })

  return data
}

export async function getSchedulesForRange(
  from: string,
  to: string
): Promise<ApiSchedule[]> {
  const { data } = await api.get<{ data: ApiSchedule[] }>("/schedules", {
    params: {
      date_from: from,
      date_to: to,
      per_page: 100,
      sort: "scheduled_date",
      direction: "asc",
    },
  })

  return data.data
}

export async function getSchedule(id: number): Promise<ApiSchedule> {
  const { data } = await api.get<{ schedule: ApiSchedule }>(`/schedules/${id}`)
  return data.schedule
}

export async function createSchedule(payload: SchedulePayload): Promise<ApiSchedule> {
  const { data } = await api.post<{ schedule: ApiSchedule }>("/schedules", payload)
  return data.schedule
}

export async function updateSchedule(id: number, payload: Partial<SchedulePayload>): Promise<ApiSchedule> {
  const { data } = await api.patch<{ schedule: ApiSchedule }>(`/schedules/${id}`, payload)
  return data.schedule
}

export async function deleteSchedule(id: number): Promise<string> {
  const { data } = await api.delete<{ message: string }>(`/schedules/${id}`)
  return data.message
}

export async function sweepSchedules(): Promise<{ message: string; swept: number; ids: number[] }> {
  const { data } = await api.post<{ message: string; swept: number; ids: number[] }>(
    "/schedules/sweep"
  )
  return data
}

export async function updateScheduleStatus(
  id: number,
  status: string,
  remark?: string
): Promise<{ message: string; schedule: ApiSchedule }> {
  const { data } = await api.patch<{ message: string; schedule: ApiSchedule }>(
    `/schedules/${id}/status`,
    { status, remark: remark?.trim() || null }
  )
  return data
}

export async function getMaintenanceUsers(): Promise<FilterOption[]> {
  const { data } = await api.get<{ data: { id: number; name: string }[] }>("/users", {
    params: { role: "maintenance", status: "active", per_page: 100, sort: "name", direction: "asc" },
  })
  return data.data.map((user) => ({ id: user.id, name: user.name }))
}

export async function getCategoryOptions(): Promise<FilterOption[]> {
  const { data } = await api.get<{ data: FilterOption[] }>("/categories", {
    params: { per_page: 100, sort: "name", direction: "asc" },
  })
  return data.data.map((category) => ({
    id: category.id,
    name: category.name,
    color_code: category.color_code,
  }))
}

export async function getLocationOptions(): Promise<FilterOption[]> {
  const { data } = await api.get<{ data: FilterOption[] }>("/locations", {
    params: { per_page: 100, sort: "name", direction: "asc" },
  })
  return data.data.map((location) => ({ id: location.id, name: location.name }))
}

export function apiMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; errors?: Record<string, string[]> }
      | undefined
    const firstError = data?.errors ? Object.values(data.errors).flat()[0] : undefined
    return firstError ?? data?.message ?? "Something went wrong. Try again."
  }

  return "Something went wrong. Try again."
}
