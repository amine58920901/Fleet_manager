import type { QuoteStatus } from "@prisma/client"

const statusConfig: Record<QuoteStatus, { label: string; className: string }> = {
  DRAFT: { label: "Brouillon", className: "bg-gray-100 text-gray-700" },
  SENT: { label: "Envoyé", className: "bg-blue-100 text-blue-700" },
  ACCEPTED: { label: "Accepté", className: "bg-green-100 text-green-700" },
  REFUSED: { label: "Refusé", className: "bg-red-100 text-red-700" },
  EXPIRED: { label: "Expiré", className: "bg-orange-100 text-orange-700" },
}

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  const { label, className } = statusConfig[status]
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${className}`}>
      {label}
    </span>
  )
}
