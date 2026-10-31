import { PageHeader } from "@/components/ecotrack/PageHeader"
import { ConcernsList } from "@/concerns/components/ConcernsList"

export default function Concerns() {
  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Feedback"
        title="Concerns"
        subtitle="Overflowing bins, improper disposal and missed pickups — reviewed Open → Acknowledged → Resolved."
      />

      <ConcernsList
        canManage
        emptyTitle="No concerns reported"
        emptyDescription="When an office reports a problem, it lands here for review."
      />
    </div>
  )
}
