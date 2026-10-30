import axios from "axios"
import api from "@/lib/api"
import type { ApiOffice, LocationOption, Meta, OfficePayload, OfficesQuery } from "./types"

export async function getOffices(query: OfficesQuery): Promise<{ data: ApiOffice[]; meta: Meta }> {
  const { data } = await api.get<{ data: ApiOffice[]; meta: Meta }>("/offices", {
    params: {
      search: query.search || undefined,
      location_id: query.locationId !== "all" ? query.locationId : undefined,
      sort: query.sort,
      direction: query.direction,
      per_page: query.perPage,
      page: query.page,
    },
  })

  return data
}

export async function getLocations(): Promise<LocationOption[]> {
  const { data } = await api.get<{ data: LocationOption[] }>("/locations", {
    params: { per_page: 100, sort: "name", direction: "asc" },
  })
  return data.data
}

export async function createOffice(payload: OfficePayload): Promise<ApiOffice> {
  const { data } = await api.post<{ office: ApiOffice }>("/offices", payload)
  return data.office
}

export async function updateOffice(id: number, payload: OfficePayload): Promise<ApiOffice> {
  const { data } = await api.patch<{ office: ApiOffice }>(`/offices/${id}`, payload)
  return data.office
}

export async function updateOfficeStatus(id: number, status: "Active" | "Inactive"): Promise<{ message: string; office: ApiOffice }> {
  const { data } = await api.patch<{ message: string; office: ApiOffice }>(`/offices/${id}/status`, { status })
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
