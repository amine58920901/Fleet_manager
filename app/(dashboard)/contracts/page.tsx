import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { PageHeader } from "@/components/layout/page-header"
import Link from "next/link"
import { Plus } from "lucide-react"
import { formatDate } from "@/lib/utils"

export default async function ContractsPage() {
  const session = await auth()
  const contracts = await db.contract.findMany({
    where: { organizationId: session!.user.organizationId },
    include: { vehicle: true, driver: true },
    orderBy: { createdAt: "desc" },
  })

  const statusLabel: Record<string, string> = {
    ACTIVE: "Actif",
    COMPLETED: "Terminé",
    CANCELLED: "Annulé",
  }
  const statusClass: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700",
    COMPLETED: "bg-gray-100 text-gray-700",
    CANCELLED: "bg-red-100 text-red-700",
  }

  return (
    <div>
      <PageHeader title="Contrats" description={`${contracts.length} contrat${contracts.length > 1 ? "s" : ""}`}>
        <Link
          href="/contracts/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouveau contrat
        </Link>
      </PageHeader>

      {contracts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">Aucun contrat pour l&apos;instant</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">N°</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Véhicule</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Chauffeur</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Période</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {contracts.map((contract) => (
                <tr key={contract.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/contracts/${contract.id}`} className="font-medium text-blue-600 hover:underline text-sm">
                      {contract.number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {contract.vehicle.brand} {contract.vehicle.model}
                    <span className="text-gray-400 ml-1">· {contract.vehicle.licensePlate}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {contract.driver.firstName} {contract.driver.lastName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDate(contract.startDate)} → {formatDate(contract.endDate)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusClass[contract.status]}`}>
                      {statusLabel[contract.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
