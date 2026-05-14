import type { Vehicle } from "@prisma/client"
import Link from "next/link"
import { VehicleStatusBadge } from "./vehicle-status-badge"
import { formatCurrency } from "@/lib/utils"
import { Car } from "lucide-react"

interface VehicleCardProps {
  vehicle: Vehicle
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <Link href={`/vehicles/${vehicle.id}`}>
      <div className="bg-white rounded-xl border p-5 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Car className="h-5 w-5 text-blue-600" />
          </div>
          <VehicleStatusBadge status={vehicle.status} />
        </div>

        <h3 className="font-semibold text-gray-900 mt-3">
          {vehicle.brand} {vehicle.model}
        </h3>
        <p className="text-sm text-gray-500">{vehicle.year} · {vehicle.licensePlate}</p>

        <div className="mt-4 pt-4 border-t space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Journalier</span>
            <span className="text-sm font-semibold text-blue-600">{formatCurrency(Number(vehicle.dailyRate))}</span>
          </div>
          {vehicle.weeklyRate && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Hebdomadaire</span>
              <span className="text-sm font-medium text-gray-700">{formatCurrency(Number(vehicle.weeklyRate))}</span>
            </div>
          )}
          {vehicle.monthlyRate && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Mensuel</span>
              <span className="text-sm font-medium text-gray-700">{formatCurrency(Number(vehicle.monthlyRate))}</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-1 border-t">
            <span className="text-xs text-gray-400">{vehicle.mileage.toLocaleString("fr-FR")} km</span>
            {vehicle.depositAmount && (
              <span className="text-xs text-gray-500">Caution : {formatCurrency(Number(vehicle.depositAmount))}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
