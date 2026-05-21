import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getResend } from "@/lib/resend"
import crypto from "crypto"
import { z } from "zod"

const schema = z.object({ email: z.string().email() })

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Email invalide" }, { status: 400 })

    const { email } = parsed.data

    const user = await db.user.findUnique({ where: { email } })
    if (!user) return NextResponse.json({ success: true })

    await db.passwordResetToken.deleteMany({ where: { email } })

    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    await db.passwordResetToken.create({ data: { email, token, expiresAt } })

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

    await getResend().emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: "Réinitialisation de votre mot de passe – FleetManager",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <h2 style="color:#111827">Réinitialisation de mot de passe</h2>
          <p style="color:#374151">Bonjour ${user.name ?? ""},</p>
          <p style="color:#374151">Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous (valable 1 heure) :</p>
          <a href="${resetUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0;font-weight:500">
            Réinitialiser mon mot de passe
          </a>
          <p style="color:#6b7280;font-size:14px">Si vous n'avez pas fait cette demande, ignorez simplement cet email.</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
