export type Role = "admin" | "maintenance" | "office"

export type WasteCategory = {
  id: string
  name: string
  slug: "biodegradable" | "recyclable" | "non-biodegradable"
  color: string
  grad: string
  var: string
}

export const wasteCategories: WasteCategory[] = [
  { id: "c1", name: "Biodegradable", slug: "biodegradable", color: "#2E7D4F", grad: "linear-gradient(135deg,#2E7D4F 0%,#3FA76A 100%)", var: "var(--lid-green)" },
  { id: "c2", name: "Recyclable", slug: "recyclable", color: "#E3A908", grad: "linear-gradient(135deg,#E3A908 0%,#F4C84A 100%)", var: "var(--lid-yellow)" },
  { id: "c3", name: "Non-biodegradable", slug: "non-biodegradable", color: "#2A2D2B", grad: "linear-gradient(135deg,#2A2D2B 0%,#4A4F4D 100%)", var: "var(--lid-black)" },
]

export const offices = [
  { id: "o1", name: "College of Education", contact: "Dean Santos" },
  { id: "o2", name: "College of Business", contact: "Dean Reyes" },
  { id: "o3", name: "Administration", contact: "Ms. Cruz" },
  { id: "o4", name: "Student Affairs", contact: "Mr. Dela Cruz" },
]

export const locations = [
  { id: "l1", name: "Main Building", building: "Main Building", area: "Ground floor, lobby", officeId: "o3" },
  { id: "l2", name: "Canteen", building: "Canteen", area: "Ground floor", officeId: "o3" },
  { id: "l3", name: "Library", building: "Library", area: "2nd floor", officeId: "o1" },
  { id: "l4", name: "Science Lab", building: "Science Building", area: "1st floor", officeId: "o1" },
  { id: "l5", name: "Covered Court", building: "Covered Court", area: "Open area", officeId: "o4" },
  { id: "l6", name: "Admin Building", building: "Admin Building", area: "2nd floor", officeId: "o3" },
]

export type WasteRecord = {
  id: string
  locationId: string
  categoryId: string
  date: string
  quantityKg: number
  status: "Pending" | "Scheduled" | "Collected" | "Cancelled"
  remarks?: string
  createdBy: string
}

export const wasteRecords: WasteRecord[] = [
  { id: "w1", locationId: "l2", categoryId: "c1", date: "2026-10-24", quantityKg: 12.5, status: "Collected", remarks: "Morning collection", createdBy: "Admin" },
  { id: "w2", locationId: "l3", categoryId: "c2", date: "2026-10-24", quantityKg: 6.2, status: "Pending", createdBy: "Admin" },
  { id: "w3", locationId: "l6", categoryId: "c3", date: "2026-10-25", quantityKg: 8.0, status: "Scheduled", createdBy: "Admin" },
  { id: "w4", locationId: "l4", categoryId: "c3", date: "2026-10-23", quantityKg: 1.4, status: "Collected", createdBy: "Admin" },
  { id: "w5", locationId: "l1", categoryId: "c1", date: "2026-10-25", quantityKg: 9.3, status: "Pending", createdBy: "Admin" },
  { id: "w6", locationId: "l5", categoryId: "c2", date: "2026-10-22", quantityKg: 15.1, status: "Collected", createdBy: "Admin" },
  { id: "w7", locationId: "l2", categoryId: "c3", date: "2026-10-25", quantityKg: 4.2, status: "Scheduled", createdBy: "Admin" },
  { id: "w8", locationId: "l3", categoryId: "c1", date: "2026-10-20", quantityKg: 7.8, status: "Cancelled", createdBy: "Admin" },
]

export type ScheduleStatus = "Scheduled" | "Collected" | "Missed" | "Cancelled"

export type CollectionSchedule = {
  id: string
  date: string
  windowStart: string
  windowEnd: string
  locationIds: string[]
  assignedTo: string
  status: ScheduleStatus
  notes?: string
  categoryIds: string[]
}

