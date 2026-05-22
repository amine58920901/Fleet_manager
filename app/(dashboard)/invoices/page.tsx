import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { PageHeader } from "@/components/layout/page-header"
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge"
import { StatusFilter } from "@/components/ui/status-filter"
import Link from "next/link"
import { Plus } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { InvoiceStatus } from "@prisma/client"

const VALID_STATUSES: InvoiceStatus[] = ["UNPAID", "PAID", "OVERDUE", "CANCELLED"]

const FILTER_OPTIONS = [
  { value: "ALL", label: "Toutes" },
  { value: "UNPAID", label: "Non payée" },
  { value: "PAID", label: "Payée" },
  { value: "OVERDUE", label: "En retard" },
  { value: "CANCELLED", label: "Annulée" },
]

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const session = await auth()

  const statusFilter =
    status && VALID_STATUSES.includes(status as InvoiceStatus)
      ? { status: status as InvoiceStatus }
      : {}

  const invoices = await db.invoice.findMany({
    where: { organizationId: session!.user.organizationId, ...statusFilter },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div>
      <PageHeader title="Factures" description={`${invoices.length} facture${invoices.length > 1 ? "s" : ""}`}>
        <Link
          href="/invoices/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouvelle facture
        </Link>
      </PageHeader>

      <StatusFilter options={FILTER_OPTIONS} />

      {invoices.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">Aucune facture{status && status !== "ALL" ? " pour ce statut" : " pour l'instant"}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">N°</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Client</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Émise le</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Échéance</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/invoices/${invoice.id}`} className="font-medium text-blue-600 hover:underline text-sm">
                      {invoice.number}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{invoice.clientName}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(invoice.issueDate)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(invoice.dueDate)}</td>
                  <td className="px-4 py-3 text-sm font-semibold">{formatCurrency(Number(invoice.total))}</td>
                  <td className="px-4 py-3"><InvoiceStatusBadge status={invoice.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
