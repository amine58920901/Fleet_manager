import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") return null
  return session
}

export async function PATCH(req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Accès refusé" }, { status: 403 })

  const { userId } = await params
  const parsed = z.object({ role: z.enum(["ADMIN", "USER"]) }).safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })

  if (userId === session.user.id)
    return NextResponse.json({ error: "Vous ne pouvez pas modifier votre propre rôle" }, { status: 400 })

  const target = await db.user.findFirst({
    where: { id: userId, organizationId: session.user.organizationId },
  })
  if (!target) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 })

  if (parsed.data.role === "USER" && target.role === "ADMIN") {
    const adminCount = await db.user.count({
      where: { organizationId: session.user.organizationId, role: "ADMIN" },
    })
    if (adminCount <= 1)
      return NextResponse.json({ error: "Il doit rester au moins un administrateur" }, { status: 400 })
  }

  const updated = await db.user.update({
    where: { id: userId },
    data: { role: parsed.data.role },
    select: { id: true, name: true, email: true, role: true },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ userId: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Accès refusé" }, { status: 403 })

  const { userId } = await params

  if (userId === session.user.id)
    return NextResponse.json({ error: "Vous ne pouvez pas supprimer votre propre compte" }, { status: 400 })

  const target = await db.user.findFirst({
    where: { id: userId, organizationId: session.user.organizationId },
  })
  if (!target) return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 })

  await db.user.delete({ where: { id: userId } })
  return NextResponse.json({ success: true })
}
