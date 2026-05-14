import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { PageHeader } from "@/components/layout/page-header"
import { QuoteForm } from "@/components/quotes/quote-form"

export default async function NewQuotePage() {
  const session = await auth()
  const vehicles = await db.vehicle.findMany({
    where: { organizationId: session!.user.organizationId },
    orderBy: [{ brand: "asc" }, { model: "asc" }],
  })

  return (
    <div>
      <PageHeader title="Nouveau devis" backHref="/quotes" />
      <div className="max-w-3xl">
        <QuoteForm vehicles={vehicles} />
      </div>
    </div>
  )
}
