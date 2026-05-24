"use client"

import { useState } from "react"
import { LayoutGrid, List, User, Phone, CreditCard, Car, ExternalLink, Trash2, Search, Plus } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { Driver, Contract, Vehicle } from "@prisma/client"
import Link from "next/link"
import { toast } from "sonner"

type DriverWithContracts = Driver & {
  contracts: (Contract & { vehicle: Vehicle })[]
}

function licenseStatus(expiry: Date | null): { label: string; className: string } | null {
  if (!expiry) return null
  const daysLeft = Math.ceil((new Date(expiry).getTime() - Date.now()) / 86400000)
  if (daysLeft > 60) return { label: "Valide", className: "bg-[#6cf8bb] text-[#005236]" }
  if (daysLeft > 0) return { label: `Expire dans ${daysLeft}j`, className: "bg-[#ffddb8] text-[#653e00]" }
  return { label: "Expiré", className: "bg-[#ffdad6] text-[#93000a]" }
}

function DriverAvatar({ driver, size = "lg" }: { driver: DriverWithContracts; size?: "sm" | "lg" }) {
  const initials = `${driver.firstName[0]}${driver.lastName[0]}`.toUpperCase()
  if (size === "sm") {
    return (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#dce1ff] to-[#b6c4ff] flex items-center justify-center shrink-0 overflow-hidden border-2 border-[#dce1ff]">
        {driver.photoUrl ? (
          <img src={driver.photoUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <span className="text-sm font-bold text-[#00236f]">{initials}</span>
        )}
      </div>
    )
  }
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#dce1ff] to-[#b6c4ff]/50 overflow-hidden">
      {driver.photoUrl ? (
        <img
          src={driver.photoUrl}
          alt={`${driver.firstName} ${driver.lastName}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="flex flex-col items-center gap-1">
          <span className="text-6xl font-extrabold text-[#00236f]/15 leading-none select-none">
            {initials}
          </span>
          <User className="h-10 w-10 text-[#00236f]/25 -mt-2" />
        </div>
      )}
    </div>
  )
}

function DriverCard({ driver, onRemove }: { driver: DriverWithContracts; onRemove: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false)
  const isActive = driver.contracts.some((c) => c.status === "ACTIVE")
  const activeContract = driver.contracts.find((c) => c.status === "ACTIVE")
  const license = licenseStatus(driver.licenseExpiry)

  const statusBadge = isActive
    ? { dot: "bg-[#00236f]", text: "En service", textClass: "text-[#00236f]" }
    : { dot: "bg-[#006c49]", text: "Disponible", textClass: "text-[#005236]" }

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    if (!confirm(`Supprimer ${driver.firstName} ${driver.lastName} ?`)) return
    setDeleting(true)
    const res = await fetch(`/api/drivers/${driver.id}`, { method: "DELETE" })
    setDeleting(false)
    if (res.ok) {
      onRemove(driver.id)
    } else {
      const d = await res.json()
      toast.error(d.error ?? "Erreur lors de la suppression")
    }
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#c5c5d3]/30 shadow-[0px_4px_20px_rgba(15,23,42,0.05)] group hover:-translate-y-1 transition-all duration-300">
      {/* Photo */}
      <div className="relative h-48 overflow-hidden">
        <DriverAvatar driver={driver} size="lg" />
        <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full shrink-0 ${statusBadge.dot}`} />
          <span className={`text-[10px] font-bold uppercase ${statusBadge.textClass}`}>{statusBadge.text}</span>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="absolute top-4 left-4 p-1.5 bg-white/80 backdrop-blur-sm rounded-full text-[#757682] hover:text-red-600 hover:bg-white transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
          aria-label="Supprimer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="mb-4">
          <h3 className="font-semibold text-lg text-[#0b1c30] leading-tight">
            {driver.firstName} {driver.lastName}
          </h3>
          {driver.phone && (
            <p className="text-sm text-[#757682] mt-0.5">{driver.phone}</p>
          )}
        </div>

        <div className="space-y-3 pt-4 border-t border-[#c5c5d3]/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#757682] uppercase tracking-wider">
              Permis {driver.licenseNumber}
            </span>
            {license ? (
              <span className={`px-2 py-1 text-[11px] font-bold rounded-md uppercase ${license.className}`}>
                {license.label}
              </span>
            ) : (
              <span className="px-2 py-1 text-[11px] font-bold rounded-md uppercase bg-[#6cf8bb] text-[#005236]">
                Valide
              </span>
            )}
          </div>

          {activeContract && (
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#757682] uppercase tracking-wider">Véhicule</span>
              <span className="text-sm font-medium text-[#0b1c30] flex items-center gap-1.5">
                <Car className="h-4 w-4 text-[#00236f]" />
                {activeContract.vehicle.brand} {activeContract.vehicle.model}
              </span>
            </div>
          )}
        </div>

        <Link
          href={`/drivers/${driver.id}`}
          className="w-full mt-5 py-2.5 flex items-center justify-center border border-[#00236f] text-[#00236f] text-sm font-semibold rounded-xl hover:bg-[#00236f] hover:text-white transition-colors"
        >
          Voir le profil complet
        </Link>
      </div>
    </div>
  )
}

function DriverRow({ driver, onRemove }: { driver: DriverWithContracts; onRemove: (id: string) => void }) {
  const [deleting, setDeleting] = useState(false)
  const isActive = driver.contracts.some((c) => c.status === "ACTIVE")
  const license = licenseStatus(driver.licenseExpiry)

  async function handleDelete() {
    if (!confirm(`Supprimer ${driver.firstName} ${driver.lastName} ?`)) return
    setDeleting(true)
    const res = await fetch(`/api/drivers/${driver.id}`, { method: "DELETE" })
    setDeleting(false)
    if (res.ok) {
      onRemove(driver.id)
    } else {
      const d = await res.json()
      toast.error(d.error ?? "Erreur lors de la suppression")
    }
  }

  return (
    <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-[#f8f9ff] transition-colors border-b border-[#c5c5d3]/20 last:border-0">
      <DriverAvatar driver={driver} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-[#0b1c30]">
          {driver.firstName} {driver.lastName}
        </p>
        <p className="text-xs text-[#757682]">
          Permis {driver.licenseNumber}
          {driver.licenseExpiry && ` · exp. ${formatDate(driver.licenseExpiry)}`}
        </p>
      </div>
      {driver.phone && (
        <p className="text-sm text-[#444651] shrink-0 hidden sm:flex items-center gap-1.5">
          <Phone className="h-3.5 w-3.5 text-[#757682]" />
          {driver.phone}
        </p>
      )}
      {license ? (
        <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md uppercase shrink-0 hidden md:inline ${license.className}`}>
          {license.label}
        </span>
      ) : (
        <span className="px-2.5 py-1 text-[11px] font-bold rounded-md uppercase shrink-0 hidden md:inline bg-[#6cf8bb] text-[#005236]">
          Valide
        </span>
      )}
      <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full uppercase shrink-0 ${
        isActive ? "bg-[#e5eeff] text-[#00236f]" : "bg-[#6cf8bb]/30 text-[#005236]"
      }`}>
        {isActive ? "En service" : "Disponible"}
      </span>
      <div className="flex items-center gap-1.5 shrink-0">
        <Link
          href={`/drivers/${driver.id}`}
          className="p-2 text-[#757682] hover:text-[#00236f] hover:bg-[#dce1ff] rounded-lg transition-all"
          aria-label="Voir le profil"
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

export function DriversGrid({ drivers: initial }: { drivers: DriverWithContracts[] }) {
  const [drivers, setDrivers] = useState(initial)
  const [view, setView] = useState<"grid" | "list">("grid")
  const [search, setSearch] = useState("")

  const filtered = search.trim()
    ? drivers.filter((d) =>
        `${d.firstName} ${d.lastName} ${d.phone ?? ""} ${d.licenseNumber}`.toLowerCase().includes(search.toLowerCase())
      )
    : drivers

  function removeDriver(id: string) {
    setDrivers((prev) => prev.filter((d) => d.id !== id))
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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, téléphone, permis…"
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
          <User className="h-12 w-12 mx-auto mb-3 text-[#c5c5d3]" />
          <p className="text-base font-medium">
            {search ? "Aucun chauffeur trouvé pour cette recherche" : "Aucun chauffeur"}
          </p>
        </div>
      )}

      {/* Grid view */}
      {view === "grid" && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8">
          {filtered.map((d) => (
            <DriverCard key={d.id} driver={d} onRemove={removeDriver} />
          ))}
          {/* Add slot */}
          <Link
            href="/drivers/new"
            className="border-2 border-dashed border-[#c5c5d3] rounded-2xl flex flex-col items-center justify-center p-8 group hover:bg-[#f0f4ff] hover:border-[#00236f] transition-all min-h-[320px]"
          >
            <div className="w-16 h-16 rounded-full bg-[#dce1ff] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus className="h-8 w-8 text-[#00236f]" />
            </div>
            <span className="text-base font-semibold text-[#444651] group-hover:text-[#00236f]">Ajouter un chauffeur</span>
            <p className="text-sm text-[#757682] mt-2 text-center">Enregistrez un nouveau membre dans le système.</p>
          </Link>
        </div>
      )}

      {/* List view */}
      {view === "list" && filtered.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#c5c5d3]/30 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-[#c5c5d3]/20 grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-4">
            <div className="w-10" />
            <span className="text-xs font-semibold text-[#757682] uppercase tracking-wider">Chauffeur</span>
            <span className="text-xs font-semibold text-[#757682] uppercase tracking-wider hidden sm:block">Téléphone</span>
            <span className="text-xs font-semibold text-[#757682] uppercase tracking-wider hidden md:block">Permis</span>
            <span className="text-xs font-semibold text-[#757682] uppercase tracking-wider">Statut</span>
            <div className="w-20" />
          </div>
          {filtered.map((d) => (
            <DriverRow key={d.id} driver={d} onRemove={removeDriver} />
          ))}
        </div>
      )}
    </div>
  )
}
