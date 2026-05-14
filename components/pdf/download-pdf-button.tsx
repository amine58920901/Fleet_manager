"use client"

import { useState } from "react"
import { toast } from "sonner"
import { FileDown, Loader2 } from "lucide-react"

interface DownloadPdfButtonProps {
  href: string
  filename: string
  label?: string
}

export function DownloadPdfButton({ href, filename, label }: DownloadPdfButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    try {
      const res = await fetch(href)
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error("Erreur lors de la génération du PDF")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 disabled:opacity-50 transition-colors"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="h-4 w-4" />
      )}
      {loading ? "Génération..." : (label ?? "Télécharger PDF")}
    </button>
  )
}
