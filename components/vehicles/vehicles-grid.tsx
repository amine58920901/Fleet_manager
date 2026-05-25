"use client"

import { useState, useEffect } from "react"
import { Gauge, Calendar, Wrench, ExternalLink, Trash2, Search, Car, LayoutGrid, List } from "lucide-react"
import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Pagination } from "@/components/ui/pagination"
import type { Vehicle, Contract, Driver } from "@prisma/client"

type VehicleWithContracts = Vehicle & {
  contracts: (Contract & { driver: Driver })[]
}

const statusConfig = {
  AVAILABLE: {
    label: "Disponible",
    className: "bg-[#006c49]/10 text-[#006c49] border border-[#006c49]/20 backdrop-blur-sm",
  },
  RENTED: {
    label: "En location",
    className: "bg-[#1e3a8a] text-[#90a8ff] border border-[#90a8ff]/20 backdrop-blur-sm",
  },
  MAINTENANCE: {
    label: "En réparation",
    className: "bg-red-100 text-red-600 border border-red-200 backdrop-blur-sm",
  },
  OUT_OF_SERVICE: {
    label: "Hors service",
    className: "bg-gray-100 text-gray-500 border border-gray-200 backdrop-blur-sm",
  },
}

function VehicleCard({
  vehicle,
  onRemove,
}: {
  vehicle: VehicleWithContracts
  onRemove: (id: string) => void
}) {
  const [deleting, setDeleting] = useState(false)

  const status = statusConfig[vehicle.status]
  const activeContract = vehicle.contracts.find((c) => c.status === "ACTIVE")

  let secondStat: { label: string; value: string; isError?: boolean }
  if (vehicle.status === "RENTED" && activeContract) {
    secondStat = { label: "Retour", value: formatDate(activeContract.endDate) }
  } else if (vehicle.status === "MAINTENANCE") {
    secondStat = { label: "État", value: "Maintenance", isError: true }
  } else if (vehicle.status === "OUT_OF_SERVICE") {
    secondStat = { label: "État", value: "Hors service" }
  } else {
    secondStat = { label: "Année", value: String(vehicle.year) }
  }

  async function handleDelete() {
    if (
      !confirm(
        `Supprimer ${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate}) ? Cette action est irréversible.`
      )
    )
      return
    setDeleting(true)
    const res = await fetch(`/api/vehicles/${vehicle.id}`, { method: "DELETE" })
    setDeleting(false)
    if (res.ok) {
      onRemove(vehicle.id)
    } else {
      const data = await res.json()
      alert(data.error ?? "Erreur lors de la suppression")
    }
  }

  return (
    <div className="vehicle-card bg-white rounded-2xl overflow-hidden border border-[#c5c5d3]/30 group">
      {/* Image area */}
      <div className="relative h-48 overflow-hidden">
        {vehicle.imageUrl ? (
          <img
            src={vehicle.imageUrl}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#dce1ff] to-[#b6c4ff]/50">
            <span className="text-6xl font-extrabold text-[#00236f]/15 leading-none select-none">
              {vehicle.brand[0]}
            </span>
            <Car className="h-10 w-10 text-[#00236f]/25 -mt-2" />
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${status.className}`}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Title row */}
        <div>
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-semibold text-lg leading-tight text-[#0b1c30]">
              {vehicle.brand} {vehicle.model}
            </h3>
            <span className="bg-[#e5eeff] px-2 py-0.5 rounded-lg text-xs font-semibold text-[#444651] shrink-0">
              {vehicle.year}
            </span>
          </div>
          <p className="text-sm text-[#757682] mt-0.5">{vehicle.licensePlate}</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 border-y border-[#c5c5d3]/20 py-4">
          <div className="flex items-center gap-2 min-w-0">
            <Gauge className="h-5 w-5 text-[#757682] shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-[#444651] uppercase font-bold tracking-wider">
                Kilométrage
              </p>
              <p className="text-sm font-semibold text-[#0b1c30] truncate">
                {vehicle.mileage.toLocaleString("fr-FR")} km
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            {secondStat.isError ? (
              <Wrench className="h-5 w-5 text-red-500 shrink-0" />
            ) : (
              <Calendar className="h-5 w-5 text-[#757682] shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-[10px] text-[#444651] uppercase font-bold tracking-wider">
                {secondStat.label}
              </p>
              <p
                className={`text-sm font-semibold truncate ${
                  secondStat.isError ? "text-red-500" : "text-[#0b1c30]"
                }`}
              >
                {secondStat.value}
              </p>
            </div>
          </div>
        </div>

        {/* Daily rate */}
        <div>
          <p className="text-[10px] text-[#444651] uppercase font-bold tracking-wider">
            Tarif journalier
          </p>
          <p className="text-2xl font-bold text-[#00236f] leading-none mt-1">
            {formatCurrency(Number(vehicle.dailyRate))}
            <span className="text-sm font-normal text-[#757682] ml-1">/jour</span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Link
            href={`/vehicles/${vehicle.id}`}
            className="flex-1 h-10 flex items-center justify-center gap-2 bg-[#dce1ff] text-[#00236f] text-xs font-semibold rounded-lg hover:bg-[#b6c4ff]/50 transition-all"
          >
            <ExternalLink className="h-4 w-4" />
            Détails
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 border border-[#c5c5d3] text-[#757682] rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all disabled:opacity-50"
            aria-label="Supprimer"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

function VehicleRow({ vehicle, onRemove }: { vehicle: VehicleWithContracts; onRemove: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false)
  const status = statusConfig[vehicle.status]
  const activeContract = vehicle.contracts.find((c) => c.status === "ACTIVE")

  async function handleDelete() {
    if (!confirm(`Supprimer ${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate}) ?`)) return
    setDeleting(true)
    const res = await fetch(`/api/vehicles/${vehicle.id}`, { method: "DELETE" })
    setDeleting(false)
    if (res.ok) {
      onRemove(vehicle.id)
    } else {
      const data = await res.json()
      alert(data.error ?? "Erreur lors de la suppression")
    }
  }

  return (
    <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#f8f9ff] transition-colors border-b border-[#c5c5d3]/20 last:border-0">
      {/* Thumbnail */}
      <div className="w-14 h-10 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-[#dce1ff] to-[#b6c4ff]/50 flex items-center justify-center">
        {vehicle.imageUrl ? (
          <img src={vehicle.imageUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <Car className="h-5 w-5 text-[#00236f]/30" />
        )}
      </div>
      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-[#0b1c30] truncate">
          {vehicle.brand} {vehicle.model}
        </p>
        <p className="text-xs text-[#757682]">{vehicle.licensePlate} · {vehicle.year}</p>
      </div>
      {/* Status */}
      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase shrink-0 hidden sm:inline ${status.className}`}>
        {status.label}
      </span>
      {/* Mileage */}
      <div className="hidden md:flex items-center gap-1.5 text-sm text-[#444651] shrink-0">
        <Gauge className="h-4 w-4 text-[#757682]" />
        {vehicle.mileage.toLocaleString("fr-FR")} km
      </div>
      {/* Return date if rented */}
      {vehicle.status === "RENTED" && activeContract && (
        <div className="hidden lg:flex items-center gap-1.5 text-sm text-[#444651] shrink-0">
          <Calendar className="h-4 w-4 text-[#757682]" />
          {formatDate(activeContract.endDate)}
        </div>
      )}
      {/* Daily rate */}
      <p className="font-bold text-[#00236f] shrink-0 hidden sm:block">
        {formatCurrency(Number(vehicle.dailyRate))}<span className="text-xs font-normal text-[#757682]">/j</span>
      </p>
      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Link
          href={`/vehicles/${vehicle.id}`}
          className="p-2 text-[#757682] hover:text-[#00236f] hover:bg-[#dce1ff] rounded-lg transition-all"
          aria-label="Voir détails"
        >
          <ExternalLink className="h-4 w-4" />
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="p-2 text-[#757682] hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
          aria-label="Supprimer"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function VehiclesGrid({ vehicles: initial }: { vehicles: VehicleWithContracts[] }) {
  const [vehicles, setVehicles] = useState(initial)
  const [view, setView] = useState<"grid" | "list">("grid")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    const update = () => setPerPage(mq.matches ? 5 : 10)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  const filtered = search.trim()
    ? vehicles.filter((v) =>
        `${v.brand} ${v.model} ${v.licensePlate} ${v.color ?? ""}`.toLowerCase().includes(search.toLowerCase())
      )
    : vehicles

  const totalPages = Math.ceil(filtered.length / perPage)
  const safePage = Math.min(page, Math.max(1, totalPages))
  const paginated = filtered.slice((safePage - 1) * perPage, safePage * perPage)

  function removeVehicle(id: string) {
    setVehicles((prev) => prev.filter((v) => v.id !== id))
  }

  function handleSearch(value: string) {
    setSearch(value)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-[#c5c5d3]/30 flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#757682]" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Rechercher par marque, modèle, plaque…"
            className="w-full h-11 pl-10 pr-4 bg-[#f8f9ff] border border-[#c5c5d3] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00236f]/20 focus:border-[#00236f] text-[#0b1c30] placeholder:text-[#757682] transition-all"
          />
        </div>
        {/* View toggle */}
        <div className="flex items-center gap-1 bg-[#0b1c30] rounded-xl p-1 shrink-0">
          <button
            onClick={() => setView("list")}
            className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
              view === "list" ? "bg-[#00236f] text-white" : "text-[#757682] hover:text-white"
            }`}
            aria-label="Vue liste"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("grid")}
            className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
              view === "grid" ? "bg-[#00236f] text-white" : "text-[#757682] hover:text-white"
            }`}
            aria-label="Vue grille"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16 text-[#444651]">
          <Car className="h-12 w-12 mx-auto mb-3 text-[#c5c5d3]" />
          <p className="text-base font-medium">
            {search ? "Aucun véhicule trouvé pour cette recherche" : "Aucun véhicule"}
          </p>
        </div>
      )}

      {/* Grid view */}
      {view === "grid" && filtered.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginated.map((v) => (
              <VehicleCard key={v.id} vehicle={v} onRemove={removeVehicle} />
            ))}
          </div>
          <Pagination page={safePage} totalPages={totalPages} totalItems={filtered.length} itemsPerPage={perPage} onNavigate={setPage} />
        </>
      )}

      {/* List view */}
      {view === "list" && filtered.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#c5c5d3]/30 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-[#c5c5d3]/20 flex items-center gap-4">
            <div className="w-14 shrink-0" />
            <span className="flex-1 text-xs font-semibold text-[#757682] uppercase tracking-wider">Véhicule</span>
            <span className="text-xs font-semibold text-[#757682] uppercase tracking-wider hidden sm:block w-24">Statut</span>
            <span className="text-xs font-semibold text-[#757682] uppercase tracking-wider hidden md:block w-32">Kilométrage</span>
            <span className="text-xs font-semibold text-[#757682] uppercase tracking-wider hidden sm:block w-24">Tarif/j</span>
            <div className="w-20 shrink-0" />
          </div>
          {paginated.map((v) => (
            <VehicleRow key={v.id} vehicle={v} onRemove={removeVehicle} />
          ))}
          <Pagination page={safePage} totalPages={totalPages} totalItems={filtered.length} itemsPerPage={perPage} onNavigate={setPage} />
        </div>
      )}
    </div>
  )
}
