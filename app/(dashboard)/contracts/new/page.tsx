import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { PageHeader } from "@/components/layout/page-header"
import { ContractForm } from "@/components/contracts/contract-form"

export default async function NewContractPage({
  searchParams,
}: {
  searchParams: Promise<{ quoteId?: string }>
}) {
  const { quoteId } = await searchParams
  const session = await auth()

  const [vehicles, drivers] = await Promise.all([
    db.vehicle.findMany({ where: { organizationId: session!.user.organizationId }, orderBy: { brand: "asc" } }),
    db.driver.findMany({ where: { organizationId: session!.user.organizationId }, orderBy: { lastName: "asc" } }),
  ])

  // Pré-remplir depuis le devis si quoteId fourni
  let prefill: {
    quoteId: string
    vehicleId: string | null
    startDate: string
    endDate: string
    clientName: string
  } | null = null

  if (quoteId) {
    const quote = await db.quote.findUnique({
      where: { id: quoteId, organizationId: session!.user.organizationId },
    })
    if (quote) {
      prefill = {
        quoteId: quote.id,
        vehicleId: quote.vehicleId ?? null,
        startDate: quote.startDate.toISOString().slice(0, 10),
        endDate: quote.endDate.toISOString().slice(0, 10),
        clientName: quote.clientName,
      }
    }
  }

  return (
    <div>
      <PageHeader
        title={prefill ? "Contrat depuis devis accepté" : "Nouveau contrat"}
        description={prefill ? `Client : ${prefill.clientName}` : undefined}
        backHref="/contracts"
      />
      <div className="max-w-2xl">
        <ContractForm vehicles={vehicles} drivers={drivers} prefill={prefill} />
      </div>
    </div>
  )
}
