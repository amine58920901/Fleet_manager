"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { generateDocumentNumber } from "@/lib/utils"
import type { CreateContractInput, ActionResponse } from "@/types"
import type { Contract } from "@prisma/client"

export async function createContractAction(data: CreateContractInput): Promise<ActionResponse<Contract>> {
  try {
    const session = await auth()
    if (!session) return { success: false, error: "Non autorisé" }

    const lastContract = await db.contract.findFirst({
      where: { organizationId: session.user.organizationId },
      orderBy: { createdAt: "desc" },
      select: { number: true },
    })

    const number = generateDocumentNumber("CTR", lastContract?.number ?? null)

    const contract = await db.contract.create({
      data: {
        number,
        startDate: data.startDate,
        endDate: data.endDate,
        vehicleId: data.vehicleId,
        driverId: data.driverId,
        depositAmount: data.depositAmount,
        mileageStart: data.mileageStart,
        fuelLevelStart: data.fuelLevelStart,
        conditionStart: data.conditionStart ?? undefined,
        terms: data.terms,
        invoiceId: data.invoiceId,
        quoteId: data.quoteId,
        organizationId: session.user.organizationId,
        paymentAmount: data.paymentAmount,
        paymentTaxType: data.paymentTaxType,
        paymentDueDay: data.paymentDueDay,
        paymentMethod: data.paymentMethod,
        depositReturnConditions: data.depositReturnConditions,
        mileageAllowance: data.mileageAllowance,
        extraMileageCost: data.extraMileageCost,
        insuranceFranchise: data.insuranceFranchise,
        insuranceInfo: data.insuranceInfo,
        maintenanceInfo: data.maintenanceInfo,
        returnLocation: data.returnLocation,
        earlyTerminationConditions: data.earlyTerminationConditions,
      },
    })

    // Mettre le véhicule en statut RENTED
    await db.vehicle.update({
      where: { id: data.vehicleId },
      data: { status: "RENTED" },
    })

    revalidatePath("/contracts")
    revalidatePath("/vehicles")
    return { success: true, data: contract }
  } catch {
    return { success: false, error: "Erreur lors de la création du contrat" }
  }
}

export async function closeContractAction(
  id: string,
  mileageEnd: number,
  fuelLevelEnd: string,
  conditionEnd?: Record<string, { type: string; severity: string; note: string }>
): Promise<ActionResponse<Contract>> {
  try {
    const session = await auth()
    if (!session) return { success: false, error: "Non autorisé" }

    const contract = await db.contract.update({
      where: { id, organizationId: session.user.organizationId },
      data: {
        status: "COMPLETED",
        returnedAt: new Date(),
        mileageEnd,
        fuelLevelEnd,
        conditionEnd: conditionEnd ?? undefined,
      },
    })

    // Remettre le véhicule en AVAILABLE
    await db.vehicle.update({
      where: { id: contract.vehicleId },
      data: { status: "AVAILABLE", mileage: mileageEnd },
    })

    revalidatePath("/contracts")
    revalidatePath(`/contracts/${id}`)
    revalidatePath("/vehicles")
    return { success: true, data: contract }
  } catch {
    return { success: false, error: "Erreur lors de la clôture du contrat" }
  }
}

export async function deleteContractAction(id: string): Promise<ActionResponse<void>> {
  try {
    const session = await auth()
    if (!session) return { success: false, error: "Non autorisé" }

    const contract = await db.contract.findUnique({ where: { id } })
    if (contract) {
      await db.vehicle.update({
        where: { id: contract.vehicleId },
        data: { status: "AVAILABLE" },
      })
    }

    await db.contract.delete({
      where: { id, organizationId: session.user.organizationId },
    })

    revalidatePath("/contracts")
    revalidatePath("/vehicles")
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "Erreur lors de la suppression" }
  }
}
