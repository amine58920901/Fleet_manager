"use client"

import { Plus } from "lucide-react"
import Link from "next/link"

export function AddVehicleDialog() {
  return (
    <Link
      href="/vehicles/new"
      className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
    >
      <Plus className="h-4 w-4" />
      Ajouter un véhicule
    </Link>
  )
}
