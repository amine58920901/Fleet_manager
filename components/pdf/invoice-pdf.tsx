import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer"
import type { Invoice, OrganizationSettings } from "@prisma/client"

function makeStyles(s: OrganizationSettings | null) {
  const primary = s?.primaryColor ?? "#2563eb"
  const secondary = s?.secondaryColor ?? "#1e40af"
  const accent = s?.accentColor ?? "#eff6ff"

  return StyleSheet.create({
    page: { fontFamily: "Helvetica", fontSize: 10, color: "#1f2937", backgroundColor: "#ffffff", paddingBottom: 60 },
    header: { backgroundColor: primary, padding: 24, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    logo: { width: 48, height: 48, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.2)" },
    companyName: { color: "#ffffff", fontSize: 14, fontFamily: "Helvetica-Bold" },
    companyInfo: { color: "rgba(255,255,255,0.75)", fontSize: 8, marginTop: 2 },
    docType: { color: "#ffffff", fontSize: 20, fontFamily: "Helvetica-Bold", textAlign: "right" },
    docNumber: { color: "rgba(255,255,255,0.75)", fontSize: 9, textAlign: "right", marginTop: 2 },
    body: { padding: 24 },
    infoRow: { flexDirection: "row", gap: 16, marginBottom: 20 },
    infoBox: { flex: 1, backgroundColor: accent, borderRadius: 6, padding: 14 },
    infoTitle: { fontSize: 8, color: primary, fontFamily: "Helvetica-Bold", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
    infoText: { fontSize: 9, color: "#374151", lineHeight: 1.5 },
    infoTextBold: { fontSize: 10, color: "#111827", fontFamily: "Helvetica-Bold", marginBottom: 3 },
    statusPaid: { backgroundColor: "#dcfce7", borderRadius: 4, padding: "4 10" },
    statusUnpaid: { backgroundColor: "#fff7ed", borderRadius: 4, padding: "4 10" },
    statusText: { fontSize: 8, fontFamily: "Helvetica-Bold" },
    tableHeader: { flexDirection: "row", backgroundColor: primary, borderRadius: 4, padding: "8 12" },
    tableHeaderText: { color: "#ffffff", fontSize: 9, fontFamily: "Helvetica-Bold" },
    tableRow: { flexDirection: "row", padding: "8 12", borderBottom: "1 solid #f3f4f6" },
    tableText: { color: "#374151", fontSize: 9 },
    col1: { flex: 3 },
    col2: { flex: 1.5, textAlign: "right" },
    totalsBox: { marginTop: 16, marginLeft: "auto", width: 220 },
    totalRow: { flexDirection: "row", justifyContent: "space-between", padding: "5 0", borderBottom: "1 solid #e5e7eb" },
    totalLabel: { fontSize: 9, color: "#6b7280" },
    totalValue: { fontSize: 9, color: "#374151" },
    grandTotalRow: { flexDirection: "row", justifyContent: "space-between", backgroundColor: primary, borderRadius: 4, padding: "10 12", marginTop: 6 },
    grandTotalLabel: { fontSize: 11, color: "#ffffff", fontFamily: "Helvetica-Bold" },
    grandTotalValue: { fontSize: 11, color: "#ffffff", fontFamily: "Helvetica-Bold" },
    notesBox: { marginTop: 20, padding: 14, backgroundColor: "#f9fafb", borderRadius: 6, borderLeft: `3 solid ${primary}` },
    notesTitle: { fontSize: 8, color: primary, fontFamily: "Helvetica-Bold", marginBottom: 4 },
    notesText: { fontSize: 9, color: "#6b7280", lineHeight: 1.5 },
    paymentBox: { marginTop: 20, padding: 14, backgroundColor: accent, borderRadius: 6 },
    paymentTitle: { fontSize: 8, color: primary, fontFamily: "Helvetica-Bold", marginBottom: 6 },
    paymentText: { fontSize: 9, color: "#374151" },
    footer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#f9fafb", borderTop: "1 solid #e5e7eb", padding: "10 24", flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    footerText: { fontSize: 8, color: "#9ca3af" },
    footerBold: { fontSize: 8, color: secondary, fontFamily: "Helvetica-Bold" },
  })
}

function formatMoney(n: unknown) {
  const num = Number(n)
  const [int, dec] = num.toFixed(2).split(".")
  const intFmt = int.replace(/\B(?=(\d{3})+(?!\d))/g, " ")
  return `${intFmt},${dec} €`
}

function fmt(d: Date | string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
}

const statusLabels: Record<string, string> = {
  UNPAID: "Non payée",
  PAID: "Payée",
  OVERDUE: "En retard",
  CANCELLED: "Annulée",
}

interface InvoicePDFProps {
  invoice: Invoice
  settings: OrganizationSettings | null
}

export function InvoicePDF({ invoice, settings }: InvoicePDFProps) {
  const styles = makeStyles(settings)
  const companyName = settings?.companyName ?? "FleetManager"

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {settings?.logoBase64 ? (
              <Image src={settings.logoBase64} style={styles.logo} />
            ) : (
              <View style={styles.logo} />
            )}
            <View>
              <Text style={styles.companyName}>{companyName}</Text>
              {settings?.companyAddress && <Text style={styles.companyInfo}>{settings.companyAddress}</Text>}
              {settings?.companyPhone && <Text style={styles.companyInfo}>{settings.companyPhone}</Text>}
            </View>
          </View>
          <View>
            <Text style={styles.docType}>FACTURE</Text>
            <Text style={styles.docNumber}>{invoice.number}</Text>
            <Text style={styles.docNumber}>Le {fmt(invoice.issueDate)}</Text>
          </View>
        </View>

        <View style={styles.body}>

          {/* Info boxes */}
          <View style={styles.infoRow}>
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Émetteur</Text>
              <Text style={styles.infoTextBold}>{companyName}</Text>
              {settings?.companyAddress && <Text style={styles.infoText}>{settings.companyAddress}</Text>}
              {settings?.companyPhone && <Text style={styles.infoText}>{settings.companyPhone}</Text>}
              {settings?.companyEmail && <Text style={styles.infoText}>{settings.companyEmail}</Text>}
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Facturé à</Text>
              <Text style={styles.infoTextBold}>{invoice.clientName}</Text>
              {invoice.clientAddress && <Text style={styles.infoText}>{invoice.clientAddress}</Text>}
              {invoice.clientPhone && <Text style={styles.infoText}>{invoice.clientPhone}</Text>}
              {invoice.clientEmail && <Text style={styles.infoText}>{invoice.clientEmail}</Text>}
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Échéances</Text>
              <Text style={styles.infoText}>Émise le {fmt(invoice.issueDate)}</Text>
              <Text style={styles.infoText}>Due le {fmt(invoice.dueDate)}</Text>
              <View style={{ marginTop: 8 }}>
                <View style={invoice.status === "PAID" ? styles.statusPaid : styles.statusUnpaid}>
                  <Text style={[styles.statusText, { color: invoice.status === "PAID" ? "#15803d" : "#c2410c" }]}>
                    {statusLabels[invoice.status]}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Table */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.col1]}>Description</Text>
            <Text style={[styles.tableHeaderText, styles.col2]}>Montant HT</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableText, styles.col1]}>
              {invoice.notes ?? "Prestation de location de véhicule"}
              {invoice.totalInstallments && invoice.installmentNumber
                ? `\nMensualité ${invoice.installmentNumber}/${invoice.totalInstallments}`
                : ""}
            </Text>
            <Text style={[styles.tableText, styles.col2]}>{formatMoney(invoice.subtotal)}</Text>
          </View>

          {/* Totals */}
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Sous-total HT</Text>
              <Text style={styles.totalValue}>{formatMoney(invoice.subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TVA ({Number(invoice.taxRate)}%)</Text>
              <Text style={styles.totalValue}>{formatMoney(invoice.taxAmount)}</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total TTC</Text>
              <Text style={styles.grandTotalValue}>{formatMoney(invoice.total)}</Text>
            </View>
          </View>

          {/* Notes */}
          {invoice.notes && (
            <View style={styles.notesBox}>
              <Text style={styles.notesTitle}>Notes</Text>
              <Text style={styles.notesText}>{invoice.notes}</Text>
            </View>
          )}

          {/* Payment info */}
          {settings?.companyEmail && (
            <View style={styles.paymentBox}>
              <Text style={styles.paymentTitle}>Informations de paiement</Text>
              <Text style={styles.paymentText}>Contact : {settings.companyEmail}</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{companyName}</Text>
          {settings?.siret && <Text style={styles.footerText}>SIRET : {settings.siret}</Text>}
          <Text style={styles.footerBold}>{invoice.number}</Text>
        </View>

      </Page>
    </Document>
  )
}
