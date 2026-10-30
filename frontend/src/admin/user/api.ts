import axios from "axios"
import api from "@/lib/api"
import type { ApiUser, Meta, OfficeOption, UserPayload, UsersQuery } from "./types"

export async function getUsers(query: UsersQuery): Promise<{ data: ApiUser[]; meta: Meta }> {
  const { data } = await api.get<{ data: ApiUser[]; meta: Meta }>("/users", {
    params: {
      search: query.search || undefined,
      role: query.role !== "all" ? query.role : undefined,
      status: query.status !== "all" ? query.status : undefined,
      office_id: query.officeId !== "all" ? query.officeId : undefined,
      sort: query.sort,
      direction: query.direction,
      per_page: query.perPage,
      page: query.page,
    },
  })

  return data
}

export async function getOffices(): Promise<OfficeOption[]> {
  const { data } = await api.get<{ data: OfficeOption[] }>("/offices", {
    params: { per_page: 100, sort: "name", direction: "asc" },
  })
  return data.data
}

export async function createUser(payload: UserPayload): Promise<{ user: ApiUser; temporary_password: string }> {
  const { data } = await api.post<{ user: ApiUser; temporary_password: string }>("/users", payload)
  return data
}

export async function updateUser(id: number, payload: UserPayload): Promise<ApiUser> {
  const { data } = await api.patch<{ user: ApiUser }>(`/users/${id}`, payload)
  return data.user
}

export async function setUserStatus(id: number, isActive: boolean): Promise<string> {
  const { data } = await api.patch<{ message: string }>(`/users/${id}/status`, {
    is_active: isActive,
  })
  return data.message
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
