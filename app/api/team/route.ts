import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Accès refusé" }, { status: 403 })

  const users = await db.user.findMany({
    where: { organizationId: session.user.organizationId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json(users)
}

const createSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "USER"]),
})

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 })

  const parsed = createSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 })

  const { firstName, lastName, email, password, role } = parsed.data

  const existing = await db.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 })

  const hashedPassword = await bcrypt.hash(password, 12)

  const created = await db.user.create({
    data: {
      name: `${firstName} ${lastName}`,
      email,
      hashedPassword,
      role,
      organizationId: session.user.organizationId,
    },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })

  return NextResponse.json(created, { status: 201 })
}
