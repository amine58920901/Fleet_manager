"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createInstallmentInvoiceAction } from "@/actions/invoice.actions"

interface ExistingInvoice {
  id: string
  number: string
  installmentNumber: number
  status: string
}

interface LldInstallmentPanelProps {
  quoteId: string
  totalInstallments: number
  installmentAmount: number
  startDate: Date
  existingInvoices: ExistingInvoice[]
}

const STATUS = {
  UNPAID:    { label: "Émise",     dot: "bg-yellow-400", row: "text-yellow-700" },
  PAID:      { label: "Payée",     dot: "bg-green-500",  row: "text-green-700"  },
  OVERDUE:   { label: "En retard", dot: "bg-red-500",    row: "text-red-700"    },
  CANCELLED: { label: "Annulée",   dot: "bg-gray-400",   row: "text-gray-400"   },
} as const

export function LldInstallmentPanel({
  quoteId,
  totalInstallments,
  installmentAmount,
  startDate,
  existingInvoices,
}: LldInstallmentPanelProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n)

  const invoiceByN = Object.fromEntries(
    existingInvoices.map((inv) => [inv.installmentNumber, inv])
  )

  // Prochain numéro à facturer
  const nextToInvoice = Array.from({ length: totalInstallments }, (_, i) => i + 1)
    .find((n) => !invoiceByN[n] || invoiceByN[n].status === "CANCELLED")

  const paid = existingInvoices.filter((i) => i.status === "PAID").length
  const issued = existingInvoices.filter((i) => i.status !== "CANCELLED").length

  function getMonthLabel(n: number) {
    const d = new Date(startDate)
    d.setMonth(d.getMonth() + n - 1)
    return d.toLocaleDateString("fr-FR", { month: "long", year: "numeric" })
  }

  function getPeriod(n: number) {
    const s = new Date(startDate)
    s.setMonth(s.getMonth() + n - 1)
    const e = new Date(s)
    e.setMonth(e.getMonth() + 1)
    e.setDate(e.getDate() - 1)
    const f = (d: Date) => d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
    return `${f(s)} → ${f(e)}`
  }

  async function handleNext() {
    if (!nextToInvoice) return
    setLoading(true)
    const result = await createInstallmentInvoiceAction(quoteId, nextToInvoice)
    setLoading(false)
    if (result.success) {
      toast.success(`Facture mensualité ${nextToInvoice}/${totalInstallments} émise`)
      router.refresh()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      {/* Header Odoo-style */}
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900">Échéancier de facturation</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {issued} / {totalInstallments} factures émises · {paid} payées
            · <span className="text-blue-500">auto le {new Date(startDate).getDate()} de chaque mois</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Barre progression */}
          <div className="hidden sm:flex flex-col items-end gap-1">
            <div className="flex gap-1">
              {Array.from({ length: totalInstallments }, (_, i) => i + 1).map((n) => {
                const inv = invoiceByN[n]
                const color = inv
                  ? inv.status === "PAID" ? "bg-green-500"
                  : inv.status === "OVERDUE" ? "bg-red-400"
                  : inv.status === "CANCELLED" ? "bg-gray-200"
                  : "bg-yellow-400"
                  : "bg-gray-200"
                return <div key={n} className={`w-4 h-2 rounded-sm ${color}`} title={`Mois ${n}`} />
              })}
            </div>
            <span className="text-xs text-gray-400">{Math.round((paid / totalInstallments) * 100)}% payé</span>
          </div>
              {nextToInvoice ? (
            <div className="flex items-center gap-2">
              <span className="hidden lg:flex items-center gap-1.5 text-xs text-gray-400">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Auto chaque {new Date(startDate).getDate()}
              </span>
              <button
                onClick={handleNext}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-1.5 border border-blue-300 text-blue-600 text-xs font-medium rounded-lg hover:bg-blue-50 disabled:opacity-50 transition-colors"
                title="Forcer la génération maintenant"
              >
                {loading ? (
                  <span className="w-3 h-3 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                Forcer mensualité {nextToInvoice}
              </button>
            </div>
          ) : (
            <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Toutes les factures émises
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-400 border-b bg-gray-50">
            <th className="text-left px-6 py-2 font-medium">N°</th>
            <th className="text-left px-4 py-2 font-medium">Période</th>
            <th className="text-left px-4 py-2 font-medium hidden md:table-cell">Dates</th>
            <th className="text-right px-4 py-2 font-medium">Montant TTC</th>
            <th className="text-center px-4 py-2 font-medium">Statut</th>
            <th className="text-left px-6 py-2 font-medium">Facture</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: totalInstallments }, (_, i) => i + 1).map((n) => {
            const inv = invoiceByN[n]
            const s = inv ? STATUS[inv.status as keyof typeof STATUS] : null
            const isNext = n === nextToInvoice

            return (
              <tr key={n} className={`border-b last:border-0 hover:bg-gray-50 transition-colors ${isNext && !inv ? "bg-blue-50/50" : ""}`}>
                <td className="px-6 py-3">
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                    inv ? "bg-blue-100 text-blue-700" : isNext ? "bg-blue-200 text-blue-800" : "bg-gray-100 text-gray-400"
                  }`}>
                    {n}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-gray-800 capitalize">
                  {getMonthLabel(n)}
                  {isNext && !inv && (
                    <span className="ml-2 text-xs text-blue-500 font-normal">← suivante</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-400 hidden md:table-cell text-xs">{getPeriod(n)}</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-800">{fmt(installmentAmount)}</td>
                <td className="px-4 py-3 text-center">
                  {s ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      <span className={s.row}>{s.label}</span>
                    </span>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>
                <td className="px-6 py-3">
                  {inv ? (
                    <a
                      href={`/invoices/${inv.id}`}
                      className="text-xs text-blue-600 hover:text-blue-800 font-mono underline-offset-2 hover:underline"
                    >
                      {inv.number}
                    </a>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
