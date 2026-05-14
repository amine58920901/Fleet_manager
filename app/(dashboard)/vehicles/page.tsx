import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { PageHeader } from "@/components/layout/page-header"
import { AddVehicleDialog } from "@/components/vehicles/add-vehicle-dialog"
import { VehiclesGrid } from "@/components/vehicles/vehicles-grid"

export default async function VehiclesPage() {
  const session = await auth()
  const vehicles = await db.vehicle.findMany({
    where: { organizationId: session!.user.organizationId },
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

      {vehicles.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">Aucun véhicule pour l&apos;instant</p>
          <p className="text-sm mt-1">Commencez par ajouter un véhicule à votre flotte</p>
        </div>
      ) : (
        <VehiclesGrid vehicles={vehicles} />
      )}
    </div>
  )
}
