"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { generateDocumentNumber } from "@/lib/utils"
import type { CreateQuoteInput, ActionResponse } from "@/types"
import type { Quote } from "@prisma/client"

export async function createQuoteAction(data: CreateQuoteInput): Promise<ActionResponse<Quote>> {
  try {
    const session = await auth()
    if (!session) return { success: false, error: "Non autorisé" }

    const lastQuote = await db.quote.findFirst({
      where: { organizationId: session.user.organizationId },
      orderBy: { createdAt: "desc" },
      select: { number: true },
    })

    const number = generateDocumentNumber("DEV", lastQuote?.number ?? null)

    const quote = await db.quote.create({
      data: {
        number,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        clientAddress: data.clientAddress,
        startDate: data.startDate,
        endDate: data.endDate,
        vehicleId: data.vehicleId,
        vehicleDesc: data.vehicleDesc,
        rateType: data.rateType,
        dailyRate: data.dailyRate,
        days: data.days,
        subtotal: data.subtotal,
        discountType: data.discountType,
        discountValue: data.discountValue,
        discountAmount: data.discountAmount,
        taxRate: data.taxRate ?? 20,
        taxAmount: data.taxAmount,
        total: data.total,
        billingMode: data.billingMode,
        installmentAmount: data.installmentAmount,
        totalInstallments: data.totalInstallments,
        notes: data.notes,
        validUntil: data.validUntil,
        organizationId: session.user.organizationId,
      },
    })

    revalidatePath("/quotes")
    return { success: true, data: quote }
  } catch {
    return { success: false, error: "Erreur lors de la création du devis" }
  }
}

export async function updateQuoteStatusAction(
  id: string,
  status: "DRAFT" | "SENT" | "ACCEPTED" | "REFUSED" | "EXPIRED"
): Promise<ActionResponse<Quote & { contractRedirect?: string }>> {
  try {
    const session = await auth()
    if (!session) return { success: false, error: "Non autorisé" }

    const quote = await db.quote.update({
      where: { id, organizationId: session.user.organizationId },
      data: { status },
    })

    revalidatePath("/quotes")
    revalidatePath(`/quotes/${id}`)

    if (status === "ACCEPTED") {
      return {
        success: true,
        data: {
          ...quote,
          contractRedirect: `/contracts/new?quoteId=${id}`,
        },
      }
    }

    return { success: true, data: quote }
  } catch {
    return { success: false, error: "Erreur lors de la mise à jour" }
  }
}

export async function deleteQuoteAction(id: string): Promise<ActionResponse<void>> {
  try {
    const session = await auth()
    if (!session) return { success: false, error: "Non autorisé" }

    await db.quote.delete({
      where: { id, organizationId: session.user.organizationId },
    })

    revalidatePath("/quotes")
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "Erreur lors de la suppression" }
  }
}
