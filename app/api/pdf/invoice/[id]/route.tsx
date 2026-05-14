import { renderToBuffer } from "@react-pdf/renderer"
import React from "react"
import { InvoicePDF } from "@/components/pdf/invoice-pdf"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return new Response("Non autorisé", { status: 401 })

  const [invoice, settings] = await Promise.all([
    db.invoice.findUnique({ where: { id, organizationId: session.user.organizationId } }),
    db.organizationSettings.findUnique({ where: { organizationId: session.user.organizationId } }),
  ])

  if (!invoice) return new Response("Facture introuvable", { status: 404 })

  const buffer = await renderToBuffer(React.createElement(InvoicePDF, { invoice, settings }) as any)

  return new Response(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="facture-${invoice.number}.pdf"`,
    },
  })
}
