import type { InvoiceStatus } from "@prisma/client"

const statusConfig: Record<InvoiceStatus, { label: string; className: string }> = {
  UNPAID: { label: "Non payée", className: "bg-orange-100 text-orange-700" },
  PAID: { label: "Payée", className: "bg-green-100 text-green-700" },
  OVERDUE: { label: "En retard", className: "bg-red-100 text-red-700" },
  CANCELLED: { label: "Annulée", className: "bg-gray-100 text-gray-700" },
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const { label, className } = statusConfig[status]
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${className}`}>
      {label}
    </span>
  )
}
