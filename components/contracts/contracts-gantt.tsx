"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

type GanttContract = {
  id: string
  number: string
  startDate: Date | string
  endDate: Date | string
  driverName: string
}

type GanttVehicle = {
  id: string
  brand: string
  model: string
  licensePlate: string
  contracts: GanttContract[]
}

export function ContractsGantt({ vehicles }: { vehicles: GanttVehicle[] }) {
  const [weekOffset, setWeekOffset] = useState(0)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const windowStart = new Date(today)
  windowStart.setDate(today.getDate() + weekOffset * 7)
  windowStart.setHours(0, 0, 0, 0)

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(windowStart)
    d.setDate(windowStart.getDate() + i)
    return d
  })

  const windowEnd = new Date(days[6])
  windowEnd.setHours(23, 59, 59, 999)

  const monthYearLabel = windowStart.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  })

  function dayLabel(d: Date) {
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
  }

  const todayStr = today.toDateString()

  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0px_4px_20px_rgba(15,23,42,0.05)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 flex-wrap gap-3">
        <div className="flex items-center gap-4 flex-wrap">
          <h2 className="font-semibold text-lg text-[#0b1c30]">Planning Hebdomadaire</h2>
          <div className="flex items-center bg-[#f8f9ff] rounded-lg p-1 border border-[#c5c5d3]">
            <button
              onClick={() => setWeekOffset((w) => w - 1)}
              className="p-1 hover:bg-white rounded transition-colors text-[#444651]"
              aria-label="Semaine précédente"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 text-sm font-semibold text-[#0b1c30] capitalize min-w-[140px] text-center">
              {monthYearLabel}
            </span>
            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              className="p-1 hover:bg-white rounded transition-colors text-[#444651]"
              aria-label="Semaine suivante"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5 text-xs text-[#444651]">
            <span className="w-3 h-3 rounded-full bg-[#00236f] shrink-0" />
            Location
          </span>
          <span className="flex items-center gap-1.5 text-xs text-[#444651]">
            <span className="w-3 h-3 rounded-full bg-[#006c49] shrink-0" />
            Maintenance
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[480px]">
          {/* Column headers */}
          <div className="flex border-b border-gray-100">
            <div className="w-40 shrink-0 px-3 py-2 bg-[#f8f9ff] text-xs font-semibold text-[#444651] uppercase tracking-wider border-r border-gray-100 rounded-tl-lg">
              Véhicule
            </div>
            <div className="flex-1 flex">
              {days.map((d, i) => (
                <div
                  key={i}
                  className={`flex-1 px-1 py-2 text-center text-xs font-semibold border-l border-gray-100 ${
                    d.toDateString() === todayStr
                      ? "bg-[#00236f]/8 text-[#00236f]"
                      : "text-[#444651] bg-[#f8f9ff]"
                  }`}
                >
                  {dayLabel(d)}
                </div>
              ))}
            </div>
          </div>

          {/* Vehicle rows */}
          {vehicles.length === 0 ? (
            <div className="py-10 text-center text-sm text-[#444651]">
              Aucun véhicule disponible
            </div>
          ) : (
            vehicles.map((vehicle) => {
              const activeContracts = vehicle.contracts.filter((c) => {
                const start = new Date(c.startDate)
                start.setHours(0, 0, 0, 0)
                const end = new Date(c.endDate)
                end.setHours(23, 59, 59, 999)
                return start <= windowEnd && end >= windowStart
              })

              return (
                <div key={vehicle.id} className="flex border-b border-gray-50 last:border-0">
                  {/* Vehicle label */}
                  <div className="w-40 shrink-0 px-3 py-3 border-r border-gray-100 bg-gray-50/40">
                    <p className="text-xs font-semibold text-[#0b1c30] leading-snug">
                      {vehicle.brand} {vehicle.model}
                    </p>
                    <p className="text-[10px] text-[#757682] uppercase tracking-wider mt-0.5">
                      {vehicle.licensePlate}
                    </p>
                  </div>

                  {/* Timeline area */}
                  <div className="flex-1 relative" style={{ minHeight: "52px" }}>
                    {/* Day cell backgrounds */}
                    <div className="flex absolute inset-0">
                      {days.map((d, i) => (
                        <div
                          key={i}
                          className={`flex-1 border-l border-gray-100 ${
                            d.toDateString() === todayStr ? "bg-[#00236f]/5" : ""
                          }`}
                        />
                      ))}
                    </div>

                    {/* Contract bars */}
                    {activeContracts.map((contract) => {
                      const contractStart = new Date(contract.startDate)
                      contractStart.setHours(0, 0, 0, 0)
                      const contractEnd = new Date(contract.endDate)
                      contractEnd.setHours(23, 59, 59, 999)

                      const barStartDay = Math.max(
                        0,
                        Math.floor((contractStart.getTime() - windowStart.getTime()) / 86400000)
                      )
                      const barEndDay = Math.min(
                        7,
                        Math.ceil((contractEnd.getTime() - windowStart.getTime()) / 86400000)
                      )
                      const barDays = barEndDay - barStartDay
                      if (barDays <= 0) return null

                      const leftPct = (barStartDay / 7) * 100
                      const widthPct = (barDays / 7) * 100

                      return (
                        <div
                          key={contract.id}
                          className="absolute top-1/2 -translate-y-1/2 h-7 bg-[#00236f]/15 border-l-4 border-[#00236f] rounded-r-md flex items-center px-2 cursor-pointer hover:bg-[#00236f]/25 transition-all z-10"
                          style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                          title={`${contract.driverName} · ${contract.number}`}
                        >
                          <span className="text-[10px] font-bold text-[#00236f] truncate">
                            {contract.driverName} · {contract.number}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
