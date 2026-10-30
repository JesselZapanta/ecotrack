import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/ecotrack/PageHeader"
import { StatTile } from "@/components/ecotrack/StatTile"
import { CategoryChip } from "@/components/ecotrack/CategoryChip"
import { BrandLockup } from "@/components/brand/Logo"
import { wasteRecords, wasteCategories, locations, locById } from "@/lib/mockData"
import { useAuth } from "@/lib/store"
import { toast } from "sonner"
import { Download, Printer } from "lucide-react"

export default function Reports() {
  const { userName } = useAuth()
  const [category, setCategory] = useState("all")
  const [location, setLocation] = useState("all")

  const filtered = wasteRecords.filter(
    (record) =>
      (category === "all" || record.categoryId === category) &&
      (location === "all" || record.locationId === location)
  )
  const totalKg = filtered.reduce((sum, record) => sum + record.quantityKg, 0)

  return (
    <div className="space-y-5">
      <div className="hidden print:mb-6 print:block">
        <BrandLockup className="h-12" />
        <p className="mt-2 text-[11px] text-muted-ink">
          Waste summary · {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · {userName}
        </p>
      </div>

      <PageHeader
        eyebrow="Insights"
        title="Reports"
        subtitle="Filter, print or export. Every report records who generated it and which filters were used."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => { window.print(); toast("Printing report…") }}>
              <Printer className="size-4" /> Print
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.success("CSV export started.")}>
              <Download className="size-4" /> CSV
            </Button>
            <Button size="sm" onClick={() => toast.success("PDF export started.")}>
              <Download className="size-4" /> PDF
            </Button>
          </>
        }
      />

      <Card className="no-print">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {wasteCategories.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-1.5">
            <Label>Location</Label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All locations</SelectItem>
                {locations.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-[8px] border border-line bg-surface-2 px-3 py-2.5 text-[11.5px] text-muted-ink">
            <span className="num font-medium text-ink">{filtered.length}</span> records match
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile label="Records" value={filtered.length} hint="Matching filters" />
        <StatTile label="Total waste" value={totalKg.toFixed(1)} unit="kg" spark={[12, 18, 14, 22, 20, 28, 24]} />
        <StatTile
          label="Average / record"
          value={filtered.length ? (totalKg / filtered.length).toFixed(1) : "0"}
          unit="kg"
          spark={[8, 7, 9, 8, 10, 9, 11]}
          accent="var(--lid-orange)"
        />
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-line py-4">
          <CardTitle>Waste summary</CardTitle>
          <span className="text-[11px] text-muted-ink">Printed with category names</span>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="pr-5">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="num pl-5 text-[11.5px] text-muted-ink">{record.date}</TableCell>
                  <TableCell className="text-[12.5px] font-medium">{locById(record.locationId).name}</TableCell>
                  <TableCell>
                    <CategoryChip categoryId={record.categoryId} />
                  </TableCell>
                  <TableCell className="num text-right text-[12px]">{record.quantityKg} kg</TableCell>
                  <TableCell className="pr-5 text-[11.5px] text-muted-ink">{record.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Collection report</CardTitle>
          <p className="text-[12px] text-muted-ink">Scheduled vs collected vs missed · flagged for follow-up</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Scheduled", value: 5, className: "bg-info" },
              { label: "Collected", value: 7, className: "bg-ok" },
              { label: "Missed", value: 1, className: "bg-alarm" },
              { label: "Cancelled", value: 1, className: "bg-muted-ink/40" },
            ].map((item) => (
              <div key={item.label} className="rounded-[9px] border border-line p-3">
                <span className={`block h-[3px] w-7 rounded-full ${item.className}`} />
                <p className="display mt-2 text-[26px] leading-none">{item.value}</p>
                <p className="mt-1 text-[11px] text-muted-ink">{item.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
