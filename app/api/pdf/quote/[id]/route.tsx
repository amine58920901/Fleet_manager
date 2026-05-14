import { renderToBuffer } from "@react-pdf/renderer"
import React from "react"
import { QuotePDF } from "@/components/pdf/quote-pdf"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return new Response("Non autorisé", { status: 401 })

  const [quote, settings] = await Promise.all([
    db.quote.findUnique({ where: { id, organizationId: session.user.organizationId } }),
    db.organizationSettings.findUnique({ where: { organizationId: session.user.organizationId } }),
  ])

  if (!quote) return new Response("Devis introuvable", { status: 404 })

  const buffer = await renderToBuffer(React.createElement(QuotePDF, { quote, settings }) as any)

  return new Response(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="devis-${quote.number}.pdf"`,
    },
  })
}
