import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { auth } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) return NextResponse.json({ error: "Aucun fichier" }, { status: 400 })

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"]
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Format non supporté (JPEG, PNG, WEBP, AVIF)" }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Image trop grande (max 5 Mo)" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const uploadDir = join(process.cwd(), "public", "uploads", "vehicles")

    await mkdir(uploadDir, { recursive: true })
    await writeFile(join(uploadDir, filename), buffer)

    return NextResponse.json({ url: `/uploads/vehicles/${filename}` })
  } catch (err) {
    console.error("[upload] error:", err)
    return NextResponse.json({ error: "Erreur serveur lors de l'upload" }, { status: 500 })
  }
}
