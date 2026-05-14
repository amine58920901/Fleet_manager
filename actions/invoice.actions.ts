"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { generateDocumentNumber } from "@/lib/utils"
import type { CreateInvoiceInput, ActionResponse } from "@/types"
import type { Invoice } from "@prisma/client"

export async function createInvoiceAction(data: CreateInvoiceInput): Promise<ActionResponse<Invoice>> {
  try {
    const session = await auth()
    if (!session) return { success: false, error: "Non autorisé" }

    const lastInvoice = await db.invoice.findFirst({
      where: { organizationId: session.user.organizationId },
      orderBy: { createdAt: "desc" },
      select: { number: true },
    })

    const number = generateDocumentNumber("FAC", lastInvoice?.number ?? null)
    const taxRate = data.taxRate ?? 19
    const taxAmount = data.subtotal * (taxRate / 100)
    const total = data.subtotal + taxAmount

    const invoice = await db.invoice.create({
      data: {
        number,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientPhone: data.clientPhone,
        clientAddress: data.clientAddress,
        dueDate: data.dueDate,
        subtotal: data.subtotal,
        taxRate,
        taxAmount,
        total,
        notes: data.notes,
        quoteId: data.quoteId,
        organizationId: session.user.organizationId,
      },
    })

    revalidatePath("/invoices")
    return { success: true, data: invoice }
  } catch {
    return { success: false, error: "Erreur lors de la création de la facture" }
  }
}

export async function updateInvoiceStatusAction(
  id: string,
  status: "UNPAID" | "PAID" | "OVERDUE" | "CANCELLED"
): Promise<ActionResponse<Invoice>> {
  try {
    const session = await auth()
    if (!session) return { success: false, error: "Non autorisé" }

    const invoice = await db.invoice.update({
      where: { id, organizationId: session.user.organizationId },
      data: { status },
    })

    revalidatePath("/invoices")
    revalidatePath(`/invoices/${id}`)
    return { success: true, data: invoice }
  } catch {
    return { success: false, error: "Erreur lors de la mise à jour" }
  }
}

export async function createInstallmentInvoiceAction(
  quoteId: string,
  installmentNumber: number
): Promise<ActionResponse<Invoice>> {
  try {
    const session = await auth()
    if (!session) return { success: false, error: "Non autorisé" }

    const quote = await db.quote.findFirst({
      where: { id: quoteId, organizationId: session.user.organizationId },
    })
    if (!quote) return { success: false, error: "Devis introuvable" }
    if (quote.billingMode !== "MONTHLY") return { success: false, error: "Ce devis n'est pas en mode mensuel" }
    if (!quote.installmentAmount || !quote.totalInstallments) return { success: false, error: "Données de mensualité manquantes" }
    if (installmentNumber < 1 || installmentNumber > quote.totalInstallments) {
      return { success: false, error: `Numéro de mensualité invalide (1-${quote.totalInstallments})` }
    }

    // Vérifier que cette mensualité n'a pas déjà été générée
    const existing = await db.invoice.findFirst({
      where: { quoteId, installmentNumber, organizationId: session.user.organizationId },
    })
    if (existing) return { success: false, error: `La mensualité ${installmentNumber} a déjà été générée` }

    const lastInvoice = await db.invoice.findFirst({
      where: { organizationId: session.user.organizationId },
      orderBy: { createdAt: "desc" },
      select: { number: true },
    })

    const number = generateDocumentNumber("FAC", lastInvoice?.number ?? null)

    // Calculer la date d'échéance (30 jours après le début + (n-1) mois)
    const startDate = new Date(quote.startDate)
    const dueDate = new Date(startDate)
    dueDate.setMonth(dueDate.getMonth() + installmentNumber)

    // La mensualité = installmentAmount (déjà TTC avec TVA incluse dans le calcul du devis)
    // On recalcule HT / TVA à partir du montant TTC
    const taxRate = Number(quote.taxRate)
    const totalTTC = Number(quote.installmentAmount)
    const subtotal = totalTTC / (1 + taxRate / 100)
    const taxAmount = totalTTC - subtotal

    const invoice = await db.invoice.create({
      data: {
        number,
        clientName: quote.clientName,
        clientEmail: quote.clientEmail ?? undefined,
        clientPhone: quote.clientPhone ?? undefined,
        clientAddress: quote.clientAddress ?? undefined,
        dueDate,
        subtotal,
        taxRate,
        taxAmount,
        total: totalTTC,
        installmentNumber,
        totalInstallments: quote.totalInstallments,
        quoteId,
        notes: `Mensualité ${installmentNumber}/${quote.totalInstallments} — ${quote.vehicleDesc}`,
        organizationId: session.user.organizationId,
      },
    })

    revalidatePath("/invoices")
    revalidatePath(`/quotes/${quoteId}`)
    return { success: true, data: invoice }
  } catch {
    return { success: false, error: "Erreur lors de la création de la mensualité" }
  }
}

export async function deleteInvoiceAction(id: string): Promise<ActionResponse<void>> {
  try {
    const session = await auth()
    if (!session) return { success: false, error: "Non autorisé" }

    await db.invoice.delete({
      where: { id, organizationId: session.user.organizationId },
    })

    revalidatePath("/invoices")
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "Erreur lors de la suppression" }
  }
}
