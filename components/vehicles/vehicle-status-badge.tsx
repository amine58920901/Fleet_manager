import type { VehicleStatus } from "@prisma/client"

const statusConfig: Record<VehicleStatus, { label: string; className: string }> = {
  AVAILABLE: { label: "Disponible", className: "bg-green-100 text-green-700" },
  RENTED: { label: "En location", className: "bg-blue-100 text-blue-700" },
  MAINTENANCE: { label: "En réparation", className: "bg-orange-100 text-orange-700" },
  OUT_OF_SERVICE: { label: "Hors service", className: "bg-red-100 text-red-700" },
}

export function VehicleStatusBadge({ status }: { status: VehicleStatus }) {
  const { label, className } = statusConfig[status]
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${className}`}>
      {label}
    </span>
  )
}
