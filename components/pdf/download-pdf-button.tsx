"use client"

import { useState } from "react"
import { toast } from "sonner"
import { FileDown, Loader2 } from "lucide-react"

interface DownloadPdfButtonProps {
  href: string
  filename: string
  label?: string
  variant?: "dark" | "outline" | "default"
}

const variantClass = {
  dark: "bg-[#0b1c30] text-white hover:bg-[#0b1c30]/90 shadow-md",
  outline: "bg-white border border-[#c5c5d3] text-[#0b1c30] hover:bg-[#f8f9ff]",
  default: "bg-gray-800 text-white hover:bg-gray-900",
}

export function DownloadPdfButton({ href, filename, label, variant = "default" }: DownloadPdfButtonProps) {
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
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 transition-all active:scale-95 ${variantClass[variant]}`}
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
