"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

interface PaginationProps {
  page: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onNavigate?: (page: number) => void
}

export function Pagination({ page, totalPages, totalItems, itemsPerPage, onNavigate }: PaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (totalItems === 0) return null

  function navigate(newPage: number) {
    if (onNavigate) {
      onNavigate(newPage)
    } else {
      const params = new URLSearchParams(searchParams.toString())
      params.set("page", String(newPage))
      router.push(`${pathname}?${params}`)
    }
  }

  const from = (page - 1) * itemsPerPage + 1
  const to = Math.min(page * itemsPerPage, totalItems)

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-[#c5c5d3]/20">
      <p className="text-sm text-[#444651]">
        <span className="font-semibold text-[#0b1c30]">{from}–{to}</span> sur {totalItems}
      </p>
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(page - 1)}
            disabled={page <= 1}
            className="p-2 rounded-lg border border-[#c5c5d3] text-[#444651] disabled:opacity-30 hover:bg-[#f8f9ff] hover:border-[#00236f] transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => navigate(p)}
                className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${
                  p === page
                    ? "bg-[#00236f] text-white"
                    : "text-[#444651] hover:bg-[#f8f9ff] border border-transparent hover:border-[#c5c5d3]"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={() => navigate(page + 1)}
            disabled={page >= totalPages}
            className="p-2 rounded-lg border border-[#c5c5d3] text-[#444651] disabled:opacity-30 hover:bg-[#f8f9ff] hover:border-[#00236f] transition-all"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  )
}
