"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import type { ActionResponse } from "@/types"
import type { OrganizationSettings } from "@prisma/client"

export type SettingsInput = {
  // Société
  companyName?: string
  legalForm?: string
  siret?: string
  vatNumber?: string
  companyAddress?: string
  companyCity?: string
  companyZip?: string
  companyCountry?: string
  companyPhone?: string
  companyEmail?: string
  companyWebsite?: string
  // Documents
  logoBase64?: string | null
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  documentFont?: string
}

export async function saveSettingsAction(data: SettingsInput): Promise<ActionResponse<OrganizationSettings>> {
  try {
    const session = await auth()
    if (!session) return { success: false, error: "Non autorisé" }

    const settings = await db.organizationSettings.upsert({
      where: { organizationId: session.user.organizationId },
      update: data,
      create: {
        ...data,
        primaryColor: data.primaryColor ?? "#2563eb",
        secondaryColor: data.secondaryColor ?? "#1e40af",
        accentColor: data.accentColor ?? "#eff6ff",
        documentFont: data.documentFont ?? "Helvetica",
        organizationId: session.user.organizationId,
      },
    })

    revalidatePath("/settings")
    return { success: true, data: settings }
  } catch {
    return { success: false, error: "Erreur lors de la sauvegarde" }
  }
}
