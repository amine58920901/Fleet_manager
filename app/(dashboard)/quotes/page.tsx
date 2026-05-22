import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { PageHeader } from "@/components/layout/page-header"
import { QuoteStatusBadge } from "@/components/quotes/quote-status-badge"
import { StatusFilter } from "@/components/ui/status-filter"
import Link from "next/link"
import { Plus } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { QuoteStatus } from "@prisma/client"

const VALID_STATUSES: QuoteStatus[] = ["DRAFT", "SENT", "ACCEPTED", "REFUSED", "EXPIRED"]

const FILTER_OPTIONS = [
  { value: "ALL", label: "Tous" },
  { value: "DRAFT", label: "Brouillon" },
  { value: "SENT", label: "Envoyé" },
  { value: "ACCEPTED", label: "Accepté" },
  { value: "REFUSED", label: "Refusé" },
  { value: "EXPIRED", label: "Expiré" },
]

export default async function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const session = await auth()

  const statusFilter =
    status && VALID_STATUSES.includes(status as QuoteStatus)
      ? { status: status as QuoteStatus }
      : {}

  const quotes = await db.quote.findMany({
    where: { organizationId: session!.user.organizationId, ...statusFilter },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <PageHeader title="Devis" description={`${quotes.length} devis`}>
        <Link
          href="/quotes/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouveau devis
        </Link>
      </PageHeader>

      <StatusFilter options={FILTER_OPTIONS} />

      {quotes.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">Aucun devis{status && status !== "ALL" ? " pour ce statut" : " pour l'instant"}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">N°</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Client</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Véhicule</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Dates</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {quotes.map((quote) => (
                <tr key={quote.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/quotes/${quote.id}`} className="font-medium text-blue-600 hover:underline text-sm">
                      {quote.number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{quote.clientName}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{quote.vehicleDesc}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {formatDate(quote.startDate)} → {formatDate(quote.endDate)}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold">{formatCurrency(Number(quote.total))}</td>
                  <td className="px-4 py-3">
                    <QuoteStatusBadge status={quote.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
