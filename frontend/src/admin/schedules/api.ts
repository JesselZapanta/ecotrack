import axios from "axios"
import api from "@/lib/api"
import { refreshNavBadges } from "@/lib/nav-badges"
import type {
  ApiSchedule,
  Meta,
  ScheduleOptions,
  SchedulePayload,
  SchedulesQuery,
} from "./types"

type SweepResult = {
  message: string
  swept: number
  ids: number[]
}

const OPTIONS_TTL = 60_000
const SWEEP_TTL = 15_000

let optionsCache: ScheduleOptions | null = null
let optionsAt = 0
let optionsInFlight: Promise<ScheduleOptions> | null = null

let sweepAt = 0
let sweepInFlight: Promise<SweepResult> | null = null

const listRequests = new Map<string, Promise<{ data: ApiSchedule[]; meta: Meta }>>()
const rangeRequests = new Map<string, Promise<ApiSchedule[]>>()

export function getScheduleOptions(force = false): Promise<ScheduleOptions> {
  if (!force && optionsCache && Date.now() - optionsAt < OPTIONS_TTL) {
    return Promise.resolve(optionsCache)
  }

  if (optionsInFlight) return optionsInFlight

  optionsInFlight = api
    .get<{ data: ScheduleOptions }>("/schedules/options")
    .then(({ data }) => {
      optionsCache = data.data
      optionsAt = Date.now()
      return data.data
    })
    .finally(() => {
      optionsInFlight = null
    })

  return optionsInFlight
}

export function getSchedules(
  query: SchedulesQuery
): Promise<{ data: ApiSchedule[]; meta: Meta }> {
  const params = {
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
  }

  const key = JSON.stringify(params)
  const existing = listRequests.get(key)
  if (existing) return existing

  const request = api
    .get<{ data: ApiSchedule[]; meta: Meta }>("/schedules", { params })
    .then(({ data }) => data)
    .finally(() => {
      listRequests.delete(key)
    })

  listRequests.set(key, request)
  return request
}

export function getSchedulesForRange(from: string, to: string): Promise<ApiSchedule[]> {
  const key = `${from}:${to}`
  const existing = rangeRequests.get(key)
  if (existing) return existing

  const request = api
    .get<{ data: ApiSchedule[] }>("/schedules", {
      params: {
        date_from: from,
        date_to: to,
        per_page: 100,
        sort: "scheduled_date",
        direction: "asc",
      },
    })
    .then(({ data }) => data.data)
    .finally(() => {
      rangeRequests.delete(key)
    })

  rangeRequests.set(key, request)
  return request
}

export async function getSchedule(id: number): Promise<ApiSchedule> {
  const { data } = await api.get<{ schedule: ApiSchedule }>(`/schedules/${id}`)
  return data.schedule
}

export async function createSchedule(payload: SchedulePayload): Promise<ApiSchedule> {
  const { data } = await api.post<{ schedule: ApiSchedule }>("/schedules", payload)
  refreshNavBadges()
  return data.schedule
}

export async function updateSchedule(
  id: number,
  payload: Partial<SchedulePayload>
): Promise<ApiSchedule> {
  const { data } = await api.patch<{ schedule: ApiSchedule }>(`/schedules/${id}`, payload)
  refreshNavBadges()
  return data.schedule
}

export async function deleteSchedule(id: number): Promise<string> {
  const { data } = await api.delete<{ message: string }>(`/schedules/${id}`)
  refreshNavBadges()
  return data.message
}

export function sweepSchedules(): Promise<SweepResult> {
  if (sweepInFlight) return sweepInFlight

  if (Date.now() - sweepAt < SWEEP_TTL) {
    return Promise.resolve({ message: "", swept: 0, ids: [] })
  }

  sweepInFlight = api
    .post<SweepResult>("/schedules/sweep")
    .then(({ data }) => {
      sweepAt = Date.now()
      if (data.swept > 0) refreshNavBadges()
      return data
    })
    .finally(() => {
      sweepInFlight = null
    })

  return sweepInFlight
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
  refreshNavBadges()
  return data
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
