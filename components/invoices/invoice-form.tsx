"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createInvoiceAction } from "@/actions/invoice.actions"

export function InvoiceForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [subtotal, setSubtotal] = useState(0)
  const taxRate = 19
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const fd = new FormData(e.currentTarget)
    const result = await createInvoiceAction({
      clientName: fd.get("clientName") as string,
      clientEmail: fd.get("clientEmail") as string || undefined,
      clientPhone: fd.get("clientPhone") as string || undefined,
      clientAddress: fd.get("clientAddress") as string || undefined,
      dueDate: new Date(fd.get("dueDate") as string),
      subtotal,
      taxRate,
      notes: fd.get("notes") as string || undefined,
    })

    setLoading(false)
    if (result.success) {
      toast.success("Facture créée")
      router.push("/invoices")
    } else {
      toast.error(result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Client</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du client *</label>
            <input name="clientName" required
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input name="clientEmail" type="email"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input name="clientPhone"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
            <input name="clientAddress"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Montant & échéance</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Montant HT (€) *</label>
            <input name="subtotal" type="number" step="0.01" required
              onChange={(e) => setSubtotal(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date d&apos;échéance *</label>
            <input name="dueDate" type="date" required
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Sous-total HT</span>
            <span>{subtotal.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">TVA ({taxRate}%)</span>
            <span>{taxAmount.toFixed(2)} €</span>
          </div>
          <div className="flex justify-between font-semibold text-base pt-2 border-t">
            <span>Total TTC</span>
            <span className="text-blue-600">{total.toFixed(2)} €</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea name="notes" rows={3}
          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
      </div>

      <button type="submit" disabled={loading}
        className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
        {loading ? "Création..." : "Créer la facture"}
      </button>
    </form>
  )
}
