import { Suspense } from "react"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { StatusFilter } from "@/components/ui/status-filter"
import { ContractsGantt } from "@/components/contracts/contracts-gantt"
import { Pagination } from "@/components/ui/pagination"
import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Plus, ClipboardList, Clock, TrendingUp, ExternalLink } from "lucide-react"
import type { ContractStatus } from "@prisma/client"

const VALID_STATUSES: ContractStatus[] = ["ACTIVE", "COMPLETED", "CANCELLED"]

const FILTER_OPTIONS = [
  { value: "ALL", label: "Tous" },
  { value: "ACTIVE", label: "En cours" },
  { value: "COMPLETED", label: "Terminé" },
  { value: "CANCELLED", label: "Annulé" },
]

const statusLabel: Record<ContractStatus, string> = {
  ACTIVE: "En cours",
  COMPLETED: "Terminé",
  CANCELLED: "Annulé",
}

const statusStyle: Record<ContractStatus, string> = {
  ACTIVE: "bg-[#6cf8bb]/20 text-[#006c49]",
  COMPLETED: "bg-gray-100 text-gray-500",
  CANCELLED: "bg-red-100 text-red-600",
}

const statusDot: Record<ContractStatus, string> = {
  ACTIVE: "bg-[#006c49]",
  COMPLETED: "bg-gray-400",
  CANCELLED: "bg-red-500",
}

const PER_PAGE = 10

