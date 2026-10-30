import { Link } from "react-router-dom"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ecotrack/PageHeader"
import { ConcernsList } from "@/concerns/components/ConcernsList"

export default function Concerns() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Feedback"
        title="Concerns"
        subtitle="Overflowing bins, improper disposal and missed pickups — reviewed Open → Acknowledged → Resolved."
        actions={
          <Button asChild>
            <Link to="/admin/report-concern">
              <Plus className="size-4" /> Report a concern
            </Link>
          </Button>
        }
      />

      <ConcernsList
        canManage
        emptyTitle="No concerns reported"
        emptyDescription="When an office or crew member reports a problem, it lands here for review."
      />
    </div>
  )
}
