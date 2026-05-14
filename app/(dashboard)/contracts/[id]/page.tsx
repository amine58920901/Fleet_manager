import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { PageHeader } from "@/components/layout/page-header"
import { ContractActions } from "@/components/contracts/contract-actions"
import { ConditionDisplay } from "@/components/contracts/vehicle-condition"
import { DownloadPdfButton } from "@/components/pdf/download-pdf-button"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { VehicleCondition } from "@/components/contracts/vehicle-condition"

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value && value !== 0) return null
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-gray-500 shrink-0">{label}</dt>
      <dd className="font-medium text-right">{value}</dd>
    </div>
  )
}

export default async function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const contract = await db.contract.findUnique({
    where: { id, organizationId: session!.user.organizationId },
    include: { vehicle: true, driver: true, invoice: true },
  })

  if (!contract) notFound()

  const statusLabel: Record<string, string> = { ACTIVE: "Actif", COMPLETED: "Terminé", CANCELLED: "Annulé" }
  const statusClass: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-700",
    COMPLETED: "bg-gray-100 text-gray-700",
    CANCELLED: "bg-red-100 text-red-700",
  }

  const conditionStart = contract.conditionStart as VehicleCondition | null
  const conditionEnd = contract.conditionEnd as VehicleCondition | null
  const hasCondition = (conditionStart && Object.keys(conditionStart).length > 0) ||
                       (conditionEnd && Object.keys(conditionEnd).length > 0)

  const hasFinancials = contract.paymentAmount || contract.paymentDueDay || contract.paymentMethod || contract.depositReturnConditions
  const hasMileage = contract.mileageAllowance || contract.extraMileageCost
  const hasInsurance = contract.insuranceFranchise || contract.insuranceInfo || contract.maintenanceInfo
  const hasTermination = contract.returnLocation || contract.earlyTerminationConditions

  return (
    <div>
      <PageHeader
        title={`Contrat ${contract.number}`}
        backHref="/contracts"
      >
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusClass[contract.status]}`}>
          {statusLabel[contract.status]}
        </span>
        <DownloadPdfButton href={`/api/pdf/contract/${contract.id}/etat-lieux`} filename={`etat-lieux-depart-${contract.number}.pdf`} label="État des lieux" />
        <DownloadPdfButton href={`/api/pdf/contract/${contract.id}`} filename={`contrat-${contract.number}.pdf`} />
        <ContractActions contract={contract} />
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">

        {/* Véhicule */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Véhicule</h2>
          <dl className="space-y-2 text-sm">
            <Row label="Véhicule" value={`${contract.vehicle.brand} ${contract.vehicle.model}`} />
            <Row label="Immatriculation" value={contract.vehicle.licensePlate} />
            <Row label="Km départ" value={contract.mileageStart != null ? `${contract.mileageStart.toLocaleString("fr-FR")} km` : null} />
            <Row label="Km retour" value={contract.mileageEnd != null ? `${contract.mileageEnd.toLocaleString("fr-FR")} km` : null} />
            <Row label="Carburant départ" value={contract.fuelLevelStart} />
            <Row label="Carburant retour" value={contract.fuelLevelEnd} />
            {hasMileage && <div className="pt-2 mt-2 border-t" />}
            <Row label="Forfait kilométrique" value={contract.mileageAllowance != null ? `${contract.mileageAllowance.toLocaleString("fr-FR")} km inclus` : null} />
            <Row label="Km supplémentaire" value={contract.extraMileageCost != null ? `${Number(contract.extraMileageCost).toFixed(2)} €/km` : null} />
          </dl>
        </div>

        {/* Chauffeur & Période */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Chauffeur & Période</h2>
          <dl className="space-y-2 text-sm">
            <Row label="Chauffeur" value={`${contract.driver.firstName} ${contract.driver.lastName}`} />
            <Row label="N° permis" value={contract.driver.licenseNumber} />
            <Row label="Date début" value={formatDate(contract.startDate)} />
            <Row label="Date fin prévue" value={formatDate(contract.endDate)} />
            {contract.returnedAt && <Row label="Retour effectif" value={formatDate(contract.returnedAt)} />}
            <Row label="Caution" value={contract.depositAmount ? formatCurrency(Number(contract.depositAmount)) : null} />
          </dl>
        </div>

        {/* Modalités financières */}
        {hasFinancials && (
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Modalités financières</h2>
            <dl className="space-y-2 text-sm">
              <Row
                label="Mensualité"
                value={contract.paymentAmount != null
                  ? `${formatCurrency(Number(contract.paymentAmount))} ${contract.paymentTaxType ?? "TTC"}`
                  : null}
              />
              <Row
                label="Échéance"
                value={contract.paymentDueDay != null ? `Le ${contract.paymentDueDay} de chaque mois` : null}
              />
              <Row label="Mode de règlement" value={contract.paymentMethod} />
            </dl>
            {contract.depositReturnConditions && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs font-medium text-gray-500 mb-1">Restitution de la caution</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{contract.depositReturnConditions}</p>
              </div>
            )}
          </div>
        )}

        {/* Assurance & entretien */}
        {hasInsurance && (
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Assurance & entretien</h2>
            <dl className="space-y-2 text-sm">
              <Row
                label="Franchise sinistre"
                value={contract.insuranceFranchise != null ? formatCurrency(Number(contract.insuranceFranchise)) : null}
              />
            </dl>
            {contract.insuranceInfo && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs font-medium text-gray-500 mb-1">Assurance</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{contract.insuranceInfo}</p>
              </div>
            )}
            {contract.maintenanceInfo && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs font-medium text-gray-500 mb-1">Entretien & réparations</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{contract.maintenanceInfo}</p>
              </div>
            )}
          </div>
        )}

        {/* Résiliation & restitution */}
        {hasTermination && (
          <div className="bg-white rounded-xl border p-6 lg:col-span-2">
            <h2 className="font-semibold text-gray-900 mb-4">Résiliation & restitution</h2>
            <dl className="space-y-2 text-sm mb-2">
              <Row label="Lieu de restitution" value={contract.returnLocation} />
            </dl>
            {contract.earlyTerminationConditions && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs font-medium text-gray-500 mb-1">Résiliation anticipée</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{contract.earlyTerminationConditions}</p>
              </div>
            )}
          </div>
        )}

        {/* État du véhicule */}
        {(hasCondition || contract.status === "ACTIVE") && (
          <div className="lg:col-span-2 bg-white rounded-xl border p-6">
            <h2 className="font-semibold text-gray-900 mb-5">État du véhicule</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <h3 className="text-sm font-semibold text-gray-700">Au départ</h3>
                </div>
                <ConditionDisplay condition={conditionStart} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-gray-400" />
                  <h3 className="text-sm font-semibold text-gray-700">Au retour</h3>
                </div>
                {contract.status === "ACTIVE" ? (
                  <p className="text-sm text-gray-400 italic">À renseigner lors de la clôture</p>
                ) : (
                  <ConditionDisplay condition={conditionEnd} />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Clauses additionnelles */}
        {contract.terms && (
          <div className="lg:col-span-2 bg-white rounded-xl border p-6">
            <h2 className="font-semibold text-gray-900 mb-2">Clauses additionnelles</h2>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{contract.terms}</p>
          </div>
        )}
      </div>
    </div>
  )
}
