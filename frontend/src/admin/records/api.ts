import api from "@/lib/api"
import axios from "axios"

export type ApiWasteRecord = {
  id: number
  location_id: number
  location: { id: number; name: string; building: string } | null
  category_id: number
  category: { id: number; name: string; color_code: string } | null
  schedule_id: number | null
  date: string
  quantity_kg: number
  remarks: string | null
  created_by: number | null
  creator: { id: number; name: string } | null
  created_at: string | null
}

export type WasteRecordPayload = {
  location_id: number
  category_id: number
  schedule_id?: number | null
  date: string
  quantity_kg: number
  remarks?: string | null
}

export type WasteRecordsQuery = {
  search: string
  status: string
  categoryId: string
  locationId: string
  sort: "id" | "date" | "quantity_kg" | "created_at"
  direction: "asc" | "desc"
  perPage: number
  page: number
}

export type Meta = {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
}

export async function getWasteRecords(
  query: WasteRecordsQuery
): Promise<{ data: ApiWasteRecord[]; meta: Meta }> {
  const { data } = await api.get<{ data: ApiWasteRecord[]; meta: Meta }>("/waste-records", {
    params: {
      search: query.search || undefined,
      status: query.status !== "all" ? query.status : undefined,
      category_id: query.categoryId !== "all" ? query.categoryId : undefined,
      location_id: query.locationId !== "all" ? query.locationId : undefined,
      sort: query.sort,
      direction: query.direction,
      per_page: query.perPage,
      page: query.page,
    },
  })
  return data
}

export async function createWasteRecord(payload: WasteRecordPayload): Promise<ApiWasteRecord> {
  const { data } = await api.post<{ record: ApiWasteRecord }>("/waste-records", payload)
  return data.record
}

export async function updateWasteRecord(
  id: number,
  payload: Partial<WasteRecordPayload>
): Promise<ApiWasteRecord> {
  const { data } = await api.patch<{ record: ApiWasteRecord }>(`/waste-records/${id}`, payload)
  return data.record
}

export async function deleteWasteRecord(id: number): Promise<string> {
  const { data } = await api.delete<{ message: string }>(`/waste-records/${id}`)
  return data.message
}

export async function getLocationOptions(): Promise<{ id: number; name: string }[]> {
  const { data } = await api.get<{ data: { id: number; name: string }[] }>("/locations", {
    params: { per_page: 100, sort: "name", direction: "asc" },
  })
  return data.data
}

export async function getCategoryOptions(): Promise<{ id: number; name: string; color_code: string }[]> {
  const { data } = await api.get<{ data: { id: number; name: string; color_code: string }[] }>("/categories", {
    params: { per_page: 100, sort: "name", direction: "asc" },
  })
  return data.data
}

export function apiMessage(error: unknown): string {
  return wasteRecordMessage(error)
}

export function wasteRecordMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined
    const first = data?.errors ? Object.values(data.errors).flat()[0] : undefined
    return first ?? data?.message ?? "Something went wrong. Try again."
  }
  return "Something went wrong. Try again."
}
