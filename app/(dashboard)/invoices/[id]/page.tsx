import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { PageHeader } from "@/components/layout/page-header"
import { InvoiceStatusBadge } from "@/components/invoices/invoice-status-badge"
import { InvoiceActions } from "@/components/invoices/invoice-actions"
import { DownloadPdfButton } from "@/components/pdf/download-pdf-button"
import { formatCurrency, formatDate } from "@/lib/utils"

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const invoice = await db.invoice.findUnique({
    where: { id, organizationId: session!.user.organizationId },
  })

  if (!invoice) notFound()

  return (
    <div>
      <PageHeader
        title={`Facture ${invoice.number}`}
        description={`Client : ${invoice.clientName}`}
        backHref="/invoices"
      >
        <InvoiceStatusBadge status={invoice.status} />
        <DownloadPdfButton href={`/api/pdf/invoice/${invoice.id}`} filename={`facture-${invoice.number}.pdf`} />
        <InvoiceActions invoice={invoice} />
      </PageHeader>

      <div className="max-w-2xl space-y-6">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Informations client</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-xs text-gray-500 mb-1">Nom</dt><dd className="font-medium">{invoice.clientName}</dd></div>
            <div><dt className="text-xs text-gray-500 mb-1">Email</dt><dd>{invoice.clientEmail ?? "—"}</dd></div>
            <div><dt className="text-xs text-gray-500 mb-1">Téléphone</dt><dd>{invoice.clientPhone ?? "—"}</dd></div>
            <div><dt className="text-xs text-gray-500 mb-1">Adresse</dt><dd>{invoice.clientAddress ?? "—"}</dd></div>
          </dl>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Dates</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-xs text-gray-500 mb-1">Date d&apos;émission</dt><dd>{formatDate(invoice.issueDate)}</dd></div>
            <div><dt className="text-xs text-gray-500 mb-1">Date d&apos;échéance</dt><dd>{formatDate(invoice.dueDate)}</dd></div>
          </dl>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Montants</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Sous-total HT</span>
              <span>{formatCurrency(Number(invoice.subtotal))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">TVA ({Number(invoice.taxRate)}%)</span>
              <span>{formatCurrency(Number(invoice.taxAmount))}</span>
            </div>
            <div className="flex justify-between font-semibold text-base pt-2 border-t">
              <span>Total TTC</span>
              <span className="text-blue-600">{formatCurrency(Number(invoice.total))}</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-semibold text-gray-900 mb-2">Notes</h2>
            <p className="text-sm text-gray-600">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
