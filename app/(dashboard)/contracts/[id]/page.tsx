import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { ContractActions } from "@/components/contracts/contract-actions"
import { ConditionDisplay } from "@/components/contracts/vehicle-condition"
import { DownloadPdfButton } from "@/components/pdf/download-pdf-button"
import { formatCurrency, formatDate } from "@/lib/utils"
import {
  ArrowLeft,
  Car,
  User,
  CreditCard,
  Shield,
  LogOut,
  MapPin,
  ClipboardCheck,
  Gauge,
  Fuel,
  Route,
  DollarSign,
  Calendar,
} from "lucide-react"
import Link from "next/link"
import type { VehicleCondition } from "@/components/contracts/vehicle-condition"

function Field({ label, value, className }: { label: string; value?: React.ReactNode; className?: string }) {
  if (!value && value !== 0) return null
  return (
    <div className={className}>
      <p className="text-xs text-[#757682] mb-1">{label}</p>
      <p className="text-sm font-semibold text-[#0b1c30]">{value}</p>
    </div>
  )
}

function SectionCard({
  icon: Icon,
  title,
  subtitle,
  children,
  colSpan = "col-span-12 lg:col-span-6",
}: {
  icon: React.ElementType
  title: string
  subtitle?: string
  children: React.ReactNode
  colSpan?: string
}) {
  return (
    <div className={`${colSpan} bg-white rounded-xl p-6 shadow-[0px_4px_20px_rgba(15,23,42,0.05)] border border-[#c5c5d3]/30`}>
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#c5c5d3]/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#00236f]/5 rounded-lg text-[#00236f]">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-lg text-[#0b1c30]">{title}</h3>
        </div>
        {subtitle && <span className="text-xs text-[#757682]">{subtitle}</span>}
      </div>
      {children}
    </div>
  )
}

const statusConfig = {
  ACTIVE: {
    label: "Actif",
    className: "bg-[#6cf8bb]/20 text-[#006c49]",
    dot: "bg-[#006c49]",
  },
  COMPLETED: {
    label: "Terminé",
    className: "bg-gray-100 text-gray-500",
    dot: "bg-gray-400",
  },
  CANCELLED: {
    label: "Annulé",
    className: "bg-red-100 text-red-600",
    dot: "bg-red-500",
  },
}

