import { readFile } from "fs/promises"
import { join } from "path"
import { NextResponse } from "next/server"

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params
  const ext = filename.split(".").pop()?.toLowerCase() ?? ""
  const mime = MIME[ext]
  if (!mime) return new NextResponse("Not found", { status: 404 })

  const filepath = join(process.cwd(), "public", "uploads", "vehicles", filename)

  try {
    const buffer = await readFile(filepath)
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch {
    return new NextResponse("Not found", { status: 404 })
  }
}
