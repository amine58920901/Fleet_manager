import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { PageHeader } from "@/components/layout/page-header"
import Link from "next/link"
import { Plus } from "lucide-react"
import { DriversGrid } from "@/components/drivers/drivers-grid"
import { StatusFilter } from "@/components/ui/status-filter"

const FILTER_OPTIONS = [
  { value: "ALL", label: "Tous" },
  { value: "ACTIVE", label: "En course" },
  { value: "AVAILABLE", label: "Disponible" },
]

export default async function DriversPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const session = await auth()

  const activityFilter =
    status === "ACTIVE"
      ? { contracts: { some: { status: "ACTIVE" as const } } }
      : status === "AVAILABLE"
      ? { contracts: { none: { status: "ACTIVE" as const } } }
      : {}

  const drivers = await db.driver.findMany({
    where: { organizationId: session!.user.organizationId, ...activityFilter },
    orderBy: { createdAt: "desc" },
    include: {
      contracts: {
        include: { vehicle: true },
        orderBy: { createdAt: "desc" },
        take: 3,
      },
    },
  })

  return (
    <div>
      <PageHeader
        title="Chauffeurs"
        description={`${drivers.length} chauffeur${drivers.length > 1 ? "s" : ""} enregistré${drivers.length > 1 ? "s" : ""}`}
      >
        <Link
          href="/drivers/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Ajouter un chauffeur
        </Link>
      </PageHeader>

      <StatusFilter options={FILTER_OPTIONS} />

      {drivers.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">
            {status && status !== "ALL"
              ? "Aucun chauffeur pour ce statut"
              : "Aucun chauffeur pour l'instant"}
          </p>
        </div>
      ) : (
        <DriversGrid drivers={drivers} />
      )}
    </div>
  )
}
