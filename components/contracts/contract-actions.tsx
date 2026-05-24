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
      <div className="flex items-center gap-3 flex-wrap">
        {contract.status === "ACTIVE" && (
          <button
            onClick={() => setShowClose(true)}
            className="px-4 py-2.5 bg-[#00236f]/5 text-[#00236f] border border-[#00236f]/20 rounded-lg text-sm font-semibold hover:bg-[#00236f]/10 transition-all active:scale-95"
          >
            Clôturer
          </button>
        )}
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
        >
          Supprimer
        </button>
      </div>

      {showClose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
              <div>
                <h2 className="font-semibold text-[#0b1c30]">Clôturer le contrat</h2>
                <p className="text-sm text-[#444651] mt-0.5">
                  {contract.vehicle.brand} {contract.vehicle.model} · {contract.number}
                </p>
              </div>
              <button
                onClick={() => setShowClose(false)}
                className="text-[#757682] hover:text-[#0b1c30] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-[#0b1c30] mb-3">
                  Kilométrage & carburant au retour
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#444651] mb-1">
                      Kilométrage retour *
                    </label>
                    <input
                      type="number"
                      placeholder="Ex : 45 000"
                      value={mileageEnd}
                      onChange={(e) => setMileageEnd(e.target.value)}
                      className="w-full px-3 py-2 border border-[#c5c5d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00236f]/30 focus:border-[#00236f]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#444651] mb-1">
                      Niveau carburant
                    </label>
                    <select
                      value={fuelEnd}
                      onChange={(e) => setFuelEnd(e.target.value)}
                      className="w-full px-3 py-2 border border-[#c5c5d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00236f]/30 bg-white"
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

              {conditionStart && Object.keys(conditionStart).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-[#0b1c30] mb-3">
                    Dommages enregistrés au départ
                  </h3>
                  <ConditionDisplay condition={conditionStart} />
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-[#0b1c30] mb-1">
                  État du véhicule au retour
                </h3>
                <p className="text-xs text-[#757682] mb-3">
                  Signalez tout nouveau dommage constaté lors de la restitution.
                </p>
                <VehicleConditionForm value={conditionEnd} onChange={setConditionEnd} />
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t shrink-0">
              <button
                onClick={handleClose}
                disabled={loading}
                className="flex-1 bg-[#006c49] text-white py-2.5 rounded-lg font-semibold hover:bg-[#005236] disabled:opacity-50 transition-colors"
              >
                {loading ? "Clôture en cours..." : "Confirmer la clôture"}
              </button>
              <button
                onClick={() => setShowClose(false)}
                className="px-6 py-2.5 border border-[#c5c5d3] rounded-lg text-sm font-semibold hover:bg-[#f8f9ff] transition-colors"
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
