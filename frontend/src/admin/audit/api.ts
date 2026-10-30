import axios from "axios"
import api from "@/lib/api"
import type { ApiAuditLog, AuditQuery, Meta } from "./types"

export async function getAuditLogs(query: AuditQuery): Promise<{ data: ApiAuditLog[]; meta: Meta }> {
  const { data } = await api.get<{ data: ApiAuditLog[]; meta: Meta }>("/audit-logs", {
    params: {
      search: query.search || undefined,
      action: query.action !== "all" ? query.action : undefined,
      sort: query.sort,
      direction: query.direction,
      per_page: query.perPage,
      page: query.page,
    },
  })
  return data
}

export function apiMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined
    const firstError = data?.errors ? Object.values(data.errors).flat()[0] : undefined
    return firstError ?? data?.message ?? "Something went wrong. Try again."
  }
  return "Something went wrong. Try again."
}
