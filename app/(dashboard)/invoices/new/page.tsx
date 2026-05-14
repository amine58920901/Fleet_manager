import { PageHeader } from "@/components/layout/page-header"
import { InvoiceForm } from "@/components/invoices/invoice-form"

export default function NewInvoicePage() {
  return (
    <div>
      <PageHeader title="Nouvelle facture" backHref="/invoices" />
      <div className="max-w-2xl">
        <InvoiceForm />
      </div>
    </div>
  )
}
