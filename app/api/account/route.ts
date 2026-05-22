import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
})

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })

  const { name, email } = parsed.data

  if (email && email !== session.user.email) {
    const existing = await db.user.findUnique({ where: { email } })
    if (existing) return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 })
  }

  const user = await db.user.update({
    where: { id: session.user.id },
    data: {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
    },
    select: { id: true, name: true, email: true },
  })

  return NextResponse.json(user)
}
