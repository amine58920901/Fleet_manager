"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface VehicleComboboxProps {
  options: string[]
  value: string
  onChange: (value: string) => void
  placeholder: string
  disabled?: boolean
  name?: string
}

export function VehicleCombobox({
  options,
  value,
  onChange,
  placeholder,
  disabled,
  name,
}: VehicleComboboxProps) {
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<React.CSSProperties>({})
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // When parent changes value (e.g. brand reset clears model), sync display
  useEffect(() => {
    setQuery(value)
  }, [value])

  const reposition = useCallback(() => {
    if (!inputRef.current) return
    const r = inputRef.current.getBoundingClientRect()
    setPos({ top: r.bottom + 4, left: r.left, width: r.width })
  }, [])

  useEffect(() => {
    if (!open) return
    reposition()
    window.addEventListener("resize", reposition)
    window.addEventListener("scroll", reposition, true)
    return () => {
      window.removeEventListener("resize", reposition)
      window.removeEventListener("scroll", reposition, true)
    }
  }, [open, reposition])

  const filtered = query
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options

  function openList() {
    if (disabled) return
    reposition()
    setOpen(true)
  }

  function handleType(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setQuery(v)
    setOpen(true)
    // Commit only on exact match
    const match = options.find((o) => o.toLowerCase() === v.toLowerCase())
    onChange(match ?? "")
  }

  function pick(option: string) {
    setQuery(option)
    onChange(option)
    setOpen(false)
  }

  function clear(e: React.MouseEvent) {
    e.preventDefault()
    setQuery("")
    onChange("")
    setOpen(false)
  }

  function handleBlur() {
    // Small delay so the pick() mousedown can fire first
    setTimeout(() => {
      setOpen(false)
      // If what's typed is not an exact option, revert to the last committed value
      const match = options.find((o) => o.toLowerCase() === query.toLowerCase())
      if (!match) setQuery(value)
    }, 100)
  }

  return (
    <>
      {name && <input type="hidden" name={name} value={value} />}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleType}
          onFocus={openList}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          className={cn(
            "w-full px-4 py-3 pr-16 rounded-xl bg-gray-100 text-sm text-gray-900 placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
          {query && !disabled && (
            <button
              type="button"
              onMouseDown={clear}
              tabIndex={-1}
              className="pointer-events-auto p-0.5 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className={cn("w-4 h-4 text-gray-500 transition-transform", open && "rotate-180")} />
        </div>
      </div>

      {open && !disabled && filtered.length > 0 && (
        <ul
          ref={listRef}
          style={{ position: "fixed", zIndex: 9999, ...pos }}
          className="bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto"
        >
          {filtered.map((option) => (
            <li
              key={option}
              // e.preventDefault() keeps the input focused so blur doesn't fire before pick()
              onMouseDown={(e) => { e.preventDefault(); pick(option) }}
              className={cn(
                "px-4 py-2.5 text-sm cursor-pointer hover:bg-gray-50",
                value === option && "bg-green-50 text-green-700 font-medium"
              )}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
