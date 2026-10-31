import axios from "axios"
import api from "@/lib/api"

export type ReportFilters = {
  dateFrom: string
  dateTo: string
  locationId: string
  categoryId: string
}

export type CategoryBreakdown = {
  id: number
  name: string
  color_code: string
  kg: number
  records: number
  share: number
}

export type LocationBreakdown = {
  id: number
  name: string
  building: string | null
  kg: number
  records: number
}

export type CollectionStatus = "Scheduled" | "Collected" | "Missed" | "Cancelled"

export type Report = {
  scope: string
  filters: {
    date_from: string
    date_to: string
    location: { id: number; name: string } | null
    category: { id: number; name: string } | null
  }
  summary: {
    total_kg: number
    records: number
    average_kg: number
    by_category: CategoryBreakdown[]
    by_location: LocationBreakdown[]
  }
  collections: {
    total: number
    counts: Record<CollectionStatus, number>
  }
  generated_by: { name: string; role: string }
  generated_at: string
}

function params(filters: ReportFilters) {
  return {
    date_from: filters.dateFrom,
    date_to: filters.dateTo,
    location_id: filters.locationId !== "all" ? filters.locationId : undefined,
    category_id: filters.categoryId !== "all" ? filters.categoryId : undefined,
  }
}

export type ReportOptions = {
  locations: { id: number; name: string }[]
  categories: { id: number; name: string; color_code: string }[]
}

export async function getReportOptions(): Promise<ReportOptions> {
  const { data } = await api.get<ReportOptions>("/reports/options")
  return data
}

export async function getReport(filters: ReportFilters): Promise<Report> {
  const { data } = await api.get<{ report: Report }>("/reports/waste-summary", {
    params: params(filters),
  })
  return data.report
}

export async function downloadReportPdf(filters: ReportFilters): Promise<Blob> {
  const { data } = await api.get<Blob>("/reports/waste-summary/pdf", {
    params: params(filters),
    responseType: "blob",
  })
  return data
}

export function reportMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined
    const first = data?.errors ? Object.values(data.errors).flat()[0] : undefined
    return first ?? data?.message ?? "Could not load the report. Try again."
  }
  return "Could not load the report. Try again."
}
