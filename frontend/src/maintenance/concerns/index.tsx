import { Link } from "react-router-dom"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ecotrack/PageHeader"
import { ConcernsList } from "@/concerns/components/ConcernsList"

export default function MaintenanceConcerns() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Field feedback"
        title="Concerns"
        subtitle="Overflowing bins, improper disposal and missed pickups — reviewed Open → Acknowledged → Resolved."
        actions={
          <Button asChild>
            <Link to="/maintenance/report-concern">
              <Plus className="size-4" /> Report a concern
            </Link>
          </Button>
        }
      />

      <ConcernsList
        canManage
        emptyTitle="No concerns reported"
        emptyDescription="When the crew reports a problem, it lands here for review and resolution."
      />
    </div>
  )
}
