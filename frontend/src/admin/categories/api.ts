import axios from "axios"
import api from "@/lib/api"
import type { ApiCategory, CategoriesQuery, CategoryPayload, Meta } from "./types"

export async function getCategories(query: CategoriesQuery): Promise<{ data: ApiCategory[]; meta: Meta }> {
  const { data } = await api.get<{ data: ApiCategory[]; meta: Meta }>("/categories", {
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

export async function createCategory(payload: CategoryPayload): Promise<ApiCategory> {
  const { data } = await api.post<{ category: ApiCategory }>("/categories", payload)
  return data.category
}

export async function updateCategory(id: number, payload: CategoryPayload): Promise<ApiCategory> {
  const { data } = await api.patch<{ category: ApiCategory }>(`/categories/${id}`, payload)
  return data.category
}

export async function updateCategoryStatus(id: number, isActive: boolean): Promise<{ message: string; category: ApiCategory }> {
  const { data } = await api.patch<{ message: string; category: ApiCategory }>(`/categories/${id}/status`, {
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
