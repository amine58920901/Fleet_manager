"use client"

import { Suspense } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

export interface FilterOption {
  value: string
  label: string
}

function StatusFilterInner({
  options,
  paramKey = "status",
}: {
  options: FilterOption[]
  paramKey?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.get(paramKey) ?? "ALL"

  function select(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "ALL") {
      params.delete(paramKey)
    } else {
      params.set(paramKey, value)
    }
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => select(opt.value)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            current === opt.value
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export function StatusFilter(props: { options: FilterOption[]; paramKey?: string }) {
  return (
    <Suspense fallback={<div className="h-9 mb-4" />}>
      <StatusFilterInner {...props} />
    </Suspense>
  )
}