export default async function ContractDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await auth()
  const contract = await db.contract.findUnique({
    where: { id, organizationId: session!.user.organizationId },
    include: { vehicle: true, driver: true, invoice: true },
  })

  if (!contract) notFound()

  const status = statusConfig[contract.status]
  const conditionStart = contract.conditionStart as VehicleCondition | null
  const conditionEnd = contract.conditionEnd as VehicleCondition | null
  const hasCondition =
    (conditionStart && Object.keys(conditionStart).length > 0) ||
    (conditionEnd && Object.keys(conditionEnd).length > 0)

  const hasFinancials =
    contract.paymentAmount ||
    contract.paymentDueDay ||
    contract.paymentMethod ||
    contract.depositReturnConditions
  const hasInsurance =
    contract.insuranceFranchise || contract.insuranceInfo || contract.maintenanceInfo
  const hasTermination =
    contract.returnLocation || contract.earlyTerminationConditions

  return (
    <div className="space-y-8 max-w-[1440px] mx-auto">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-[#757682] mb-3">
            <Link
              href="/contracts"
              className="flex items-center gap-1 hover:text-[#00236f] transition-colors font-semibold"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Retour
            </Link>
            <span>/</span>
            <Link href="/contracts" className="hover:text-[#00236f] transition-colors">
              Contrats
            </Link>
          </nav>

          {/* Title + status */}
          <div className="flex items-center gap-4 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight text-[#00236f]">
              Contrat {contract.number}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${status.className}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              {status.label}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <DownloadPdfButton
            href={`/api/pdf/contract/${contract.id}/etat-lieux`}
            filename={`etat-lieux-depart-${contract.number}.pdf`}
            label="État des lieux"
            variant="dark"
          />
          <DownloadPdfButton
            href={`/api/pdf/contract/${contract.id}`}
            filename={`contrat-${contract.number}.pdf`}
            variant="outline"
          />
          <ContractActions contract={contract} />
        </div>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-12 gap-6">

        {/* Vehicle card – 6 cols */}
        <SectionCard
          icon={Car}
          title="Véhicule"
          subtitle={`${contract.vehicle.brand} ${contract.vehicle.model}`}
          colSpan="col-span-12 lg:col-span-6"
        >
          <div className="grid grid-cols-2 gap-y-5">
            <Field label="Véhicule" value={`${contract.vehicle.brand} ${contract.vehicle.model}`} />
            <Field label="Immatriculation" value={contract.vehicle.licensePlate} />
            <Field
              label="Km départ"
              value={contract.mileageStart != null ? `${contract.mileageStart.toLocaleString("fr-FR")} km` : undefined}
            />
            <Field label="Carburant départ" value={contract.fuelLevelStart ?? undefined} />
            {contract.mileageEnd != null && (
              <Field label="Km retour" value={`${contract.mileageEnd.toLocaleString("fr-FR")} km`} />
            )}
            {contract.fuelLevelEnd && (
              <Field label="Carburant retour" value={contract.fuelLevelEnd} />
            )}
            {(contract.mileageAllowance || contract.extraMileageCost) && (
              <>
                <div className="col-span-2 border-t border-dashed border-[#c5c5d3]/50 pt-4 grid grid-cols-2 gap-5">
                  {contract.mileageAllowance && (
                    <div>
                      <p className="text-xs text-[#757682] mb-1">Forfait kilométrique</p>
                      <p className="text-sm font-semibold text-[#0b1c30]">
                        {contract.mileageAllowance.toLocaleString("fr-FR")} km inclus
                      </p>
                    </div>
                  )}
                  {contract.extraMileageCost != null && (
                    <div>
                      <p className="text-xs text-[#757682] mb-1">Km supplémentaire</p>
                      <p className="text-sm font-semibold text-[#006c49]">
                        {Number(contract.extraMileageCost).toFixed(2)} €/km
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </SectionCard>

        {/* Driver & Period card – 6 cols */}
        <SectionCard
          icon={User}
          title="Chauffeur & Période"
          colSpan="col-span-12 lg:col-span-6"
        >
          <div className="grid grid-cols-2 gap-5">
            <Field label="Chauffeur" value={`${contract.driver.firstName} ${contract.driver.lastName}`} />
            <Field label="N° permis" value={contract.driver.licenseNumber} />

            {/* Date boxes */}
            <div className="p-3 bg-[#f0f4ff] rounded-lg border border-[#c5c5d3]/20">
              <p className="text-xs text-[#757682] mb-1">Date début</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#00236f] shrink-0" />
                <p className="text-sm font-bold text-[#0b1c30]">{formatDate(contract.startDate)}</p>
              </div>
            </div>
            <div className="p-3 bg-[#f0f4ff] rounded-lg border border-[#c5c5d3]/20">
              <p className="text-xs text-[#757682] mb-1">Date fin prévue</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-red-500 shrink-0" />
                <p className="text-sm font-bold text-[#0b1c30]">{formatDate(contract.endDate)}</p>
              </div>
            </div>

            {contract.returnedAt && (
              <div className="col-span-2">
                <Field label="Retour effectif" value={formatDate(contract.returnedAt)} />
              </div>
            )}

            {/* Deposit highlight */}
            {contract.depositAmount && (
              <div className="col-span-2 mt-2">
                <div className="flex items-center justify-between p-4 bg-[#ffddb8]/10 rounded-xl border border-[#ffb95f]/30">
                  <div>
                    <p className="text-xs text-[#653e00] font-semibold">Caution versée</p>
                    <p className="text-xl font-bold text-[#3e2400] mt-0.5">
                      {formatCurrency(Number(contract.depositAmount))}
                    </p>
                  </div>
                  <CreditCard className="h-8 w-8 text-[#ffb95f]" />
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Financial – 4 cols */}
        {hasFinancials && (
          <SectionCard
            icon={DollarSign}
            title="Modalités financières"
            colSpan="col-span-12 lg:col-span-4"
          >
            <div className="space-y-4">
              {contract.paymentAmount && (
                <div className="flex justify-between items-center py-2 border-b border-[#c5c5d3]/10">
                  <span className="text-sm text-[#444651]">Mensualité</span>
                  <span className="text-sm font-bold text-[#0b1c30]">
                    {formatCurrency(Number(contract.paymentAmount))} {contract.paymentTaxType ?? "TTC"}
                  </span>
                </div>
              )}
              {contract.paymentDueDay && (
                <div className="flex justify-between items-center py-2 border-b border-[#c5c5d3]/10">
                  <span className="text-sm text-[#444651]">Échéance</span>
                  <span className="text-sm font-medium text-[#0b1c30]">
                    Le {contract.paymentDueDay} de chaque mois
                  </span>
                </div>
              )}
              {contract.paymentMethod && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-[#444651]">Mode de règlement</span>
                  <span className="text-sm font-medium text-[#0b1c30]">
                    {contract.paymentMethod}
                  </span>
                </div>
              )}
              {contract.depositReturnConditions && (
                <div className="pt-3 border-t border-[#c5c5d3]/20">
                  <p className="text-xs text-[#757682] mb-1">Restitution de la caution</p>
                  <p className="text-sm text-[#444651] whitespace-pre-wrap">
                    {contract.depositReturnConditions}
                  </p>
                </div>
              )}
            </div>
          </SectionCard>
        )}

        {/* Insurance & maintenance – 4 cols */}
        {hasInsurance && (
          <SectionCard
            icon={Shield}
            title="Assurance & entretien"
            colSpan="col-span-12 lg:col-span-4"
          >
            <div className="space-y-4">
              {contract.insuranceFranchise != null && (
                <div className="flex justify-between items-center py-2 border-b border-[#c5c5d3]/10">
                  <span className="text-sm text-[#444651]">Franchise sinistre</span>
                  <span className="text-sm font-bold text-red-600">
                    {formatCurrency(Number(contract.insuranceFranchise))}
                  </span>
                </div>
              )}
              {contract.insuranceInfo && (
                <div className="py-2 border-b border-[#c5c5d3]/10">
                  <p className="text-xs text-[#757682] mb-1">Assurance</p>
                  <p className="text-sm text-[#444651] whitespace-pre-wrap">{contract.insuranceInfo}</p>
                </div>
              )}
              {contract.maintenanceInfo && (
                <div className="py-2">
                  <p className="text-xs text-[#757682] mb-1">Entretien & réparations</p>
                  <p className="text-sm text-[#444651] whitespace-pre-wrap">{contract.maintenanceInfo}</p>
                </div>
              )}
            </div>
          </SectionCard>
        )}

        {/* Termination & restitution – 4 cols */}
        {hasTermination && (
          <SectionCard
            icon={LogOut}
            title="Résiliation & restitution"
            colSpan="col-span-12 lg:col-span-4"
          >
            <div className="space-y-4">
              {contract.returnLocation && (
                <div className="p-4 bg-[#f0f4ff] rounded-lg border border-[#c5c5d3]/20">
                  <p className="text-xs text-[#757682] mb-2">Lieu de restitution</p>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-[#00236f] shrink-0 mt-0.5" />
                    <p className="text-sm font-semibold text-[#0b1c30]">{contract.returnLocation}</p>
                  </div>
                </div>
              )}
              {contract.earlyTerminationConditions && (
                <div>
                  <p className="text-xs text-[#757682] mb-1">Résiliation anticipée</p>
                  <p className="text-sm text-[#444651] whitespace-pre-wrap">
                    {contract.earlyTerminationConditions}
                  </p>
                </div>
              )}
            </div>
          </SectionCard>
        )}

        {/* Vehicle condition – full width */}
        {(hasCondition || contract.status === "ACTIVE") && (
          <div className="col-span-12 bg-white rounded-xl p-6 shadow-[0px_4px_20px_rgba(15,23,42,0.05)] border border-[#c5c5d3]/30">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#00236f]/5 rounded-lg text-[#00236f]">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-lg text-[#0b1c30]">État du véhicule</h3>
              </div>
              <div className="flex items-center gap-4 text-xs text-[#444651]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00236f]" />
                  Au départ
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#757682]" />
                  Au retour
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Departure */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#00236f]" />
                  <h4 className="text-sm font-semibold text-[#0b1c30]">
                    Observations au départ
                  </h4>
                </div>
                <div className="space-y-2">
                  <ConditionDisplay condition={conditionStart} />
                </div>
              </div>

              {/* Return */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 rounded-full bg-[#757682]" />
                  <h4 className="text-sm font-semibold text-[#0b1c30]">
                    Observations au retour
                  </h4>
                </div>
                {contract.status === "ACTIVE" ? (
                  <div className="flex flex-col items-center justify-center py-10 px-6 border-2 border-dashed border-[#c5c5d3]/40 rounded-2xl bg-[#f8f9ff]/50">
                    <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mb-4 border border-[#c5c5d3]/20 shadow-sm">
                      <ClipboardCheck className="h-7 w-7 text-[#757682]" />
                    </div>
                    <p className="font-semibold text-[#444651] text-center">
                      Observations au retour
                    </p>
                    <p className="text-sm text-[#757682] text-center mt-2 max-w-[280px]">
                      Ces informations seront à renseigner lors de la clôture officielle du contrat.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <ConditionDisplay condition={conditionEnd} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Additional clauses */}
        {contract.terms && (
          <div className="col-span-12 bg-white rounded-xl p-6 shadow-[0px_4px_20px_rgba(15,23,42,0.05)] border border-[#c5c5d3]/30">
            <h3 className="font-semibold text-lg text-[#0b1c30] mb-4">Clauses additionnelles</h3>
            <p className="text-sm text-[#444651] whitespace-pre-wrap leading-relaxed">{contract.terms}</p>
          </div>
        )}
      </div>

      {/* Footer meta */}
      <div className="flex flex-col md:flex-row items-center justify-between text-xs text-[#757682] py-4 border-t border-[#c5c5d3]/20">
        <p>Créé le {formatDate(contract.createdAt)}</p>
        <p>Dernière modification : {formatDate(contract.updatedAt)}</p>
      </div>
    </div>
  )
}
