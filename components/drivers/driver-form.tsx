"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createDriverAction, updateDriverAction } from "@/actions/driver.actions"
import type { Driver } from "@prisma/client"

interface DriverFormProps {
  driver?: Driver
}

export function DriverForm({ driver }: DriverFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const fd = new FormData(e.currentTarget)
    const data = {
      firstName: fd.get("firstName") as string,
      lastName: fd.get("lastName") as string,
      email: fd.get("email") as string || undefined,
      phone: fd.get("phone") as string || undefined,
      licenseNumber: fd.get("licenseNumber") as string,
      licenseExpiry: fd.get("licenseExpiry") ? new Date(fd.get("licenseExpiry") as string) : undefined,
      birthDate: fd.get("birthDate") ? new Date(fd.get("birthDate") as string) : undefined,
      address: fd.get("address") as string || undefined,
      notes: fd.get("notes") as string || undefined,
    }

    const result = driver
      ? await updateDriverAction(driver.id, data)
      : await createDriverAction(data)

    setLoading(false)

    if (result.success) {
      toast.success(driver ? "Chauffeur mis à jour" : "Chauffeur ajouté")
      if (!driver) router.push("/drivers")
    } else {
      toast.error(result.error)
    }
  }

  const toDateInput = (date: Date | null | undefined) =>
    date ? new Date(date).toISOString().split("T")[0] : ""

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
          <input name="firstName" required defaultValue={driver?.firstName}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
          <input name="lastName" required defaultValue={driver?.lastName}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input name="email" type="email" defaultValue={driver?.email ?? ""}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
          <input name="phone" defaultValue={driver?.phone ?? ""}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">N° permis *</label>
          <input name="licenseNumber" required defaultValue={driver?.licenseNumber}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expiration permis</label>
          <input name="licenseExpiry" type="date" defaultValue={toDateInput(driver?.licenseExpiry)}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
          <input name="birthDate" type="date" defaultValue={toDateInput(driver?.birthDate)}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
          <input name="address" defaultValue={driver?.address ?? ""}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea name="notes" rows={3} defaultValue={driver?.notes ?? ""}
          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
      </div>

      <button type="submit" disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
        {loading ? "Enregistrement..." : driver ? "Mettre à jour" : "Ajouter le chauffeur"}
      </button>
    </form>
  )
}
