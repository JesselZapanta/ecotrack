import type { ApiWasteRecord } from "./api"

export type { ApiWasteRecord }

export type SortColumn = "id" | "date" | "quantity_kg" | "created_at"
export type SortDirection = "asc" | "desc"

export type RecordFormValues = {
  locationId: string
  categoryId: string
  date: string
  quantityKg: string
  status: string
  remarks: string
}
