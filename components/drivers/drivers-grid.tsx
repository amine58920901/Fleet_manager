"use client"

import { useState } from "react"
import { LayoutGrid, List, X, User, Phone, Mail, CreditCard, MapPin, ExternalLink } from "lucide-react"
import { formatDate } from "@/lib/utils"
import type { Driver, Contract, Vehicle } from "@prisma/client"
import Link from "next/link"

type DriverWithContracts = Driver & {
  contracts: (Contract & { vehicle: Vehicle })[]
}

function LicenseExpiryBadge({ expiry }: { expiry: Date | null }) {
  if (!expiry) return null
  const daysLeft = Math.ceil((new Date(expiry).getTime() - Date.now()) / 86400000)
  if (daysLeft > 60) return null
  const cls = daysLeft <= 0
    ? "bg-red-100 text-red-700"
    : daysLeft <= 30
    ? "bg-orange-100 text-orange-700"
    : "bg-yellow-100 text-yellow-700"
  const label = daysLeft <= 0 ? "Permis expiré" : `Permis expire dans ${daysLeft}j`
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>
}

export function DriversGrid({ drivers }: { drivers: DriverWithContracts[] }) {
  const [view, setView] = useState<"grid" | "list">("grid")
  const [selected, setSelected] = useState<DriverWithContracts | null>(null)

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
          {drivers.map((d) => (
            <button key={d.id} onClick={() => setSelected(d)} className="text-left group">
              <div className="bg-white rounded-xl border p-4 hover:shadow-md hover:border-green-200 transition-all h-full">
                <div className="flex items-start justify-between mb-2">
                  <div className="p-1.5 bg-green-50 rounded-lg">
                    <User className="h-4 w-4 text-green-600" />
                  </div>
                  {d.contracts.some((c) => c.status === "ACTIVE") && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">
                      En course
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mt-2 leading-tight">
                  {d.firstName} {d.lastName}
                </h3>
                <div className="mt-2 space-y-1">
                  {d.phone && (
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {d.phone}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <CreditCard className="w-3 h-3" /> {d.licenseNumber}
                  </p>
                </div>
                {d.licenseExpiry && (
                  <div className="mt-2">
                    <LicenseExpiryBadge expiry={d.licenseExpiry} />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {view === "list" && (
        <div className="bg-white rounded-xl border divide-y">
          {drivers.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelected(d)}
              className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="p-2 bg-green-50 rounded-lg shrink-0">
                <User className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">{d.firstName} {d.lastName}</p>
                <p className="text-xs text-gray-400">
                  Permis : {d.licenseNumber}
                  {d.licenseExpiry && ` · exp. ${formatDate(d.licenseExpiry)}`}
                </p>
              </div>
              {d.phone && (
                <p className="text-sm text-gray-500 shrink-0 hidden sm:block">{d.phone}</p>
              )}
              <LicenseExpiryBadge expiry={d.licenseExpiry} />
              {d.contracts.some((c) => c.status === "ACTIVE") && (
                <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-blue-100 text-blue-700 shrink-0">
                  En course
                </span>
              )}
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
            <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <User className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-semibold text-gray-900">
                      {selected.firstName} {selected.lastName}
                    </h2>
                    <LicenseExpiryBadge expiry={selected.licenseExpiry} />
                    {selected.contracts.some((c) => c.status === "ACTIVE") && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">
                        En course
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">Permis n° {selected.licenseNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/drivers/${selected.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Modifier
                </Link>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 ml-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="overflow-y-auto p-6 space-y-6">

              {/* Coordonnées */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Coordonnées</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selected.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                      <div>
                        <dt className="text-xs text-gray-400">Email</dt>
                        <dd className="text-sm font-medium text-gray-900">{selected.email}</dd>
                      </div>
                    </div>
                  )}
                  {selected.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                      <div>
                        <dt className="text-xs text-gray-400">Téléphone</dt>
                        <dd className="text-sm font-medium text-gray-900">{selected.phone}</dd>
                      </div>
                    </div>
                  )}
                  {selected.address && (
                    <div className="flex items-start gap-2 sm:col-span-2">
                      <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                      <div>
                        <dt className="text-xs text-gray-400">Adresse</dt>
                        <dd className="text-sm font-medium text-gray-900">{selected.address}</dd>
                      </div>
                    </div>
                  )}
                </dl>
              </div>

              {/* Permis & identité */}
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Permis & identité</h3>
                <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <dt className="text-xs text-gray-400 mb-0.5">N° permis</dt>
                    <dd className="text-sm font-medium text-gray-900">{selected.licenseNumber}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-400 mb-0.5">Expiration permis</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {selected.licenseExpiry ? formatDate(selected.licenseExpiry) : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-400 mb-0.5">Date de naissance</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {selected.birthDate ? formatDate(selected.birthDate) : "—"}
                    </dd>
                  </div>
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
                  <div className="divide-y rounded-xl border overflow-hidden">
                    {selected.contracts.map((c) => (
                      <div key={c.id} className="flex items-center justify-between px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{c.number}</p>
                          <p className="text-xs text-gray-400">
                            {c.vehicle.brand} {c.vehicle.model} · {formatDate(c.startDate)} → {formatDate(c.endDate)}
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
            </div>
          </div>
        </div>
      )}
    </>
  )
}
