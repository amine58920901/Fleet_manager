import { db } from "@/lib/db"
import { generateDocumentNumber } from "@/lib/utils"

/**
 * Cron quotidien (0 0 * * * — minuit UTC)
 * Appelé par Vercel Cron avec le header Authorization: Bearer CRON_SECRET
 *
 * Logique :
 * - Pour chaque devis LLD accepté (billingMode=MONTHLY, status=ACCEPTED)
 * - La mensualité N est due le même jour du mois que startDate + (N-1) mois
 *   Ex : start 01/04 → mensualité 1 due 01/04, mensualité 2 due 01/05, ...
 *   Ex : start 15/05 → mensualité 1 due 15/05, mensualité 2 due 15/06, ...
 * - Si aujourd'hui >= date due de la mensualité N et qu'elle n'existe pas encore → on la crée
 * - Approche "rattrapage" : si le cron a raté un jour, il rattrape les mensualités en retard
 */
export async function GET(req: Request) {
  // Vérification du secret
  const auth = req.headers.get("authorization")
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Non autorisé", { status: 401 })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Récupérer tous les devis LLD acceptés qui ont commencé
  const lldQuotes = await db.quote.findMany({
    where: {
      billingMode: "MONTHLY",
      status: "ACCEPTED",
      startDate: { lte: today },
      installmentAmount: { not: null },
      totalInstallments: { not: null },
    },
    include: {
      invoices: {
        select: { installmentNumber: true, status: true },
      },
    },
  })

  let generated = 0
  const errors: string[] = []

  for (const quote of lldQuotes) {
    const startDate = new Date(quote.startDate)
    startDate.setHours(0, 0, 0, 0)
    const totalInstallments = quote.totalInstallments!
    const installmentAmount = Number(quote.installmentAmount!)
    const taxRate = Number(quote.taxRate)

    // Mensualités déjà émises (non annulées)
    const existingNums = new Set(
      quote.invoices
        .filter((i) => i.status !== "CANCELLED")
        .map((i) => i.installmentNumber)
        .filter((n): n is number => n !== null)
    )

    // Calculer quelles mensualités sont dues aujourd'hui ou déjà en retard
    for (let n = 1; n <= totalInstallments; n++) {
      if (existingNums.has(n)) continue // déjà générée

      // Date due = startDate + (n-1) mois
      const dueDate = new Date(startDate)
      dueDate.setMonth(dueDate.getMonth() + (n - 1))
      dueDate.setHours(0, 0, 0, 0)

      if (dueDate > today) break // pas encore due, et les suivantes non plus

      // Créer la facture
      try {
        const lastInvoice = await db.invoice.findFirst({
          where: { organizationId: quote.organizationId },
          orderBy: { createdAt: "desc" },
          select: { number: true },
        })

        const number = generateDocumentNumber("FAC", lastInvoice?.number ?? null)

        // Reconstituer HT depuis le TTC
        const subtotal = installmentAmount / (1 + taxRate / 100)
        const taxAmount = installmentAmount - subtotal

        // Date d'échéance = fin du mois de facturation
        const invoiceDueDate = new Date(dueDate)
        invoiceDueDate.setMonth(invoiceDueDate.getMonth() + 1)
        invoiceDueDate.setDate(0) // dernier jour du mois

        await db.invoice.create({
          data: {
            number,
            clientName: quote.clientName,
            clientEmail: quote.clientEmail ?? undefined,
            clientPhone: quote.clientPhone ?? undefined,
            clientAddress: quote.clientAddress ?? undefined,
            dueDate: invoiceDueDate,
            subtotal,
            taxRate,
            taxAmount,
            total: installmentAmount,
            installmentNumber: n,
            totalInstallments,
            quoteId: quote.id,
            notes: `Mensualité ${n}/${totalInstallments} — ${quote.vehicleDesc}`,
            organizationId: quote.organizationId,
          },
        })

        generated++
      } catch (e) {
        errors.push(`Quote ${quote.number} mensualité ${n}: ${e}`)
      }
    }
  }

  return Response.json({
    ok: true,
    processedQuotes: lldQuotes.length,
    generated,
    errors,
    runAt: new Date().toISOString(),
  })
}