export const schedules: CollectionSchedule[] = [
  { id: "s1", date: "2026-10-25", windowStart: "07:00", windowEnd: "09:00", locationIds: ["l1"], assignedTo: "Mang Ben", status: "Scheduled", notes: "Main lobby", categoryIds: ["c2"] },
  { id: "s2", date: "2026-10-25", windowStart: "07:00", windowEnd: "09:00", locationIds: ["l2"], assignedTo: "Mang Ben", status: "Scheduled", categoryIds: ["c1"] },
  { id: "s3", date: "2026-10-25", windowStart: "09:30", windowEnd: "11:00", locationIds: ["l3"], assignedTo: "Mang Ben", status: "Collected", categoryIds: ["c2"] },
  { id: "s4", date: "2026-10-24", windowStart: "07:00", windowEnd: "09:00", locationIds: ["l2"], assignedTo: "Mang Ben", status: "Missed", categoryIds: ["c1"] },
  { id: "s5", date: "2026-10-23", windowStart: "07:00", windowEnd: "09:00", locationIds: ["l3"], assignedTo: "Ate Cora", status: "Missed", notes: "Rain, rescheduled", categoryIds: ["c3"] },
  { id: "s6", date: "2026-10-26", windowStart: "07:00", windowEnd: "09:00", locationIds: ["l5"], assignedTo: "Mang Ben", status: "Scheduled", categoryIds: ["c1", "c2"] },
  { id: "s7", date: "2026-10-24", windowStart: "13:00", windowEnd: "15:00", locationIds: ["l4"], assignedTo: "Ate Cora", status: "Collected", categoryIds: ["c3"] },
  { id: "s8", date: "2026-10-26", windowStart: "14:00", windowEnd: "15:30", locationIds: ["l6"], assignedTo: "Ate Cora", status: "Scheduled", categoryIds: ["c3"] },
]

export type ConcernStatus = "Open" | "Acknowledged" | "Resolved"
export type Concern = {
  id: string
  locationId: string
  description: string
  status: ConcernStatus
  reportedBy: string
  date: string
  photo?: string
}

export const concerns: Concern[] = [
  { id: "k1", locationId: "l2", description: "Overflowing bin near canteen entrance, not collected yesterday.", status: "Open", reportedBy: "Office - Business", date: "2026-10-25" },
  { id: "k2", locationId: "l5", description: "Improper disposal — mixed waste in residual bin.", status: "Acknowledged", reportedBy: "Mang Ben", date: "2026-10-24" },
  { id: "k3", locationId: "l3", description: "Missed pickup, library 2nd floor.", status: "Resolved", reportedBy: "Office - Education", date: "2026-10-23" },
]

export const users = [
  { id: "u1", name: "Admin TCGC", email: "admin@tcgc.edu.ph", role: "admin" as Role, officeId: "o3", active: true },
  { id: "u2", name: "Mang Ben", email: "ben@tcgc.edu.ph", role: "maintenance" as Role, officeId: null, active: true },
  { id: "u3", name: "Ate Cora", email: "cora@tcgc.edu.ph", role: "maintenance" as Role, officeId: null, active: true },
  { id: "u4", name: "Office - Education", email: "educ@tcgc.edu.ph", role: "office" as Role, officeId: "o1", active: true },
  { id: "u5", name: "Office - Business", email: "business@tcgc.edu.ph", role: "office" as Role, officeId: "o2", active: true },
]

export const auditLog = [
  { id: "a1", user: "Admin TCGC", action: "Created", entity: "Waste record", entityId: "w1", detail: "Canteen · 12.5 kg · Biodegradable", at: "2026-10-24 08:12" },
  { id: "a2", user: "Mang Ben", action: "Status → Collected", entity: "Schedule", entityId: "s2", detail: "Canteen 07:00-09:00", at: "2026-10-25 07:05" },
  { id: "a3", user: "Admin TCGC", action: "Updated", entity: "Schedule", entityId: "s5", detail: "Marked as Missed — Rain", at: "2026-10-23 09:30" },
  { id: "a4", user: "Office - Business", action: "Reported", entity: "Concern", entityId: "k1", detail: "Overflowing bin — Canteen", at: "2026-10-25 09:45" },
]

export function catById(id: string) { return wasteCategories.find(c => c.id === id)! }
export function locById(id: string) { return locations.find(l => l.id === id)! }
export function officeById(id: string | null) { return offices.find(o => o.id === id) }
