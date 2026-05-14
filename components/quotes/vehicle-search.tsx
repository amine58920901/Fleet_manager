"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Search, X, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Vehicle } from "@prisma/client"

interface VehicleSearchProps {
  vehicles: Vehicle[]
  value: Vehicle | null
  onChange: (vehicle: Vehicle | null) => void
}

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n)

export function VehicleSearch({ vehicles, value, onChange }: VehicleSearchProps) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<React.CSSProperties>({})
  const inputRef = useRef<HTMLInputElement>(null)

  // When value is set externally, sync display label
  useEffect(() => {
    if (!value) setQuery("")
  }, [value])

  const reposition = useCallback(() => {
    if (!inputRef.current) return
    const r = inputRef.current.getBoundingClientRect()
    setPos({ top: r.bottom + 4, left: r.left, width: r.width })
  }, [])

  useEffect(() => {
    if (!open) return
    reposition()
    window.addEventListener("resize", reposition)
    window.addEventListener("scroll", reposition, true)
    return () => {
      window.removeEventListener("resize", reposition)
      window.removeEventListener("scroll", reposition, true)
    }
  }, [open, reposition])

  const filtered = query.trim()
    ? vehicles.filter((v) => {
        const q = query.toLowerCase()
        return (
          v.brand.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.licensePlate.toLowerCase().includes(q)
        )
      })
    : vehicles

  function pick(vehicle: Vehicle) {
    setQuery(`${vehicle.brand} ${vehicle.model} — ${vehicle.licensePlate}`)
    onChange(vehicle)
    setOpen(false)
  }

  function clear(e: React.MouseEvent) {
    e.preventDefault()
    setQuery("")
    onChange(null)
    setOpen(false)
    inputRef.current?.focus()
  }

  function handleBlur() {
    setTimeout(() => setOpen(false), 150)
  }

  return (
    <>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => { reposition(); setOpen(true) }}
          onBlur={handleBlur}
          placeholder="Rechercher par marque, modèle ou plaque..."
          autoComplete="off"
          className="w-full pl-9 pr-9 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
        {query ? (
          <button
            type="button"
            onMouseDown={clear}
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <ChevronDown className={cn("absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none transition-transform", open && "rotate-180")} />
        )}
      </div>

      {open && filtered.length > 0 && (
        <ul
          style={{ position: "fixed", zIndex: 9999, ...pos }}
          className="bg-white border border-gray-200 rounded-xl shadow-xl max-h-72 overflow-y-auto"
        >
          {filtered.map((v) => (
            <li
              key={v.id}
              onMouseDown={(e) => { e.preventDefault(); pick(v) }}
              className={cn(
                "px-4 py-3 cursor-pointer hover:bg-gray-50 border-b last:border-0 transition-colors",
                value?.id === v.id && "bg-blue-50"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-gray-900">{v.brand} {v.model}</span>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{v.licensePlate}</span>
                {v.color && <span className="text-xs text-gray-400">{v.color}</span>}
              </div>
              <div className="flex gap-3 mt-0.5 text-xs text-gray-400">
                <span>{v.year}</span>
                <span>Journalier : <strong className="text-gray-600">{fmt(Number(v.dailyRate))}</strong></span>
                {v.weeklyRate && <span>Hebdo : <strong className="text-gray-600">{fmt(Number(v.weeklyRate))}</strong></span>}
                {v.monthlyRate && <span>Mensuel : <strong className="text-gray-600">{fmt(Number(v.monthlyRate))}</strong></span>}
              </div>
            </li>
          ))}
        </ul>
      )}

      {open && filtered.length === 0 && query.trim() && (
        <ul
          style={{ position: "fixed", zIndex: 9999, ...pos }}
          className="bg-white border border-gray-200 rounded-xl shadow-xl"
        >
          <li className="px-4 py-3 text-sm text-gray-400">Aucun véhicule trouvé</li>
        </ul>
      )}
    </>
  )
}