export default async function ContractsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const { status, page: pageParam } = await searchParams
  const session = await auth()
  const orgId = session!.user.organizationId
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1)

  const statusFilter =
    status && VALID_STATUSES.includes(status as ContractStatus)
      ? { status: status as ContractStatus }
      : {}

  const contractsWhere = { organizationId: orgId, ...statusFilter }

  const [allActive, filteredContracts, contractsTotal, ganttVehicles] = await Promise.all([
    db.contract.findMany({
      where: { organizationId: orgId, status: "ACTIVE" },
      select: { id: true, endDate: true },
    }),
    db.contract.findMany({
      where: contractsWhere,
      include: { vehicle: true, driver: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    db.contract.count({ where: contractsWhere }),
    db.vehicle.findMany({
      where: { organizationId: orgId },
      include: {
        contracts: {
          where: { status: "ACTIVE" },
          include: { driver: true },
        },
      },
      orderBy: { brand: "asc" },
      take: 10,
    }),
  ])

  const contractsTotalPages = Math.ceil(contractsTotal / PER_PAGE)

  const today = new Date()
  const sevenDaysLater = new Date(today)
  sevenDaysLater.setDate(today.getDate() + 7)

  const activeCount = allActive.length
  const expiringCount = allActive.filter(
    (c) => new Date(c.endDate) <= sevenDaysLater
  ).length

  const ganttData = ganttVehicles.map((v) => ({
    id: v.id,
    brand: v.brand,
    model: v.model,
    licensePlate: v.licensePlate,
    contracts: v.contracts.map((c) => ({
      id: c.id,
      number: c.number,
      startDate: c.startDate,
      endDate: c.endDate,
      driverName: `${c.driver.firstName} ${c.driver.lastName}`,
    })),
  }))

  return (
    <div className="space-y-8 max-w-[1440px] mx-auto">
      {/* Page Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-[#00236f]">
            Contrats & Réservations
          </h1>
          <p className="text-base text-[#444651] mt-1">
            Gérez le planning de votre flotte et vos engagements contractuels.
          </p>
        </div>
        <Link
          href="/contracts/new"
          className="flex items-center gap-2 bg-[#00236f] text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all shrink-0"
        >
          <Plus className="h-4 w-4" />
          Nouveau Contrat
        </Link>
      </div>

      {/* Grid: Gantt (8 cols) + Stats (4 cols) */}
      <div className="grid grid-cols-12 gap-6">
        {/* Gantt – 8 columns */}
        <div className="col-span-12 lg:col-span-8">
          <ContractsGantt vehicles={ganttData} />
        </div>

        {/* Stats – 4 columns */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          {/* Active contracts */}
          <div className="bg-white rounded-2xl p-6 shadow-[0px_4px_20px_rgba(15,23,42,0.05)] border-l-4 border-[#00236f]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-[#444651] uppercase tracking-wider">
                  Contrats Actifs
                </p>
                <h3 className="text-4xl font-bold mt-1 text-[#0b1c30]">
                  {String(activeCount).padStart(2, "0")}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#dce1ff] flex items-center justify-center shrink-0">
                <ClipboardList className="h-5 w-5 text-[#00236f]" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-[#006c49] text-xs font-semibold">
              <TrendingUp className="h-4 w-4" />
              {activeCount} contrat{activeCount > 1 ? "s" : ""} en cours
            </div>
          </div>

          {/* Expiring soon */}
          <div className="bg-white rounded-2xl p-6 shadow-[0px_4px_20px_rgba(15,23,42,0.05)] border-l-4 border-[#ffb95f]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-[#444651] uppercase tracking-wider">
                  À Renouveler
                </p>
                <h3 className="text-4xl font-bold mt-1 text-[#0b1c30]">
                  {String(expiringCount).padStart(2, "0")}
                </h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-[#ffddb8] flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5 text-[#ffb95f]" />
              </div>
            </div>
            <p className="mt-4 text-[#444651] text-xs font-semibold">
              Dans les 7 prochains jours
            </p>
          </div>
        </div>
      </div>

      {/* Contracts table */}
      <div className="bg-white rounded-2xl shadow-[0px_4px_20px_rgba(15,23,42,0.05)] overflow-hidden">
        {/* Table header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-xl font-semibold text-[#0b1c30]">Liste des Contrats</h2>
          <StatusFilter
            options={FILTER_OPTIONS}
            className="flex flex-wrap gap-2"
          />
        </div>

        {filteredContracts.length === 0 ? (
          <div className="py-16 text-center text-[#444651]">
            <p className="text-base">
              Aucun contrat{status && status !== "ALL" ? " pour ce statut" : ""}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="bg-[#f8f9ff] border-b border-[#c5c5d3]">
                  <th className="px-6 py-4 text-xs font-semibold text-[#444651] uppercase tracking-wider">
                    Client / ID
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#444651] uppercase tracking-wider">
                    Véhicule
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#444651] uppercase tracking-wider">
                    Période
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#444651] uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#444651] uppercase tracking-wider text-center">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-[#444651] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredContracts.map((contract) => {
                  const firstName = contract.driver.firstName
                  const lastName = contract.driver.lastName
                  const initials = `${firstName[0]}${lastName[0]}`.toUpperCase()
                  const amount = contract.paymentAmount
                    ? Number(contract.paymentAmount)
                    : null
                  const dailyRate = contract.vehicle.dailyRate
                    ? Number(contract.vehicle.dailyRate)
                    : null

                  return (
                    <tr
                      key={contract.id}
                      className="hover:bg-[#f8f9ff] transition-colors group"
                    >
                      {/* Client */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#dce1ff] flex items-center justify-center text-[#00236f] font-bold text-sm shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-[#0b1c30] truncate">
                              {firstName} {lastName}
                            </p>
                            <p className="text-xs text-[#444651] font-mono">
                              {contract.number}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Vehicle */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-[#0b1c30]">
                          {contract.vehicle.brand} {contract.vehicle.model}
                        </p>
                        <p className="text-xs text-[#757682]">
                          {contract.vehicle.licensePlate}
                        </p>
                      </td>

                      {/* Period */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 bg-[#e5eeff] rounded font-medium text-[#444651]">
                            {formatDate(contract.startDate)}
                          </span>
                          <span className="text-[#757682] text-xs">→</span>
                          <span className="text-xs px-2 py-0.5 bg-[#e5eeff] rounded font-medium text-[#444651]">
                            {formatDate(contract.endDate)}
                          </span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4">
                        {amount ? (
                          <>
                            <p className="text-sm font-semibold text-[#0b1c30]">
                              {formatCurrency(amount)}
                            </p>
                            {dailyRate && (
                              <p className="text-[10px] text-[#757682]">
                                Journalier: {formatCurrency(dailyRate)}
                              </p>
                            )}
                          </>
                        ) : dailyRate ? (
                          <>
                            <p className="text-sm font-semibold text-[#0b1c30]">—</p>
                            <p className="text-[10px] text-[#757682]">
                              Journalier: {formatCurrency(dailyRate)}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-[#757682]">—</p>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusStyle[contract.status]}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${statusDot[contract.status]} shrink-0`}
                          />
                          {statusLabel[contract.status]}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <Link
                          href={`/contracts/${contract.id}`}
                          className="p-2 hover:bg-[#e5eeff] rounded-full transition-all inline-flex"
                          title="Voir le contrat"
                        >
                          <ExternalLink className="h-4 w-4 text-[#757682]" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <Suspense>
          <Pagination page={page} totalPages={contractsTotalPages} totalItems={contractsTotal} itemsPerPage={PER_PAGE} />
        </Suspense>
        <div className="px-6 pb-6">
          <p className="text-sm text-[#444651]">
            {contractsTotal} contrat{contractsTotal > 1 ? "s" : ""}
            {status && status !== "ALL" ? ` · filtre: ${statusLabel[status as ContractStatus]}` : ""}
          </p>
        </div>
      </div>
    </div>
  )
}
