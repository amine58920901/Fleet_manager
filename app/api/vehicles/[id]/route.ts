import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const { id } = await params

  const vehicle = await db.vehicle.findFirst({
    where: { id, organizationId: session.user.organizationId },
    include: { contracts: { where: { status: "ACTIVE" }, take: 1 } },
  })

  if (!vehicle) return NextResponse.json({ error: "Véhicule introuvable" }, { status: 404 })

  if (vehicle.contracts.length > 0)
    return NextResponse.json(
      { error: "Impossible de supprimer un véhicule avec un contrat actif" },
      { status: 400 }
    )

  await db.vehicle.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
