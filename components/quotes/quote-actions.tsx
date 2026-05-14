"use client"

import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { updateQuoteStatusAction, deleteQuoteAction } from "@/actions/quote.actions"
import type { Quote } from "@prisma/client"

export function QuoteActions({ quote }: { quote: Quote }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleStatus(status: "DRAFT" | "SENT" | "ACCEPTED" | "REFUSED" | "EXPIRED") {
    setLoading(true)
    const result = await updateQuoteStatusAction(quote.id, status)
    setLoading(false)

    if (result.success) {
      if (status === "ACCEPTED" && (result.data as any).contractRedirect) {
        toast.success("Devis accepté — création du contrat")
        router.push((result.data as any).contractRedirect)
      } else {
        toast.success("Statut mis à jour")
        router.refresh()
      }
    } else {
      toast.error(result.error)
    }
  }

  async function handleDelete() {
    if (!confirm("Supprimer ce devis ?")) return
    setLoading(true)
    const result = await deleteQuoteAction(quote.id)
    setLoading(false)
    if (result.success) {
      toast.success("Devis supprimé")
      router.push("/quotes")
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {quote.status === "DRAFT" && (
        <button onClick={() => handleStatus("SENT")} disabled={loading}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          Marquer envoyé
        </button>
      )}
      {quote.status === "SENT" && (
        <>
          <button onClick={() => handleStatus("ACCEPTED")} disabled={loading}
            className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
            Accepter → Contrat
          </button>
          <button onClick={() => handleStatus("REFUSED")} disabled={loading}
            className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
            Refusé
          </button>
        </>
      )}
      <button onClick={handleDelete} disabled={loading}
        className="px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50">
        Supprimer
      </button>
    </div>
  )
}
