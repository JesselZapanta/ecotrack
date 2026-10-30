import { Link } from "react-router-dom"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ecotrack/PageHeader"
import { ConcernsList } from "@/concerns/components/ConcernsList"
import { useAuth } from "@/lib/store"

export default function OfficeConcerns() {
  const { user } = useAuth()
  const officeName = user?.office?.name

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Office view"
        title="Concerns"
        subtitle={
          officeName
            ? `Problems reported by ${officeName} and their review status.`
            : "Problems reported by your office and their review status."
        }
        actions={
          <Button asChild>
            <Link to="/office/report-concern">
              <Plus className="size-4" /> Report a concern
            </Link>
          </Button>
        }
      />

      <ConcernsList
        emptyTitle="No concerns reported"
        emptyDescription="Report overflowing bins, improper disposal or missed pickups for your location."
      />
    </div>
  )
}
