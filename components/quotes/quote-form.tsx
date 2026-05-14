"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createQuoteAction } from "@/actions/quote.actions"
import { VehicleSearch } from "@/components/quotes/vehicle-search"
import type { Vehicle } from "@prisma/client"

interface QuoteFormProps {
  vehicles: Vehicle[]
}

type RateType = "DAILY" | "WEEKLY" | "MONTHLY"
type DiscountType = "PERCENT" | "FIXED"
type BillingMode = "FULL" | "MONTHLY"

interface DurationBreakdown {
  months: number
  weeks: number
  days: number
  totalDays: number
}

function getDuration(start: Date, end: Date): DurationBreakdown {
  const totalDays = Math.max(0, Math.ceil((end.getTime() - start.getTime()) / 86400000))
  const months = Math.floor(totalDays / 30)
  const weeks = Math.floor((totalDays % 30) / 7)
  const days = totalDays % 7
  return { months, weeks, days, totalDays }
}

function calcSubtotal(vehicle: Vehicle, rateType: RateType, duration: DurationBreakdown): number {
  const daily = Number(vehicle.dailyRate)
  const weekly = vehicle.weeklyRate ? Number(vehicle.weeklyRate) : daily * 7
  const monthly = vehicle.monthlyRate ? Number(vehicle.monthlyRate) : daily * 30

  if (rateType === "DAILY") return duration.totalDays * daily
  if (rateType === "WEEKLY") {
    const totalWeeks = Math.floor(duration.totalDays / 7)
    const remDays = duration.totalDays % 7
    return totalWeeks * weekly + remDays * daily
  }
  // MONTHLY
  const totalMonths = Math.floor(duration.totalDays / 30)
  const remDays = duration.totalDays % 30
  return totalMonths * monthly + remDays * daily
}

