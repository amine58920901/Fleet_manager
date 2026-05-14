"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { updateInvoiceStatusAction, deleteInvoiceAction } from "@/actions/invoice.actions"
import type { Invoice } from "@prisma/client"

export function InvoiceActions({ invoice }: { invoice: Invoice }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleStatus(status: "UNPAID" | "PAID" | "OVERDUE" | "CANCELLED") {
    setLoading(true)
    const result = await updateInvoiceStatusAction(invoice.id, status)
    setLoading(false)
    if (result.success) toast.success("Statut mis à jour")
    else toast.error(result.error)
  }

  async function handleDelete() {
    if (!confirm("Supprimer cette facture ?")) return
    setLoading(true)
    const result = await deleteInvoiceAction(invoice.id)
    setLoading(false)
    if (result.success) {
      toast.success("Facture supprimée")
      router.push("/invoices")
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {invoice.status === "UNPAID" && (
        <button onClick={() => handleStatus("PAID")} disabled={loading}
          className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
          Marquer payée
        </button>
      )}
      {(invoice.status === "UNPAID" || invoice.status === "OVERDUE") && (
        <button onClick={() => handleStatus("CANCELLED")} disabled={loading}
          className="px-3 py-1.5 text-sm border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-50">
          Annuler
        </button>
      )}
      <button onClick={handleDelete} disabled={loading}
        className="px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50">
        Supprimer
      </button>
    </div>
  )
}
