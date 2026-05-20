import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"

const schema = z.object({
  token: z.string(),
  password: z.string().min(6),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })

    const { token, password } = parsed.data

    const resetToken = await db.passwordResetToken.findUnique({ where: { token } })
    if (!resetToken || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: "Lien invalide ou expiré" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    await db.user.update({
      where: { email: resetToken.email },
      data: { hashedPassword },
    })

    await db.passwordResetToken.delete({ where: { token } })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
