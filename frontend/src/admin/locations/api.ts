import axios from "axios"
import api from "@/lib/api"
import type { ApiLocation, LocationsQuery, LocationPayload, Meta } from "./types"

export async function getLocations(query: LocationsQuery): Promise<{ data: ApiLocation[]; meta: Meta }> {
  const { data } = await api.get<{ data: ApiLocation[]; meta: Meta }>("/locations", {
    params: {
      search: query.search || undefined,
      sort: query.sort,
      direction: query.direction,
      per_page: query.perPage,
      page: query.page,
    },
  })

  return data
}

export async function createLocation(payload: LocationPayload): Promise<ApiLocation> {
  const { data } = await api.post<{ location: ApiLocation }>("/locations", payload)
  return data.location
}

export async function updateLocation(id: number, payload: LocationPayload): Promise<ApiLocation> {
  const { data } = await api.patch<{ location: ApiLocation }>(`/locations/${id}`, payload)
  return data.location
}

export async function updateLocationStatus(id: number, isActive: boolean): Promise<{ message: string; location: ApiLocation }> {
  const { data } = await api.patch<{ message: string; location: ApiLocation }>(`/locations/${id}/status`, {
    is_active: isActive,
  })
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
