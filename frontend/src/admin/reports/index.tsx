import { useEffect, useState } from "react"
import { AlertCircle, Download, Loader2, MapPin } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageHeader } from "@/components/ecotrack/PageHeader"
import { StatTile } from "@/components/ecotrack/StatTile"
import { useAuth } from "@/lib/store"
import { downloadReportPdf, getReport, getReportOptions, reportMessage } from "./api"
import type { CollectionStatus, Report, ReportFilters } from "./api"

const COLLECTION_META: { key: CollectionStatus; label: string; bar: string; text: string }[] = [
  { key: "Scheduled", label: "Scheduled", bar: "bg-info", text: "text-info" },
  { key: "Collected", label: "Collected", bar: "bg-ok", text: "text-ok" },
  { key: "Missed", label: "Missed", bar: "bg-alarm", text: "text-alarm" },
  { key: "Cancelled", label: "Cancelled", bar: "bg-muted-ink/40", text: "text-muted-ink" },
]

function inputDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const now = new Date()
const DEFAULT_FILTERS: ReportFilters = {
  dateFrom: inputDate(new Date(now.getFullYear(), now.getMonth(), 1)),
  dateTo: inputDate(now),
  locationId: "all",
  categoryId: "all",
}

function formatWhen(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function Reports() {
  const { role, user } = useAuth()
  const isOffice = role === "office"

  const [locations, setLocations] = useState<{ id: number; name: string }[]>([])
  const [categories, setCategories] = useState<{ id: number; name: string; color_code: string }[]>([])
  const [draft, setDraft] = useState<ReportFilters>(DEFAULT_FILTERS)
  const [applied, setApplied] = useState<ReportFilters>(DEFAULT_FILTERS)
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    getReportOptions()
      .then((options) => {
        setLocations(options.locations)
        setCategories(options.categories)
      })
      .catch(() => {
        setLocations([])
        setCategories([])
      })
  }, [])

  useEffect(() => {
    let cancelled = false

    getReport(applied)
      .then((data) => {
        if (cancelled) return
        setReport(data)
        setError(null)
      })
      .catch((err) => {
        if (!cancelled) setError(reportMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [applied, refreshKey])

  const applyFilters = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!draft.dateFrom || !draft.dateTo) {
      setFormError("Choose a start and end date.")
      return
    }

    if (draft.dateFrom > draft.dateTo) {
      setFormError("The end date must be on or after the start date.")
      return
    }

    setFormError(null)
    setLoading(true)
    setApplied({ ...draft })
  }

  const resetFilters = () => {
    setDraft(DEFAULT_FILTERS)
    setLoading(true)
    setApplied({ ...DEFAULT_FILTERS })
    setFormError(null)
  }

  const handleDownload = async () => {
    setDownloading(true)

    try {
      const blob = await downloadReportPdf(applied)
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `ecotrack-report-${applied.dateFrom}-to-${applied.dateTo}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
      toast.success("Report downloaded.")
    } catch (err) {
      toast.error(reportMessage(err))
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Insights"
        title="Reports"
        subtitle={
          isOffice
            ? "Waste and collection data for your office location."
            : role === "maintenance"
              ? "Your assigned collections and waste logged."
              : "Filter waste and collection data, then download the result as a PDF."
        }
        actions={
          <Button onClick={handleDownload} disabled={downloading || loading || !report}>
            {downloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            Download PDF
          </Button>
        }
      />

      <Card>
        <CardContent className="p-4">
          <form onSubmit={applyFilters} className="space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-1.5">
                <Label htmlFor="date-from">From</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={draft.dateFrom}
                  onChange={(event) => setDraft({ ...draft, dateFrom: event.target.value })}
                  className="h-11 sm:h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="date-to">To</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={draft.dateTo}
                  onChange={(event) => setDraft({ ...draft, dateTo: event.target.value })}
                  className="h-11 sm:h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Location</Label>
                {isOffice ? (
                  <div className="flex h-11 items-center gap-2 rounded-[8px] border border-line bg-surface-2 px-3 text-[12.5px] text-ink sm:h-10">
                    <MapPin className="size-3.5 shrink-0 text-muted-ink" />
                    <span className="truncate">
                      {user?.office?.location?.name ?? "No location assigned"}
                    </span>
                  </div>
                ) : (
                  <Select
                    value={draft.locationId}
                    onValueChange={(value) => setDraft({ ...draft, locationId: value })}
                  >
                    <SelectTrigger className="h-11 w-full sm:h-10">
                      <SelectValue placeholder="All locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All locations</SelectItem>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={String(location.id)}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select
                  value={draft.categoryId}
                  onValueChange={(value) => setDraft({ ...draft, categoryId: value })}
                >
                  <SelectTrigger className="h-11 w-full sm:h-10">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formError && (
              <p className="flex items-center gap-1.5 text-[11.5px] text-alarm">
                <AlertCircle className="size-3.5" /> {formError}
              </p>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="min-h-11 sm:min-h-10"
                onClick={resetFilters}
              >
                Reset
              </Button>
              <Button type="submit" className="min-h-11 sm:min-h-10">
                Apply filters
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <AlertCircle className="size-5 text-alarm" />
            <p className="text-[13px] text-ink">{error}</p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setLoading(true)
                setRefreshKey((key) => key + 1)
              }}
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      ) : loading && !report ? (
        <Card>
          <CardContent className="flex items-center justify-center gap-2 py-12 text-[12.5px] text-muted-ink">
            <Loader2 className="size-4 animate-spin" /> Building report…
          </CardContent>
        </Card>
      ) : report ? (
        <>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-ink">
            <span>
              Generated {formatWhen(report.generated_at)} by {report.generated_by.name}
            </span>
            <span aria-hidden>·</span>
            <span>{report.scope}</span>
            <span aria-hidden>·</span>
            <span>
              {report.filters.date_from} → {report.filters.date_to}
            </span>
            <span aria-hidden>·</span>
            <span>{report.filters.location?.name ?? "All locations"}</span>
            <span aria-hidden>·</span>
            <span>{report.filters.category?.name ?? "All categories"}</span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile
              label="Total waste"
              value={report.summary.total_kg.toFixed(1)}
              unit="kg"
              hint="matching records"
            />
            <StatTile
              label="Records"
              value={report.summary.records}
              hint="waste entries"
              accent="var(--info)"
            />
            <StatTile
              label="Average / record"
              value={report.summary.average_kg.toFixed(1)}
              unit="kg"
              hint="per entry"
              accent="var(--lid-orange)"
            />
            <StatTile
              label="Collections"
              value={report.collections.total}
              hint="schedules in period"
              accent="var(--ok)"
            />
          </div>

          <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-12">
            <Card className="xl:col-span-5">
              <CardHeader className="border-b border-line py-4">
                <CardTitle>Waste by category</CardTitle>
                <p className="text-[11.5px] text-muted-ink">Share of collected waste in the period</p>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {report.summary.by_category.length === 0 ? (
                  <p className="py-6 text-center text-[12.5px] text-muted-ink">
                    No waste records match the filters.
                  </p>
                ) : (
                  report.summary.by_category.map((category) => (
                    <div key={category.id} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex min-w-0 items-center gap-1.5 text-[12px] text-ink">
                          <span
                            className="size-[7px] shrink-0 rounded-full"
                            style={{ background: category.color_code }}
                            aria-hidden
                          />
                          <span className="truncate">{category.name}</span>
                        </span>
                        <span className="num shrink-0 text-[11.5px] text-muted-ink">
                          {category.kg.toFixed(1)} kg · {category.share}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${category.share}%`, background: category.color_code }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-ink">
                        {category.records} {category.records === 1 ? "record" : "records"}
                      </p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="xl:col-span-7">
              <CardHeader className="border-b border-line py-4">
                <CardTitle>Collection performance</CardTitle>
                <p className="text-[11.5px] text-muted-ink">
                  Scheduled vs collected vs missed for the selected period
                </p>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {COLLECTION_META.map((item) => (
                    <div key={item.key} className="rounded-[9px] border border-line p-3">
                      <span className={`block h-[3px] w-7 rounded-full ${item.bar}`} />
                      <p className={`display mt-2 text-[26px] leading-none ${item.text}`}>
                        {report.collections.counts[item.key] ?? 0}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-ink">{item.label}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[11px] text-muted-ink">
                  <span className="num font-medium text-ink">{report.collections.total}</span> schedules match the
                  filters.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <CardHeader className="border-b border-line py-4">
              <CardTitle>Waste by location</CardTitle>
              <p className="text-[11.5px] text-muted-ink">Collected waste grouped by location</p>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-5">Location</TableHead>
                      <TableHead>Building</TableHead>
                      <TableHead className="text-right">Records</TableHead>
                      <TableHead className="pr-5 text-right">Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {report.summary.by_location.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="py-10 text-center text-[12.5px] text-muted-ink">
                          No waste records match the filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      report.summary.by_location.map((location) => (
                        <TableRow key={location.id}>
                          <TableCell className="pl-5 text-[12.5px] font-medium">{location.name}</TableCell>
                          <TableCell className="text-[11.5px] text-muted-ink">
                            {location.building ?? "—"}
                          </TableCell>
                          <TableCell className="num text-right text-[12px]">{location.records}</TableCell>
                          <TableCell className="num pr-5 text-right text-[12px]">
                            {location.kg.toFixed(1)} kg
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  )
}
