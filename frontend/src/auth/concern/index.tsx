import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth, ROLE_HOME } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PageHeader } from "@/components/ecotrack/PageHeader"
import { concernMessage, createConcern, getConcernLocations } from "@/concerns/api"
import type { LocationOption } from "@/concerns/api"
import { toast } from "sonner"
import { AlertCircle, ImagePlus, Loader2, MapPin, Send, X } from "lucide-react"

const MAX_PHOTO_BYTES = 5 * 1024 * 1024

export default function ReportConcernPage() {
  const navigate = useNavigate()
  const { role } = useAuth()
  const isOffice = role === "office"

  const [locations, setLocations] = useState<LocationOption[]>([])
  const [locationId, setLocationId] = useState("")
  const [description, setDescription] = useState("")
  const [photo, setPhoto] = useState<File | null>(null)
  const [loadingLocations, setLoadingLocations] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    getConcernLocations()
      .then((options) => {
        if (cancelled) return
        setLocations(options)
        if (options.length > 0) setLocationId(String(options[0].id))
      })
      .catch((err) => {
        if (!cancelled) setError(concernMessage(err))
      })
      .finally(() => {
        if (!cancelled) setLoadingLocations(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const preview = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo])

  useEffect(() => {
    if (!preview) return
    return () => URL.revokeObjectURL(preview)
  }, [preview])

  const targetLocation = isOffice
    ? (locations[0] ?? null)
    : (locations.find((location) => String(location.id) === locationId) ?? null)

  const canSubmit = !loadingLocations && !submitting && targetLocation !== null

  const handlePhoto = (file: File | null) => {
    if (!file) {
      setPhoto(null)
      return
    }
    if (file.size > MAX_PHOTO_BYTES) {
      toast.error("The photo must be 5 MB or smaller.")
      return
    }
    setPhoto(file)
  }

  const handleSubmit = async () => {
    const trimmed = description.trim()

    if (trimmed.length < 10) {
      setError("Add a little more detail — at least 10 characters.")
      return
    }

    if (!targetLocation) {
      setError(
        isOffice
          ? "Your office has no assigned location yet. Ask the administrator."
          : "Choose the location of the concern."
      )
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await createConcern({
        locationId: targetLocation.id,
        description: trimmed,
        photo,
      })
      toast.success("Concern reported.")
      const destination =
        role === "admin" ? "/admin/concerns" : role === "office" ? "/office/concerns" : ROLE_HOME[role]
      navigate(destination)
    } catch (err) {
      setError(concernMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-[680px] space-y-5">
      <PageHeader
        eyebrow="Quick report"
        title="Report a concern"
        subtitle="Overflowing bin, improper disposal or a missed pickup. The admin will review it."
      />

      <Card>
        <CardHeader>
          <CardTitle>Concern details</CardTitle>
          <p className="text-[12px] text-muted-ink">
            A clear description helps the crew act on the first trip.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Location</Label>

            {loadingLocations ? (
              <div className="flex h-10 items-center gap-2 rounded-[8px] border border-line bg-surface-2 px-3 text-[12.5px] text-muted-ink">
                <Loader2 className="size-3.5 animate-spin" /> Loading locations…
              </div>
            ) : isOffice ? (
              targetLocation ? (
                <div className="rounded-[8px] border border-line bg-surface-2 px-3 py-2.5">
                  <p className="flex items-center gap-1.5 text-[13px] font-medium text-ink">
                    <MapPin className="size-3.5 text-muted-ink" />
                    {targetLocation.name}
                  </p>
                  <p className="mt-0.5 text-[10.5px] text-muted-ink">
                    Your office location — the administrator sees it automatically.
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-2 rounded-[8px] border border-warn/30 bg-warn-soft px-3 py-2.5 text-[12px] text-warn">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  Your office has no assigned location yet. Ask the administrator before reporting.
                </div>
              )
            ) : (
              <Select value={locationId} onValueChange={setLocationId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={String(location.id)}>
                      {location.name}
                      {location.floor_or_area ? ` — ${location.floor_or_area}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Description</Label>
              <span className="num text-[10.5px] text-muted-ink">{description.length} / 2000</span>
            </div>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe the problem — what, where, how bad."
              className="min-h-[130px]"
              maxLength={2000}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Photo (optional)</Label>
            {preview ? (
              <div className="relative overflow-hidden rounded-[8px] border border-line">
                <img src={preview} alt="Selected concern photo" className="max-h-56 w-full object-cover" />
                <Button
                  type="button"
                  size="icon-sm"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={() => setPhoto(null)}
                  aria-label="Remove photo"
                >
                  <X className="size-4" />
                </Button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[8px] border border-dashed border-line-strong bg-surface-2 py-7 text-muted-ink transition-colors hover:bg-surface">
                <ImagePlus className="size-5" />
                <span className="text-[12px] font-medium">Attach a photo</span>
                <span className="text-[10.5px] text-muted-ink/80">JPG, PNG or WebP · up to 5 MB</span>
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(event) => handlePhoto(event.target.files?.[0] ?? null)}
                />
              </label>
            )}
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-[8px] border border-alarm/25 bg-alarm-soft px-3 py-2.5 text-[12px] text-alarm">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-2 border-t border-line pt-4 sm:flex-row">
            <Button variant="outline" className="min-h-11 flex-1 sm:min-h-10" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button className="min-h-11 flex-1 sm:min-h-10" onClick={handleSubmit} disabled={!canSubmit}>
              {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              {submitting ? "Submitting…" : "Submit concern"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
