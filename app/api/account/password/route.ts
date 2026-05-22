import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"

const schema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(6),
})

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })

  const { currentPassword, newPassword } = parsed.data

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { hashedPassword: true },
  })
  if (!user?.hashedPassword)
    return NextResponse.json({ error: "Impossible de changer le mot de passe" }, { status: 400 })

  const valid = await bcrypt.compare(currentPassword, user.hashedPassword)
  if (!valid) return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 400 })

  const hashedPassword = await bcrypt.hash(newPassword, 12)
  await db.user.update({ where: { id: session.user.id }, data: { hashedPassword } })

  return NextResponse.json({ success: true })
}
