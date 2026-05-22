import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { PageHeader } from "@/components/layout/page-header"
import { AddVehicleDialog } from "@/components/vehicles/add-vehicle-dialog"
import { VehiclesGrid } from "@/components/vehicles/vehicles-grid"
import { StatusFilter } from "@/components/ui/status-filter"
import type { VehicleStatus } from "@prisma/client"

const VALID_STATUSES: VehicleStatus[] = ["AVAILABLE", "RENTED", "MAINTENANCE", "OUT_OF_SERVICE"]

const FILTER_OPTIONS = [
  { value: "ALL", label: "Tous" },
  { value: "AVAILABLE", label: "Disponible" },
  { value: "RENTED", label: "En location" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "OUT_OF_SERVICE", label: "Hors service" },
]

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const session = await auth()

  const statusFilter =
    status && VALID_STATUSES.includes(status as VehicleStatus)
      ? { status: status as VehicleStatus }
      : {}

  const vehicles = await db.vehicle.findMany({
    where: { organizationId: session!.user.organizationId, ...statusFilter },
    orderBy: { createdAt: "desc" },
    include: {
      contracts: {
        include: { driver: true },
        orderBy: { createdAt: "desc" },
        take: 3,
      },
    },
  })

  return (
    <div>
      <PageHeader
        title="Véhicules"
        description={`${vehicles.length} véhicule${vehicles.length > 1 ? "s" : ""} enregistré${vehicles.length > 1 ? "s" : ""}`}
      >
        <AddVehicleDialog />
      </PageHeader>

      <StatusFilter options={FILTER_OPTIONS} />

      {vehicles.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">
            {status && status !== "ALL"
              ? "Aucun véhicule pour ce statut"
              : "Aucun véhicule pour l'instant"}
          </p>
          {(!status || status === "ALL") && (
            <p className="text-sm mt-1">Commencez par ajouter un véhicule à votre flotte</p>
          )}
        </div>
      ) : (
        <VehiclesGrid vehicles={vehicles} />
      )}
    </div>
  )
}
