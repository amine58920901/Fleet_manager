"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import type { CreateDriverInput, UpdateDriverInput, ActionResponse } from "@/types"
import type { Driver } from "@prisma/client"

export async function createDriverAction(data: CreateDriverInput): Promise<ActionResponse<Driver>> {
  try {
    const session = await auth()
    if (!session) return { success: false, error: "Non autorisé" }

    const driver = await db.driver.create({
      data: {
        ...data,
        organizationId: session.user.organizationId,
      },
    })

    revalidatePath("/drivers")
    return { success: true, data: driver }
  } catch {
    return { success: false, error: "Erreur lors de la création du chauffeur" }
  }
}

export async function updateDriverAction(id: string, data: UpdateDriverInput): Promise<ActionResponse<Driver>> {
  try {
    const session = await auth()
    if (!session) return { success: false, error: "Non autorisé" }

    const driver = await db.driver.update({
      where: { id, organizationId: session.user.organizationId },
      data,
    })

    revalidatePath("/drivers")
    revalidatePath(`/drivers/${id}`)
    return { success: true, data: driver }
  } catch {
    return { success: false, error: "Erreur lors de la mise à jour" }
  }
}

export async function deleteDriverAction(id: string): Promise<ActionResponse<void>> {
  try {
    const session = await auth()
    if (!session) return { success: false, error: "Non autorisé" }

    await db.driver.delete({
      where: { id, organizationId: session.user.organizationId },
    })

    revalidatePath("/drivers")
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "Erreur lors de la suppression" }
  }
}
