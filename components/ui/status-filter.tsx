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
  className,
}: {
  options: FilterOption[]
  paramKey?: string
  className?: string
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
    <div className={className ?? "flex flex-wrap gap-2 mb-4"}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => select(opt.value)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            current === opt.value
              ? "bg-[#00236f] text-white shadow-sm"
              : "border border-[#c5c5d3] text-[#444651] hover:bg-[#eff4ff]"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export function StatusFilter(props: {
  options: FilterOption[]
  paramKey?: string
  className?: string
}) {
  return (
    <Suspense fallback={<div className={props.className ?? "h-9 mb-4"} />}>
      <StatusFilterInner {...props} />
    </Suspense>
  )
}
