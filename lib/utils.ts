import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatCurrency = (amount: number | string) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(Number(amount))

export const formatDate = (date: Date | string) =>
  new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date(date))

export const formatDateShort = (date: Date | string) =>
  new Intl.DateTimeFormat("fr-FR", { dateStyle: "short" }).format(new Date(date))

export function generateDocumentNumber(prefix: string, lastNumber: string | null): string {
  const year = new Date().getFullYear()
  if (!lastNumber) {
    return `${prefix}-${year}-00001`
  }
  const parts = lastNumber.split("-")
  const lastYear = parseInt(parts[1])
  const lastSeq = parseInt(parts[2])

  if (lastYear < year) {
    return `${prefix}-${year}-00001`
  }

  const nextSeq = (lastSeq + 1).toString().padStart(5, "0")
  return `${prefix}-${year}-${nextSeq}`
}
