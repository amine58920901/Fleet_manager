"use client"

import { useState } from "react"
import { LayoutGrid, List, X, Car, ExternalLink, Trash2 } from "lucide-react"
import { VehicleStatusBadge } from "./vehicle-status-badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { Vehicle, Contract, Driver } from "@prisma/client"
import Link from "next/link"

type VehicleWithContracts = Vehicle & {
  contracts: (Contract & { driver: Driver })[]
}

export function VehiclesGrid({ vehicles: initial }: { vehicles: VehicleWithContracts[] }) {
  const [vehicles, setVehicles] = useState(initial)
  const [view, setView] = useState<"grid" | "list">("grid")
  const [selected, setSelected] = useState<VehicleWithContracts | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  async function handleDelete(vehicle: VehicleWithContracts) {
    if (!confirm(`Supprimer le véhicule ${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate}) ? Cette action est irréversible.`)) return

    setDeleting(true)
    setDeleteError("")
    const res = await fetch(`/api/vehicles/${vehicle.id}`, { method: "DELETE" })
    setDeleting(false)

    if (res.ok) {
      setVehicles((prev) => prev.filter((v) => v.id !== vehicle.id))
      setSelected(null)
    } else {
      const data = await res.json()
      setDeleteError(data.error ?? "Erreur serveur")
    }
  }

  return (
    <>
      {/* Toggle */}
      <div className="flex justify-end mb-4">
        <div className="flex items-center gap-0.5 bg-gray-900 rounded-xl p-1">
          <button
            onClick={() => setView("list")}
            className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
              view === "list" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("grid")}
            className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
              view === "grid" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid */}
      {view === "grid" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
          {vehicles.map((v) => (
            <button key={v.id} onClick={() => { setSelected(v); setDeleteError("") }} className="text-left group">
              <div className="bg-white rounded-xl border p-4 hover:shadow-md hover:border-blue-200 transition-all h-full">
                <div className="flex items-start justify-between mb-2">
                  <div className="p-1.5 bg-blue-50 rounded-lg">
                    <Car className="h-4 w-4 text-blue-600" />
                  </div>
                  <VehicleStatusBadge status={v.status} />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mt-2 leading-tight">
                  {v.brand} {v.model}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">{v.year} · {v.licensePlate}</p>
                <div className="mt-3 pt-3 border-t flex items-center justify-between">
                  <span className="text-xs text-gray-400">{v.mileage.toLocaleString("fr-FR")} km</span>
                  <span className="text-sm font-semibold text-blue-600">{formatCurrency(Number(v.dailyRate))}/j</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {view === "list" && (
        <div className="bg-white rounded-xl border divide-y">
          {vehicles.map((v) => (
            <button
              key={v.id}
              onClick={() => { setSelected(v); setDeleteError("") }}
              className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                <Car className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">{v.brand} {v.model}</p>
                <p className="text-xs text-gray-400">{v.year} · {v.licensePlate} · {v.mileage.toLocaleString("fr-FR")} km</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-semibold text-blue-600">{formatCurrency(Number(v.dailyRate))}/j</p>
                {v.monthlyRate && (
                  <p className="text-xs text-gray-400">{formatCurrency(Number(v.monthlyRate))}/mois</p>
                )}
              </div>
              <VehicleStatusBadge status={v.status} />
            </button>
          ))}
        </div>
      )}

      {/* Modal détails */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-2 px-4 sm:px-6 py-4 border-b shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                  <Car className="h-5 w-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-semibold text-gray-900 truncate">{selected.brand} {selected.model}</h2>
                    <VehicleStatusBadge status={selected.status} />
                  </div>
                  <p className="text-sm text-gray-500 truncate">{selected.year} · {selected.licensePlate}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/vehicles/${selected.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Modifier</span>
                </Link>
                <button
                  onClick={() => handleDelete(selected)}
                  disabled={deleting}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  aria-label="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelected(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="overflow-y-auto p-6 space-y-6">
              {deleteError && (
                <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">
                  {deleteError}
                </div>
              )}

              {/* Informations */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Informations</h3>
                <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { label: "Marque", value: selected.brand },
                    { label: "Modèle", value: selected.model },
                    { label: "Année", value: String(selected.year) },
                    { label: "Couleur", value: selected.color ?? "—" },
                    { label: "Immatriculation", value: selected.licensePlate },
                    { label: "VIN", value: selected.vin ?? "—" },
                    { label: "Kilométrage", value: `${selected.mileage.toLocaleString("fr-FR")} km` },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <dt className="text-xs text-gray-400 mb-0.5">{label}</dt>
                      <dd className="text-sm font-medium text-gray-900">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Tarifs */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Tarifs</h3>
                <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <dt className="text-xs text-gray-400 mb-0.5">Journalier</dt>
                    <dd className="text-sm font-semibold text-blue-600">{formatCurrency(Number(selected.dailyRate))}</dd>
                  </div>
                  {selected.weeklyRate && (
                    <div>
                      <dt className="text-xs text-gray-400 mb-0.5">Hebdomadaire</dt>
                      <dd className="text-sm font-medium text-gray-900">{formatCurrency(Number(selected.weeklyRate))}</dd>
                    </div>
                  )}
                  {selected.monthlyRate && (
                    <div>
                      <dt className="text-xs text-gray-400 mb-0.5">Mensuel</dt>
                      <dd className="text-sm font-medium text-gray-900">{formatCurrency(Number(selected.monthlyRate))}</dd>
                    </div>
                  )}
                  {selected.depositAmount && (
                    <div>
                      <dt className="text-xs text-gray-400 mb-0.5">Caution</dt>
                      <dd className="text-sm font-medium text-gray-900">{formatCurrency(Number(selected.depositAmount))}</dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Notes */}
              {selected.notes && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Notes</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selected.notes}</p>
                </div>
              )}

              {/* Derniers contrats */}
              {selected.contracts.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Derniers contrats</h3>
                  <div className="space-y-0 divide-y rounded-xl border overflow-hidden">
                    {selected.contracts.map((c) => (
                      <div key={c.id} className="flex items-center justify-between px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{c.number}</p>
                          <p className="text-xs text-gray-400">
                            {c.driver.firstName} {c.driver.lastName} · {formatDate(c.startDate)} → {formatDate(c.endDate)}
                          </p>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          c.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                          c.status === "COMPLETED" ? "bg-gray-100 text-gray-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {c.status === "ACTIVE" ? "Actif" : c.status === "COMPLETED" ? "Terminé" : "Annulé"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="px-6 pb-6 shrink-0">
                <button
                  onClick={() => setSelected(null)}
                  className="w-full py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
