import { renderToBuffer } from "@react-pdf/renderer"
import React from "react"
import { ContractPDF } from "@/components/pdf/contract-pdf"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return new Response("Non autorisé", { status: 401 })

  const [contract, settings] = await Promise.all([
    db.contract.findUnique({
      where: { id, organizationId: session.user.organizationId },
      include: { vehicle: true, driver: true },
    }),
    db.organizationSettings.findUnique({ where: { organizationId: session.user.organizationId } }),
  ])

  if (!contract) return new Response("Contrat introuvable", { status: 404 })

  const buffer = await renderToBuffer(React.createElement(ContractPDF, { contract, settings }) as any)

  return new Response(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="contrat-${contract.number}.pdf"`,
    },
  })
}
