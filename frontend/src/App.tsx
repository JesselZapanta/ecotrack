import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"
import { Check, TriangleAlert, Trash2, Search, Plus } from "lucide-react"

export default function App() {
  return (
    <div className="min-h-screen bg-concrete text-ink">
      <header className="sticky top-0 z-10 border-b border-galvanized-soft bg-slab">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-[8px] bg-bay text-white font-bold text-sm" style={{ fontFamily: "var(--font-head)" }}>
              ET
            </div>
            <div>
              <p className="text-[16px] font-bold leading-none" style={{ fontFamily: "var(--font-head)", fontStretch: "110%" }}>
                EcoTrack TCGC
              </p>
              <p className="text-xs text-steel">Waste Management and Monitoring</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <Button variant="outline" size="sm" className="border-bay text-bay hover:bg-bay-wash">
              View reports
            </Button>
            <Button size="sm" className="bg-bay hover:bg-bay-deep text-white">
              Add record
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8">
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-[32px] leading-[38px]" style={{ fontFamily: "var(--font-head)", fontStretch: "110%", fontWeight: 700 }}>
            Dashboard
          </h1>
          <p className="text-sm text-steel">Today · Oct 25, 2026 · 7 of 12 collected</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-slab border border-galvanized-soft">
            <TabsTrigger value="overview" className="data-[state=active]:bg-bay data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              <Card className="lg:col-span-4 bg-slab border-galvanized-soft rounded-[2px] shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-[20px]" style={{ fontFamily: "var(--font-head)" }}>
                    Day Gauge
                  </CardTitle>
                  <p className="text-xs text-steel">The one memorable element — DESIGN.md §6.1</p>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <div className="relative flex h-[140px] w-[88px] shrink-0 flex-col overflow-hidden rounded-[10px] border border-galvanized-soft bg-slab">
                      <div className="h-[14px] w-full bg-bay" />
                      <div className="relative flex-1">
                        <div className="absolute bottom-0 w-full bg-bay transition-all" style={{ height: "58%" }} aria-hidden />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="num text-[22px] font-bold text-white mix-blend-difference">58%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center">
                      <p className="num text-[44px] font-bold leading-none" style={{ fontFamily: "var(--font-head)", fontStretch: "112%" }}>
                        7<span className="text-steel text-[24px]"> / 12</span>
                      </p>
                      <p className="text-sm text-steel">collected</p>
                      <p className="mt-2 text-xs leading-4">
                        <span className="text-ink font-medium">3 scheduled</span>
                        <span className="text-steel"> · 1 in progress · </span>
                        <span className="inline-flex items-center gap-1 text-alarm font-medium">
                          <TriangleAlert className="size-3" /> 1 overdue
                        </span>
                      </p>
                      <Button
                        size="sm"
                        className="mt-3 h-8 bg-bay hover:bg-bay-deep text-white rounded-[8px]"
                        onClick={() => toast.success("Marked as collected.")}
                      >
                        Mark as collected
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-8 bg-slab border-galvanized-soft rounded-[2px] shadow-none">
                <CardHeader>
                  <CardTitle className="text-[20px]" style={{ fontFamily: "var(--font-head)" }}>
                    Waste this month
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "Biodegradable", kg: 412, color: "var(--lid-green)", width: "68%" },
                    { label: "Recyclable", kg: 138, color: "var(--lid-yellow)", width: "28%" },
                    { label: "Residual", kg: 260, color: "var(--lid-black)", width: "42%" },
                    { label: "Hazardous", kg: 9, color: "var(--lid-orange)", width: "6%" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center gap-3">
                      <span className="flex items-center gap-2 text-sm min-w-[132px]">
                        <span className="size-3 rounded-[1px] border border-ink/20" style={{ background: row.color }} aria-hidden />
                        {row.label}
                      </span>
                      <div className="h-2 flex-1 rounded-full bg-concrete overflow-hidden">
                        <div className="h-full" style={{ width: row.width, background: row.color }} />
                      </div>
                      <span className="num text-sm tabular-nums min-w-[64px] text-right">{row.kg} kg</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div>
              <h2 className="mb-3 text-[20px] font-semibold" style={{ fontFamily: "var(--font-head)" }}>
                Needs attention
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { loc: "Canteen, ground floor", time: "Oct 24, 7:00 am", status: "Overdue", category: "Biodegradable", color: "var(--lid-green)" },
                  { loc: "Library, 2nd floor", time: "Oct 23, 7:00 am", status: "Missed", category: "Residual", color: "var(--lid-black)" },
                  { loc: "Main Building, lobby", time: "Today, 7:00 to 9:00 am", status: "Scheduled", category: "Recyclable", color: "var(--lid-yellow)" },
                ].map((c) => (
                  <div key={c.loc} className="lid-card p-4" style={{ borderTopColor: c.color as string }}>
                    <p className="text-sm font-medium">{c.loc}</p>
                    <p className="text-xs text-steel">{c.time}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="status-tag inline-flex items-center gap-1 rounded-none border px-2 py-1 text-[12px] font-bold leading-none"
                        style={{
                          background: c.status === "Overdue" ? "var(--alarm)" : c.status === "Missed" ? "white" : "var(--bay-wash)",
                          color: c.status === "Overdue" ? "white" : c.status === "Missed" ? "var(--alarm)" : "var(--bay-deep)",
                          borderColor: c.status === "Missed" ? "var(--alarm)" : c.status === "Overdue" ? "var(--alarm)" : "var(--bay-wash)",
                        }}
                      >
                        {c.status === "Overdue" ? <TriangleAlert className="size-3" /> : c.status === "Missed" ? <span className="size-2 bg-alarm" /> : <span className="size-2 rounded-full bg-bay" />}
                        {c.status}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs">
                        <span className="size-3 rounded-[1px] border border-ink/20" style={{ background: c.color }} /> {c.category}
                      </span>
                    </div>
                    <Button size="sm" className="mt-3 w-full bg-bay hover:bg-bay-deep text-white rounded-[8px] min-h-11">
                      {c.status === "Scheduled" ? "Start collection" : "Open"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Card className="bg-slab border-galvanized-soft rounded-[2px] shadow-none overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between gap-4 bg-concrete border-b border-galvanized">
                <CardTitle className="text-base" style={{ fontFamily: "var(--font-head)" }}>
                  Recent waste records
                </CardTitle>
                <div className="relative w-full max-w-[220px]">
                  <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-steel" />
                  <Input placeholder="Search records" className="h-9 pl-8 bg-slab border-galvanized rounded-[8px]" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-concrete hover:bg-concrete border-galvanized">
                        <TableHead className="text-ink font-semibold" style={{ fontFamily: "var(--font-head)" }}>Location</TableHead>
                        <TableHead className="text-ink font-semibold" style={{ fontFamily: "var(--font-head)" }}>Category</TableHead>
                        <TableHead className="text-right text-ink font-semibold" style={{ fontFamily: "var(--font-head)" }}>Quantity</TableHead>
                        <TableHead className="text-ink font-semibold" style={{ fontFamily: "var(--font-head)" }}>Status</TableHead>
                        <TableHead className="text-right text-ink font-semibold" style={{ fontFamily: "var(--font-head)" }}>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[
                        { loc: "Canteen", cat: "Biodegradable", kg: 12.5, status: "Collected", date: "Oct 24, 2026" },
                        { loc: "Library", cat: "Recyclable", kg: 6.2, status: "Pending", date: "Oct 24, 2026" },
                        { loc: "Admin Building", cat: "Residual", kg: 8.0, status: "Scheduled", date: "Oct 25, 2026" },
                        { loc: "Science Lab", cat: "Hazardous", kg: 1.4, status: "Missed", date: "Oct 23, 2026" },
                      ].map((r) => (
                        <TableRow key={r.loc} className="h-12 border-galvanized-soft data-[selected=true]:bg-bay-wash data-[selected=true]:border-l-[3px] data-[selected=true]:border-l-bay hover:bg-bay-wash/50">
                          <TableCell className="font-medium">{r.loc}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-1.5">
                              <span
                                className="size-3 rounded-[1px] border border-ink/20"
                                style={{
                                  background:
                                    r.cat === "Biodegradable" ? "var(--lid-green)"
                                    : r.cat === "Recyclable" ? "var(--lid-yellow)"
                                    : r.cat === "Residual" ? "var(--lid-black)"
                                    : "var(--lid-orange)",
                                }}
                              />
                              {r.cat}
                            </span>
                          </TableCell>
                          <TableCell className="num text-right tabular-nums">{r.kg} kg</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="status-tag rounded-none font-bold text-[12px] border"
                              style={{
                                background: r.status === "Collected" ? "color-mix(in srgb, var(--ok) 12%, var(--slab))" : r.status === "Missed" ? "white" : r.status === "Pending" ? "transparent" : "var(--bay-wash)",
                                color: r.status === "Collected" ? "var(--ok)" : r.status === "Missed" ? "var(--alarm)" : r.status === "Pending" ? "var(--steel)" : "var(--bay-deep)",
                                borderColor: r.status === "Collected" ? "var(--ok)" : r.status === "Missed" ? "var(--alarm)" : r.status === "Pending" ? "var(--galvanized)" : "var(--bay-wash)",
                              }}
                            >
                              {r.status === "Collected" && <Check className="mr-1 size-3" />}
                              {r.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right text-steel text-sm">{r.date}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <p className="px-4 py-2 text-xs text-steel border-t border-galvanized-soft">Mobile: table scrolls horizontally; cards used on phones — DESIGN.md §7.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="components" className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Card className="bg-slab border-galvanized-soft rounded-[2px] shadow-none">
                <CardHeader>
                  <CardTitle className="text-base" style={{ fontFamily: "var(--font-head)" }}>Buttons</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Button className="bg-bay hover:bg-bay-deep text-white rounded-[8px] min-h-11" onClick={() => toast("Record saved.")}>
                    <Plus className="size-4" /> Save record
                  </Button>
                  <Button variant="outline" className="border-bay text-bay hover:bg-bay-wash rounded-[8px] min-h-11">
                    View reports
                  </Button>
                  <Button variant="destructive" className="bg-alarm hover:bg-alarm/90 rounded-[8px] min-h-11" onClick={() => toast.error("Delete this record? It will be removed from reports.")}>
                    <Trash2 className="size-4" /> Delete
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slab border-galvanized-soft rounded-[2px] shadow-none">
                <CardHeader>
                  <CardTitle className="text-base" style={{ fontFamily: "var(--font-head)" }}>Form field</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="qty" className="text-[14px] font-bold">Quantity (kg)</Label>
                    <div className="relative">
                      <Input id="qty" type="number" placeholder="Enter a quantity greater than 0" className="h-11 pr-10 bg-slab border-galvanized rounded-[8px] focus-visible:ring-bay" />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-steel pointer-events-none">kg</span>
                    </div>
                    <p className="text-xs text-steel">Hint text below the field.</p>
                  </div>
                  <Button className="w-full bg-bay hover:bg-bay-deep text-white rounded-[8px] min-h-11">Save record</Button>
                </CardContent>
              </Card>
            </div>
            <p className="text-xs text-steel">
              Tokens from <code className="rounded bg-concrete px-1 py-0.5">DESIGN.md §12</code> — lid colors only for categories, 1px lines, flat surfaces, sentence case, tabular numerals.
            </p>
          </TabsContent>
        </Tabs>

        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-t border-galvanized-soft pt-4">
          <p className="text-xs text-steel">Palettes: concrete background, slab surfaces, bay for actions, ink/steel for text. Focus ring: 3px bay.</p>
          <p className="text-xs text-steel">Typography: Archivo (headings) + Atkinson Hyperlegible (body) · <span className="num tabular-nums">412 kg</span> example</p>
        </div>
      </main>

      <Toaster richColors position="bottom-left" />
    </div>
  )
}
