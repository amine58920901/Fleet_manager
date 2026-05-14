import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { PageHeader } from "@/components/layout/page-header"
import { DriverForm } from "@/components/drivers/driver-form"
import { formatDate } from "@/lib/utils"

export default async function DriverDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const driver = await db.driver.findUnique({
    where: { id, organizationId: session!.user.organizationId },
    include: {
      contracts: {
        include: { vehicle: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  })

  if (!driver) notFound()

  return (
    <div>
      <PageHeader
        title={`${driver.firstName} ${driver.lastName}`}
        description={`Permis : ${driver.licenseNumber}`}
        backHref="/drivers"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border p-6 mb-6">
            <h2 className="font-semibold text-gray-900 mb-4">Informations</h2>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-xs text-gray-500 mb-1">Email</dt>
                <dd className="font-medium">{driver.email ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 mb-1">Téléphone</dt>
                <dd className="font-medium">{driver.phone ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 mb-1">Date de naissance</dt>
                <dd className="font-medium">{driver.birthDate ? formatDate(driver.birthDate) : "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-gray-500 mb-1">Expiration permis</dt>
                <dd className="font-medium">{driver.licenseExpiry ? formatDate(driver.licenseExpiry) : "—"}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs text-gray-500 mb-1">Adresse</dt>
                <dd className="font-medium">{driver.address ?? "—"}</dd>
              </div>
            </dl>
          </div>

          {driver.contracts.length > 0 && (
            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Derniers contrats</h2>
              <div className="space-y-3">
                {driver.contracts.map((contract) => (
                  <div key={contract.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium text-sm">{contract.number}</p>
                      <p className="text-xs text-gray-500">
                        {contract.vehicle.brand} {contract.vehicle.model} · {formatDate(contract.startDate)} → {formatDate(contract.endDate)}
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
          <DriverForm driver={driver} />
        </div>
      </div>
    </div>
  )
}
