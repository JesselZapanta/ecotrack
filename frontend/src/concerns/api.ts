import axios from "axios"
import api from "@/lib/api"

export type ConcernStatus = "Open" | "Acknowledged" | "Resolved"

export type ApiConcern = {
  id: number
  description: string
  status: ConcernStatus
  photo_path: string | null
  photo_url: string | null
  resolution_note: string | null
  resolved_at: string | null
  resolved_by: { id: number; name: string } | null
  created_at: string | null
  location: {
    id: number
    name: string
    building: string | null
    floor_or_area: string | null
  } | null
  office: { id: number; name: string } | null
  reporter: { id: number; name: string; role: string } | null
}

export type LocationOption = {
  id: number
  name: string
  building: string | null
  floor_or_area: string | null
}

export type Meta = {
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
}

export type ConcernsQuery = {
  search: string
  status: string
  page: number
  perPage: number
}

export async function getConcerns(query: ConcernsQuery): Promise<{ data: ApiConcern[]; meta: Meta }> {
  const { data } = await api.get<{ data: ApiConcern[]; meta: Meta }>("/concerns", {
    params: {
      search: query.search || undefined,
      status: query.status !== "all" ? query.status : undefined,
      per_page: query.perPage,
      page: query.page,
    },
  })
  return data
}

export async function getConcernLocations(): Promise<LocationOption[]> {
  const { data } = await api.get<{ data: LocationOption[] }>("/concerns/locations")
  return data.data
}

export async function createConcern(payload: {
  locationId?: number
  description: string
  photo?: File | null
}): Promise<ApiConcern> {
  const form = new FormData()
  form.append("description", payload.description)
  if (payload.locationId) form.append("location_id", String(payload.locationId))
  if (payload.photo) form.append("photo", payload.photo)

  const { data } = await api.post<{ concern: ApiConcern }>("/concerns", form)
  return data.concern
}

export async function updateConcernStatus(
  id: number,
  status: ConcernStatus,
  resolutionNote?: string
): Promise<ApiConcern> {
  const { data } = await api.patch<{ concern: ApiConcern }>(`/concerns/${id}/status`, {
    status,
    resolution_note: resolutionNote,
  })
  return data.concern
}

export function concernMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined
    const first = data?.errors ? Object.values(data.errors).flat()[0] : undefined
    return first ?? data?.message ?? "Something went wrong. Try again."
  }
  return "Something went wrong. Try again."
}

const apiBase = (import.meta.env.VITE_API_URL as string | undefined) ?? "/api"

export function mediaUrl(path: string | null): string | null {
  if (!path) return null

  const origin = apiBase.replace(/\/api\/?$/, "")

  if (/^https?:\/\//i.test(path)) {
    try {
      const url = new URL(path)
      if (origin && url.pathname.startsWith("/storage/")) {
        return `${origin}${url.pathname}`
      }
    } catch {
      return path
    }
    return path
  }

  return `${origin}${path.startsWith("/") ? "" : "/"}${path}`
}
