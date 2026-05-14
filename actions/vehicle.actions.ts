"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import type { CreateVehicleInput, UpdateVehicleInput, ActionResponse } from "@/types"
import type { Vehicle } from "@prisma/client"

export async function createVehicleAction(data: CreateVehicleInput): Promise<ActionResponse<Vehicle>> {
  try {
    const session = await auth()
    if (!session) return { success: false, error: "Non autorisé" }

    const vehicle = await db.vehicle.create({
      data: {
        ...data,
        dailyRate: data.dailyRate,
        organizationId: session.user.organizationId,
      },
    })

    revalidatePath("/vehicles")
    return { success: true, data: vehicle }
  } catch {
    return { success: false, error: "Erreur lors de la création du véhicule" }
  }
}

export async function updateVehicleAction(id: string, data: UpdateVehicleInput): Promise<ActionResponse<Vehicle>> {
  try {
    const session = await auth()
    if (!session) return { success: false, error: "Non autorisé" }

    const vehicle = await db.vehicle.update({
      where: { id, organizationId: session.user.organizationId },
      data,
    })

    revalidatePath("/vehicles")
    revalidatePath(`/vehicles/${id}`)
    return { success: true, data: vehicle }
  } catch {
    return { success: false, error: "Erreur lors de la mise à jour" }
  }
}

export async function deleteVehicleAction(id: string): Promise<ActionResponse<void>> {
  try {
    const session = await auth()
    if (!session) return { success: false, error: "Non autorisé" }

    await db.vehicle.delete({
      where: { id, organizationId: session.user.organizationId },
    })

    revalidatePath("/vehicles")
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "Erreur lors de la suppression" }
  }
}
