import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { db } from "@/lib/db"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  organizationName: z.string().min(1),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 })
    }

    const { name, email, password, organizationName } = parsed.data

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const organization = await db.organization.create({
      data: { name: organizationName },
    })

    await db.user.create({
      data: {
        name,
        email,
        hashedPassword,
        role: "ADMIN",
        organizationId: organization.id,
      },
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