export function QuoteForm({ vehicles }: QuoteFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Véhicule
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [rateType, setRateType] = useState<RateType>("DAILY")

  // Dates
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [duration, setDuration] = useState<DurationBreakdown>({ months: 0, weeks: 0, days: 0, totalDays: 0 })

  // Remise
  const [discountType, setDiscountType] = useState<DiscountType>("PERCENT")
  const [discountValue, setDiscountValue] = useState(0)

  // Facturation
  const [billingMode, setBillingMode] = useState<BillingMode>("FULL")

  // TVA
  const taxRate = 20

  // Calculs
  const subtotal = selectedVehicle && duration.totalDays > 0 ? calcSubtotal(selectedVehicle, rateType, duration) : 0
  const discountAmount = discountType === "PERCENT" ? subtotal * (discountValue / 100) : Math.min(discountValue, subtotal)
  const taxBase = subtotal - discountAmount
  const taxAmount = taxBase * (taxRate / 100)
  const total = taxBase + taxAmount

  // LLD : mensualité
  const totalInstallments = billingMode === "MONTHLY" && duration.totalDays > 0
    ? Math.max(1, Math.ceil(duration.totalDays / 30))
    : undefined
  const installmentSubtotal = totalInstallments ? subtotal / totalInstallments : undefined
  const installmentDiscount = totalInstallments && discountAmount > 0 ? discountAmount / totalInstallments : undefined
  const installmentTaxBase = installmentSubtotal !== undefined ? installmentSubtotal - (installmentDiscount ?? 0) : undefined
  const installmentTax = installmentTaxBase !== undefined ? installmentTaxBase * (taxRate / 100) : undefined
  const installmentAmount = installmentTaxBase !== undefined && installmentTax !== undefined
    ? installmentTaxBase + installmentTax
    : undefined

  useEffect(() => {
    if (startDate && endDate) {
      const s = new Date(startDate)
      const e = new Date(endDate)
      if (e > s) setDuration(getDuration(s, e))
      else setDuration({ months: 0, weeks: 0, days: 0, totalDays: 0 })
    }
  }, [startDate, endDate])

  function handleVehicleChange(id: string) {
    const v = vehicles.find((v) => v.id === id) ?? null
    setSelectedVehicle(v)
    setRateType("DAILY")
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedVehicle) return toast.error("Sélectionnez un véhicule")
    if (duration.totalDays <= 0) return toast.error("La date de fin doit être après la date de début")

    setLoading(true)
    const fd = new FormData(e.currentTarget)

    const result = await createQuoteAction({
      clientName: fd.get("clientName") as string,
      clientEmail: fd.get("clientEmail") as string || undefined,
      clientPhone: fd.get("clientPhone") as string || undefined,
      clientAddress: fd.get("clientAddress") as string || undefined,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      vehicleId: selectedVehicle.id,
      vehicleDesc: `${selectedVehicle.brand} ${selectedVehicle.model} (${selectedVehicle.licensePlate})`,
      dailyRate: Number(selectedVehicle.dailyRate),
      days: duration.totalDays,
      rateType,
      subtotal,
      discountType,
      discountValue,
      discountAmount,
      taxRate,
      taxAmount,
      total,
      billingMode,
      installmentAmount,
      totalInstallments,
      notes: fd.get("notes") as string || undefined,
      validUntil: fd.get("validUntil") ? new Date(fd.get("validUntil") as string) : undefined,
    })

    setLoading(false)
    if (result.success) {
      toast.success("Devis créé")
      router.push("/quotes")
    } else {
      toast.error(result.error)
    }
  }

  const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n)

  const availableRates = selectedVehicle ? [
    { value: "DAILY" as RateType, label: "Journalier", rate: Number(selectedVehicle.dailyRate), unit: "/ jour" },
    ...(selectedVehicle.weeklyRate ? [{ value: "WEEKLY" as RateType, label: "Hebdomadaire", rate: Number(selectedVehicle.weeklyRate), unit: "/ semaine" }] : []),
    ...(selectedVehicle.monthlyRate ? [{ value: "MONTHLY" as RateType, label: "Mensuel", rate: Number(selectedVehicle.monthlyRate), unit: "/ mois" }] : []),
  ] : []

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* CLIENT */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Client</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du client *</label>
            <input name="clientName" required className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input name="clientEmail" type="email" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input name="clientPhone" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
            <input name="clientAddress" className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      {/* VÉHICULE */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Véhicule</h2>

        {vehicles.length === 0 ? (
          <p className="text-sm text-gray-400">Aucun véhicule enregistré. <a href="/vehicles/new" className="text-blue-600 underline">Ajouter un véhicule</a></p>
        ) : (
          <>
            <VehicleSearch
              vehicles={vehicles}
              value={selectedVehicle}
              onChange={(v) => {
                setSelectedVehicle(v)
                setRateType("DAILY")
              }}
            />

            {/* Type de tarif */}
            {selectedVehicle && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de tarif</label>
                <div className="flex gap-3 flex-wrap">
                  {availableRates.map((r) => (
                    <button key={r.value} type="button"
                      onClick={() => setRateType(r.value)}
                      className={`flex-1 min-w-[120px] border rounded-lg px-4 py-3 text-left transition-all ${rateType === r.value ? "border-blue-500 bg-blue-50" : "hover:border-gray-300"}`}>
                      <div className="text-sm font-medium text-gray-900">{r.label}</div>
                      <div className="text-xs text-blue-600 font-semibold">{fmt(r.rate)} <span className="text-gray-400 font-normal">{r.unit}</span></div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* PÉRIODE */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Période de location</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de début *</label>
            <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin *</label>
            <input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valide jusqu&apos;au</label>
            <input name="validUntil" type="date"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        {duration.totalDays > 0 && (
          <div className="mt-4 flex gap-3">
            {duration.months > 0 && (
              <div className="flex-1 bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-gray-900">{duration.months}</div>
                <div className="text-xs text-gray-500">mois</div>
              </div>
            )}
            {duration.weeks > 0 && (
              <div className="flex-1 bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-gray-900">{duration.weeks}</div>
                <div className="text-xs text-gray-500">semaine{duration.weeks > 1 ? "s" : ""}</div>
              </div>
            )}
            <div className="flex-1 bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">{duration.days}</div>
              <div className="text-xs text-gray-500">jour{duration.days > 1 ? "s" : ""}</div>
            </div>
            <div className="flex-1 bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
              <div className="text-2xl font-bold text-blue-600">{duration.totalDays}</div>
              <div className="text-xs text-blue-400">jours total</div>
            </div>
          </div>
        )}
      </div>

      {/* REMISE */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Remise</h2>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Valeur de la remise</label>
            <input type="number" step="0.01" min="0" value={discountValue || ""}
              onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <div className="flex border rounded-lg overflow-hidden">
              <button type="button"
                onClick={() => setDiscountType("PERCENT")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${discountType === "PERCENT" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                %
              </button>
              <button type="button"
                onClick={() => setDiscountType("FIXED")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${discountType === "FIXED" ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
                €
              </button>
            </div>
          </div>
        </div>
        {discountAmount > 0 && (
          <p className="mt-2 text-sm text-green-600">
            Remise appliquée : <strong>- {fmt(discountAmount)}</strong>
            {discountType === "PERCENT" && ` (${discountValue}%)`}
          </p>
        )}
      </div>

      {/* MODE DE FACTURATION */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-1">Mode de facturation</h2>
        <p className="text-xs text-gray-400 mb-4">Choisissez comment facturer ce contrat</p>
        <div className="flex gap-3">
          <button type="button"
            onClick={() => setBillingMode("FULL")}
            className={`flex-1 border rounded-xl px-4 py-4 text-left transition-all ${billingMode === "FULL" ? "border-blue-500 bg-blue-50" : "hover:border-gray-300"}`}>
            <div className="font-semibold text-gray-900 text-sm">Totalité</div>
            <div className="text-xs text-gray-400 mt-0.5">Une seule facture pour la durée complète</div>
          </button>
          <button type="button"
            onClick={() => setBillingMode("MONTHLY")}
            className={`flex-1 border rounded-xl px-4 py-4 text-left transition-all ${billingMode === "MONTHLY" ? "border-blue-500 bg-blue-50" : "hover:border-gray-300"}`}>
            <div className="font-semibold text-gray-900 text-sm">Mensuelle (LLD)</div>
            <div className="text-xs text-gray-400 mt-0.5">Une facture par mois sur la durée du contrat</div>
          </button>
        </div>
        {billingMode === "MONTHLY" && totalInstallments && installmentAmount !== undefined && (
          <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-blue-900">{totalInstallments} mensualités</div>
                <div className="text-xs text-blue-500 mt-0.5">1 facture par mois générée manuellement</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-blue-700">{fmt(installmentAmount)}</div>
                <div className="text-xs text-blue-400">/ mois TTC</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RÉCAPITULATIF */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">
          {billingMode === "MONTHLY" ? "Récapitulatif du contrat" : "Récapitulatif"}
        </h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Sous-total HT</span>
            <span>{fmt(subtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Remise</span>
              <span>- {fmt(discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-500">
            <span>Base imposable HT</span>
            <span>{fmt(taxBase)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>TVA ({taxRate}%)</span>
            <span>{fmt(taxAmount)}</span>
          </div>
          <div className="flex justify-between font-bold text-base pt-3 border-t">
            <span>Total TTC {billingMode === "MONTHLY" && totalInstallments ? `(${totalInstallments} mois)` : ""}</span>
            <span className="text-blue-600">{fmt(total)}</span>
          </div>
          {billingMode === "MONTHLY" && installmentAmount !== undefined && (
            <div className="flex justify-between font-semibold text-sm pt-2 border-t border-dashed text-blue-700">
              <span>Mensualité TTC</span>
              <span>{fmt(installmentAmount)} / mois</span>
            </div>
          )}
        </div>
      </div>

      {/* NOTES */}
      <div className="bg-white rounded-xl border p-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea name="notes" rows={3}
          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
      </div>

      <button type="submit" disabled={loading || !selectedVehicle || duration.totalDays <= 0}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
        {loading ? "Création..." : "Créer le devis"}
      </button>
    </form>
  )
}
