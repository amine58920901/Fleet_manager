"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createContractAction } from "@/actions/contract.actions"
import { VehicleConditionForm, type VehicleCondition } from "@/components/contracts/vehicle-condition"
import type { Vehicle, Driver } from "@prisma/client"

interface Prefill {
  quoteId: string
  vehicleId: string | null
  startDate: string
  endDate: string
  clientName: string
}

interface ContractFormProps {
  vehicles: Vehicle[]
  drivers: Driver[]
  prefill?: Prefill | null
}

export function ContractForm({ vehicles, drivers, prefill }: ContractFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [conditionStart, setConditionStart] = useState<VehicleCondition>({})

  const defaultVehicle = prefill?.vehicleId
    ? vehicles.find((v) => v.id === prefill.vehicleId) ?? null
    : null

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(defaultVehicle)

  function handleVehicleChange(vehicleId: string) {
    const v = vehicles.find((v) => v.id === vehicleId) ?? null
    setSelectedVehicle(v)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const fd = new FormData(e.currentTarget)
    const result = await createContractAction({
      startDate: new Date(fd.get("startDate") as string),
      endDate: new Date(fd.get("endDate") as string),
      vehicleId: fd.get("vehicleId") as string,
      driverId: fd.get("driverId") as string,
      depositAmount: fd.get("depositAmount") ? parseFloat(fd.get("depositAmount") as string) : undefined,
      mileageStart: fd.get("mileageStart") ? parseInt(fd.get("mileageStart") as string) : undefined,
      fuelLevelStart: (fd.get("fuelLevelStart") as string) || undefined,
      conditionStart: Object.keys(conditionStart).length > 0 ? conditionStart : undefined,
      terms: (fd.get("terms") as string) || undefined,
      quoteId: prefill?.quoteId,
      // Modalités financières
      paymentAmount: fd.get("paymentAmount") ? parseFloat(fd.get("paymentAmount") as string) : undefined,
      paymentTaxType: (fd.get("paymentTaxType") as string) || undefined,
      paymentDueDay: fd.get("paymentDueDay") ? parseInt(fd.get("paymentDueDay") as string) : undefined,
      paymentMethod: (fd.get("paymentMethod") as string) || undefined,
      depositReturnConditions: (fd.get("depositReturnConditions") as string) || undefined,
      // Forfait kilométrique
      mileageAllowance: fd.get("mileageAllowance") ? parseInt(fd.get("mileageAllowance") as string) : undefined,
      extraMileageCost: fd.get("extraMileageCost") ? parseFloat(fd.get("extraMileageCost") as string) : undefined,
      // Assurance & entretien
      insuranceFranchise: fd.get("insuranceFranchise") ? parseFloat(fd.get("insuranceFranchise") as string) : undefined,
      insuranceInfo: (fd.get("insuranceInfo") as string) || undefined,
      maintenanceInfo: (fd.get("maintenanceInfo") as string) || undefined,
      // Résiliation & restitution
      returnLocation: (fd.get("returnLocation") as string) || undefined,
      earlyTerminationConditions: (fd.get("earlyTerminationConditions") as string) || undefined,
    })

    setLoading(false)
    if (result.success) {
      toast.success("Contrat créé")
      router.push("/contracts")
    } else {
      toast.error(result.error)
    }
  }

  const availableVehicles = vehicles.filter(
    (v) => v.status === "AVAILABLE" || v.id === prefill?.vehicleId
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {prefill && (
        <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex items-start gap-3">
          <div className="text-green-600 mt-0.5">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-green-800">Contrat pré-rempli depuis le devis accepté</p>
            <p className="text-xs text-green-600 mt-0.5">Client : {prefill.clientName} · Les dates et le véhicule sont pré-sélectionnés. Assignez un chauffeur pour finaliser.</p>
          </div>
        </div>
      )}

      {/* Véhicule & Chauffeur */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Véhicule & Chauffeur</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Véhicule *</label>
            <select name="vehicleId" required
              defaultValue={prefill?.vehicleId ?? ""}
              onChange={(e) => handleVehicleChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">Sélectionner un véhicule</option>
              {availableVehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.brand} {v.model} · {v.licensePlate}
                </option>
              ))}
            </select>
            {availableVehicles.length === 0 && (
              <p className="text-xs text-orange-600 mt-1">Aucun véhicule disponible</p>
            )}
            {selectedVehicle && (
              <div className="mt-2 flex flex-wrap gap-x-3 text-xs text-gray-500">
                <span>Journalier : <strong>{Number(selectedVehicle.dailyRate).toFixed(2)} €</strong></span>
                {selectedVehicle.weeklyRate && <span>· Hebdo : <strong>{Number(selectedVehicle.weeklyRate).toFixed(2)} €</strong></span>}
                {selectedVehicle.monthlyRate && <span>· Mensuel : <strong>{Number(selectedVehicle.monthlyRate).toFixed(2)} €</strong></span>}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chauffeur *</label>
            <select name="driverId" required
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">Sélectionner un chauffeur</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.firstName} {d.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Période */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Période</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de début *</label>
            <input name="startDate" type="date" required
              defaultValue={prefill?.startDate}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin *</label>
            <input name="endDate" type="date" required
              defaultValue={prefill?.endDate}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      {/* Modalités financières */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Modalités financières</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Montant de la mensualité</label>
            <div className="flex gap-2">
              <input name="paymentAmount" type="number" step="0.01" placeholder="Ex : 850.00"
                className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <select name="paymentTaxType" defaultValue="TTC"
                className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="TTC">TTC</option>
                <option value="HT">HT</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date d&apos;échéance (jour du mois)</label>
            <input name="paymentDueDay" type="number" min="1" max="31" placeholder="Ex : 5"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mode de règlement</label>
            <select name="paymentMethod"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">—</option>
              <option value="Virement bancaire">Virement bancaire</option>
              <option value="Prélèvement automatique">Prélèvement automatique</option>
              <option value="Chèque">Chèque</option>
              <option value="Espèces">Espèces</option>
              <option value="Carte bancaire">Carte bancaire</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Caution (€)</label>
            <input name="depositAmount" type="number" step="0.01"
              defaultValue={selectedVehicle?.depositAmount ? Number(selectedVehicle.depositAmount) : ""}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {selectedVehicle?.depositAmount && (
              <p className="text-xs text-blue-600 mt-1">Suggérée : {Number(selectedVehicle.depositAmount).toFixed(2)} €</p>
            )}
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Conditions de restitution de la caution</label>
          <textarea name="depositReturnConditions" rows={2} placeholder="Ex : La caution sera restituée dans les 30 jours suivant la restitution du véhicule, sous réserve de l'absence de dommages..."
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>
      </div>

      {/* État du véhicule au départ */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">État du véhicule au départ</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kilométrage départ</label>
            <input name="mileageStart" type="number"
              defaultValue={selectedVehicle?.mileage ?? ""}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Niveau carburant</label>
            <select name="fuelLevelStart"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="">—</option>
              <option value="Plein">Plein</option>
              <option value="3/4">3/4</option>
              <option value="1/2">1/2</option>
              <option value="1/4">1/4</option>
              <option value="Vide">Vide</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Forfait kilométrique inclus (km)</label>
            <input name="mileageAllowance" type="number" placeholder="Ex : 7000"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Coût km supplémentaire (€/km)</label>
            <input name="extraMileageCost" type="number" step="0.01" placeholder="Ex : 0.25"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-1">Dommages existants</p>
          <p className="text-xs text-gray-400 mb-3">Cliquez sur une zone pour signaler un dommage avant le départ.</p>
          <VehicleConditionForm value={conditionStart} onChange={setConditionStart} />
        </div>
      </div>

      {/* Assurance & entretien */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Assurance & entretien</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Franchise en cas de sinistre (€)</label>
            <input name="insuranceFranchise" type="number" step="0.01" placeholder="Ex : 500"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Détails assurance</label>
            <textarea name="insuranceInfo" rows={2} placeholder="Ex : Véhicule assuré par le loueur tous risques. Franchise de 500 € à la charge du locataire en cas d'accident responsable ou de vol."
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entretien & réparations</label>
            <textarea name="maintenanceInfo" rows={2} placeholder="Ex : Les révisions, vidanges et remplacement des pneus sont à la charge du loueur. Les dommages liés à une mauvaise utilisation restent à la charge du locataire."
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
        </div>
      </div>

      {/* Résiliation & restitution */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Résiliation & restitution</h2>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lieu de restitution</label>
            <input name="returnLocation" type="text" placeholder="Ex : Agence principale — 12 rue des Lilas, Paris 75001"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Conditions de résiliation anticipée</label>
            <textarea name="earlyTerminationConditions" rows={3} placeholder="Ex : En cas de résiliation anticipée, le locataire s'engage à verser une indemnité équivalente à 2 mensualités restantes..."
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
        </div>
      </div>

      {/* Clauses additionnelles */}
      <div className="bg-white rounded-xl border p-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Clauses additionnelles</label>
        <textarea name="terms" rows={4} placeholder="Toute clause complémentaire..."
          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
      </div>

      <button type="submit" disabled={loading}
        className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
        {loading ? "Création..." : "Créer le contrat"}
      </button>
    </form>
  )
}
