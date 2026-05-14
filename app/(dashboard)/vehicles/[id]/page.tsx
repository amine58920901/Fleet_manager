import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { PageHeader } from "@/components/layout/page-header"
import { VehicleForm } from "@/components/vehicles/vehicle-form"
import { VehicleStatusBadge } from "@/components/vehicles/vehicle-status-badge"
import { formatCurrency, formatDate } from "@/lib/utils"

export default async function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const vehicle = await db.vehicle.findUnique({
    where: { id, organizationId: session!.user.organizationId },
    include: { contracts: { include: { driver: true }, orderBy: { createdAt: "desc" }, take: 5 } },
  })

  if (!vehicle) notFound()

  return (
    <div>
      <PageHeader
        title={`${vehicle.brand} ${vehicle.model}`}
        description={`${vehicle.year} · ${vehicle.licensePlate}`}
        backHref="/vehicles"
      >
        <VehicleStatusBadge status={vehicle.status} />
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">Informations</h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-xs text-gray-500 mb-1">Marque</dt>
                <dd className="font-medium">{vehicle.brand}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 mb-1">Modèle</dt>
                <dd className="font-medium">{vehicle.model}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 mb-1">Année</dt>
                <dd className="font-medium">{vehicle.year}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 mb-1">Couleur</dt>
                <dd className="font-medium">{vehicle.color ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 mb-1">Plaque</dt>
                <dd className="font-medium">{vehicle.licensePlate}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 mb-1">VIN</dt>
                <dd className="font-medium">{vehicle.vin ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 mb-1">Kilométrage</dt>
                <dd className="font-medium">{vehicle.mileage.toLocaleString("fr-FR")} km</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 mb-1">Tarif journalier</dt>
                <dd className="font-medium">{formatCurrency(Number(vehicle.dailyRate))}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 mb-1">Tarif hebdomadaire</dt>
                <dd className="font-medium">{vehicle.weeklyRate ? formatCurrency(Number(vehicle.weeklyRate)) : "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 mb-1">Tarif mensuel</dt>
                <dd className="font-medium">{vehicle.monthlyRate ? formatCurrency(Number(vehicle.monthlyRate)) : "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 mb-1">Caution</dt>
                <dd className="font-medium">{vehicle.depositAmount ? formatCurrency(Number(vehicle.depositAmount)) : "—"}</dd>
              </div>
            </dl>
            {vehicle.notes && (
              <div className="mt-4 pt-4 border-t">
                <dt className="text-xs text-gray-500 mb-1">Notes</dt>
                <dd className="text-sm text-gray-700">{vehicle.notes}</dd>
              </div>
            )}
          </div>

          {vehicle.contracts.length > 0 && (
            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Derniers contrats</h2>
              <div className="space-y-3">
                {vehicle.contracts.map((contract) => (
                  <div key={contract.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium text-sm">{contract.number}</p>
                      <p className="text-xs text-gray-500">
                        {contract.driver.firstName} {contract.driver.lastName} · {formatDate(contract.startDate)} → {formatDate(contract.endDate)}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      contract.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                      contract.status === "COMPLETED" ? "bg-gray-100 text-gray-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {contract.status === "ACTIVE" ? "Actif" : contract.status === "COMPLETED" ? "Terminé" : "Annulé"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border p-6 h-fit">
          <h2 className="font-semibold text-gray-900 mb-4">Modifier</h2>
          <VehicleForm vehicle={vehicle} />
        </div>
      </div>
    </div>
  )
}
