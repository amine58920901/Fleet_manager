import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import { PageHeader } from "@/components/layout/page-header"
import { QuoteStatusBadge } from "@/components/quotes/quote-status-badge"
import { QuoteActions } from "@/components/quotes/quote-actions"
import { DownloadPdfButton } from "@/components/pdf/download-pdf-button"
import { LldInstallmentPanel } from "@/components/quotes/lld-installment-panel"
import { formatCurrency, formatDate } from "@/lib/utils"

export default async function QuoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  const quote = await db.quote.findUnique({
    where: { id, organizationId: session!.user.organizationId },
    include: { invoices: { orderBy: { installmentNumber: "asc" } } },
  })

  if (!quote) notFound()

  const isLld = quote.billingMode === "MONTHLY"

  return (
    <div>
      <PageHeader
        title={`Devis ${quote.number}`}
        description={`Client : ${quote.clientName}`}
        backHref="/quotes"
      >
        {isLld && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold">
            LLD
          </span>
        )}
        <QuoteStatusBadge status={quote.status} />
        <DownloadPdfButton href={`/api/pdf/quote/${quote.id}`} filename={`devis-${quote.number}.pdf`} />
        <QuoteActions quote={quote} />
      </PageHeader>

      <div className="max-w-2xl space-y-6">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Informations client</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-xs text-gray-500 mb-1">Nom</dt><dd className="font-medium">{quote.clientName}</dd></div>
            <div><dt className="text-xs text-gray-500 mb-1">Email</dt><dd>{quote.clientEmail ?? "—"}</dd></div>
            <div><dt className="text-xs text-gray-500 mb-1">Téléphone</dt><dd>{quote.clientPhone ?? "—"}</dd></div>
            <div><dt className="text-xs text-gray-500 mb-1">Adresse</dt><dd>{quote.clientAddress ?? "—"}</dd></div>
          </dl>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Détails location</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div><dt className="text-xs text-gray-500 mb-1">Véhicule</dt><dd className="font-medium">{quote.vehicleDesc}</dd></div>
            <div>
              <dt className="text-xs text-gray-500 mb-1">Durée</dt>
              <dd>
                {quote.days} jour{quote.days > 1 ? "s" : ""}
                {isLld && quote.totalInstallments && (
                  <span className="ml-2 text-violet-600 font-medium">({quote.totalInstallments} mois)</span>
                )}
              </dd>
            </div>
            <div><dt className="text-xs text-gray-500 mb-1">Du</dt><dd>{formatDate(quote.startDate)}</dd></div>
            <div><dt className="text-xs text-gray-500 mb-1">Au</dt><dd>{formatDate(quote.endDate)}</dd></div>
          </dl>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Montants</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Sous-total HT</span>
              <span>{formatCurrency(Number(quote.subtotal))}</span>
            </div>
            {Number(quote.discountAmount) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>
                  Remise
                  {quote.discountType === "PERCENT"
                    ? ` (${Number(quote.discountValue)}%)`
                    : ` (fixe)`}
                </span>
                <span>- {formatCurrency(Number(quote.discountAmount))}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">TVA ({Number(quote.taxRate)}%)</span>
              <span>{formatCurrency(Number(quote.taxAmount))}</span>
            </div>
            <div className="flex justify-between font-semibold text-base pt-2 border-t">
              <span>Total TTC {isLld && quote.totalInstallments ? `(${quote.totalInstallments} mois)` : ""}</span>
              <span className="text-blue-600">{formatCurrency(Number(quote.total))}</span>
            </div>
            {isLld && quote.installmentAmount && (
              <div className="flex justify-between font-semibold pt-2 border-t border-dashed text-violet-700">
                <span>Mensualité TTC</span>
                <span>{formatCurrency(Number(quote.installmentAmount))} / mois</span>
              </div>
            )}
          </div>
        </div>

        {/* Panneau LLD mensualités */}
        {isLld && quote.totalInstallments && quote.installmentAmount && (
          <LldInstallmentPanel
            quoteId={quote.id}
            totalInstallments={quote.totalInstallments}
            installmentAmount={Number(quote.installmentAmount)}
            startDate={quote.startDate}
            existingInvoices={quote.invoices.map((inv) => ({
              id: inv.id,
              number: inv.number,
              installmentNumber: inv.installmentNumber!,
              status: inv.status,
            }))}
          />
        )}

        {quote.notes && (
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-semibold text-gray-900 mb-2">Notes</h2>
            <p className="text-sm text-gray-600">{quote.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
