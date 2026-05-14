"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"
import { closeContractAction, deleteContractAction } from "@/actions/contract.actions"
import {
  VehicleConditionForm,
  ConditionDisplay,
  type VehicleCondition,
} from "@/components/contracts/vehicle-condition"
import type { ContractWithRelations } from "@/types"

export function ContractActions({ contract }: { contract: ContractWithRelations }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showClose, setShowClose] = useState(false)
  const [mileageEnd, setMileageEnd] = useState("")
  const [fuelEnd, setFuelEnd] = useState("")
  const [conditionEnd, setConditionEnd] = useState<VehicleCondition>({})

  const conditionStart = contract.conditionStart as VehicleCondition | null

  async function handleClose() {
    if (!mileageEnd) return toast.error("Kilométrage retour requis")
    setLoading(true)
    const result = await closeContractAction(
      contract.id,
      parseInt(mileageEnd),
      fuelEnd,
      Object.keys(conditionEnd).length > 0 ? conditionEnd : undefined
    )
    setLoading(false)
    if (result.success) {
      toast.success("Contrat clôturé")
      setShowClose(false)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  async function handleDelete() {
    if (!confirm("Supprimer ce contrat ?")) return
    setLoading(true)
    const result = await deleteContractAction(contract.id)
    setLoading(false)
    if (result.success) {
      toast.success("Contrat supprimé")
      router.push("/contracts")
    } else {
      toast.error(result.error)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {contract.status === "ACTIVE" && (
          <button
            onClick={() => setShowClose(true)}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Clôturer
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
        >
          Supprimer
        </button>
      </div>

      {showClose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
              <div>
                <h2 className="font-semibold text-gray-900">Clôturer le contrat</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {contract.vehicle.brand} {contract.vehicle.model} · {contract.number}
                </p>
              </div>
              <button
                onClick={() => setShowClose(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto p-6 space-y-6">

              {/* Km + carburant */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Kilométrage & carburant au retour</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Kilométrage retour *</label>
                    <input
                      type="number"
                      placeholder="Ex : 45 000"
                      value={mileageEnd}
                      onChange={(e) => setMileageEnd(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Niveau carburant</label>
                    <select
                      value={fuelEnd}
                      onChange={(e) => setFuelEnd(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">—</option>
                      <option>Plein</option>
                      <option>3/4</option>
                      <option>1/2</option>
                      <option>1/4</option>
                      <option>Vide</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Dommages départ (lecture seule) */}
              {conditionStart && Object.keys(conditionStart).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Dommages enregistrés au départ
                  </h3>
                  <ConditionDisplay condition={conditionStart} />
                </div>
              )}

              {/* État retour */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">État du véhicule au retour</h3>
                <p className="text-xs text-gray-400 mb-3">
                  Signalez tout nouveau dommage constaté lors de la restitution.
                </p>
                <VehicleConditionForm value={conditionEnd} onChange={setConditionEnd} />
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 border-t shrink-0">
              <button
                onClick={handleClose}
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Clôture en cours..." : "Confirmer la clôture"}
              </button>
              <button
                onClick={() => setShowClose(false)}
                className="px-6 py-2.5 border rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
