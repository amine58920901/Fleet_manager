import {
  Document, Page, Text, View, StyleSheet, Font, Image,
} from "@react-pdf/renderer"
import type { Invoice, OrganizationSettings } from "@prisma/client"
import path from "path"

Font.register({
  family: "Plus Jakarta Sans",
  fonts: [
    { src: path.join(process.cwd(), "public/fonts/PlusJakartaSans-Regular.ttf"), fontWeight: 400 },
    { src: path.join(process.cwd(), "public/fonts/PlusJakartaSans-Bold.ttf"), fontWeight: 700 },
  ],
})

Font.register({
  family: "Montserrat",
  fonts: [
    { src: path.join(process.cwd(), "public/fonts/Montserrat-Regular.ttf"), fontWeight: 400 },
    { src: path.join(process.cwd(), "public/fonts/Montserrat-Bold.ttf"), fontWeight: 700 },
  ],
})

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Plus Jakarta Sans", fontSize: 10, color: "#1e293b", backgroundColor: "#ffffff", paddingBottom: 70 },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30, backgroundColor: "#1e3a8a", padding: 20, borderRadius: 8 },
  companyName: { fontSize: 20, fontWeight: 700, color: "#ffffff" },
  companyInfo: { fontSize: 8, marginTop: 4, color: "rgba(255,255,255,0.8)" },
  docTitle: { fontSize: 24, fontWeight: 700, color: "#ffffff", textAlign: "right" },
  docId: { fontSize: 10, marginTop: 4, color: "rgba(255,255,255,0.85)", textAlign: "right" },
  sectionRow: { flexDirection: "row", gap: 16, marginBottom: 20 },
  card: { flex: 1, padding: 15, borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 8, backgroundColor: "#f8fafc" },
  cardTitle: { fontSize: 8, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 8, borderBottomWidth: 1, borderBottomColor: "#e2e8f0", paddingBottom: 4 },
  cardText: { fontSize: 10, marginBottom: 2, color: "#1e293b" },
  bold: { fontWeight: 700 },
  tableHeader: { flexDirection: "row", backgroundColor: "#1e3a8a", color: "#ffffff", padding: 8, borderRadius: 4, fontWeight: 700 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f1f5f9", padding: 8 },
  col1: { flex: 3 },
  col2: { flex: 1, textAlign: "right" },
  totalSection: { marginTop: 20, alignItems: "flex-end" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4, paddingVertical: 3, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  totalLabel: { fontSize: 9, color: "#64748b" },
  totalValue: { fontSize: 9, color: "#374151" },
  totalBox: { backgroundColor: "#1e3a8a", color: "#ffffff", padding: 15, borderRadius: 8, width: 210, marginTop: 8 },
  totalBoxRow: { flexDirection: "row", justifyContent: "space-between" },
  notesBox: { marginTop: 16, padding: 12, backgroundColor: "#f8fafc", borderRadius: 6, borderLeftWidth: 3, borderLeftColor: "#1e3a8a" },
  notesTitle: { fontSize: 8, fontWeight: 700, color: "#1e3a8a", marginBottom: 4 },
  notesText: { fontSize: 9, color: "#64748b", lineHeight: 1.5 },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, borderTopWidth: 1, borderTopColor: "#e2e8f0", paddingTop: 10, flexDirection: "row", justifyContent: "space-between", fontSize: 8, color: "#94a3b8" },
})

const statusConfig: Record<string, { label: string; bg: string; color: string }> = {
  PAID:      { label: "PAYÉE",    bg: "#dcfce7", color: "#166534" },
  UNPAID:    { label: "IMPAYÉE",  bg: "#fff7ed", color: "#c2410c" },
  OVERDUE:   { label: "EN RETARD", bg: "#fef2f2", color: "#991b1b" },
  CANCELLED: { label: "ANNULÉE", bg: "#f1f5f9", color: "#475569" },
}

function formatMoney(n: unknown) {
  const num = Number(n)
  const [int, dec] = num.toFixed(2).split(".")
  return `${int.replace(/\B(?=(\d{3})+(?!\d))/g, " ")},${dec} €`
}

function fmt(d: Date | string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
}

interface InvoicePDFProps {
  invoice: Invoice
  settings: OrganizationSettings | null
}

const BUILTIN_FONTS = new Set(["Helvetica", "Times-Roman", "Courier"])

function resolveFont(documentFont: string | null | undefined): string {
  return BUILTIN_FONTS.has(documentFont ?? "") ? documentFont! : (documentFont ?? "Plus Jakarta Sans")
}

export function InvoicePDF({ invoice, settings }: InvoicePDFProps) {
  const companyName = settings?.companyName ?? "FleetManager"
  const fontFamily = resolveFont(settings?.documentFont)
  const status = statusConfig[invoice.status] ?? statusConfig.UNPAID

  return (
    <Document>
      <Page size="A4" style={[styles.page, { fontFamily }]}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            {settings?.logoBase64 && (
              <Image src={settings.logoBase64} style={{ width: 40, height: 40, marginBottom: 6, borderRadius: 4 }} />
            )}
            <Text style={styles.companyName}>{companyName}</Text>
            {settings?.companyAddress && <Text style={styles.companyInfo}>{settings.companyAddress}</Text>}
            {settings?.companyPhone && <Text style={styles.companyInfo}>{settings.companyPhone}</Text>}
          </View>
          <View>
            <Text style={styles.docTitle}>Facture</Text>
            <Text style={styles.docId}>{invoice.number}</Text>
            <Text style={styles.docId}>Le {fmt(invoice.issueDate)}</Text>
          </View>
        </View>

        {/* Info cards */}
        <View style={styles.sectionRow}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Émetteur</Text>
            <Text style={[styles.cardText, styles.bold]}>{companyName}</Text>
            {settings?.companyAddress && <Text style={styles.cardText}>{settings.companyAddress}</Text>}
            {settings?.companyPhone && <Text style={styles.cardText}>{settings.companyPhone}</Text>}
            {settings?.companyEmail && <Text style={styles.cardText}>{settings.companyEmail}</Text>}
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Facturé à</Text>
            <Text style={[styles.cardText, styles.bold]}>{invoice.clientName}</Text>
            {invoice.clientAddress && <Text style={styles.cardText}>{invoice.clientAddress}</Text>}
            {invoice.clientPhone && <Text style={styles.cardText}>{invoice.clientPhone}</Text>}
            {invoice.clientEmail && <Text style={styles.cardText}>{invoice.clientEmail}</Text>}
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Échéances</Text>
            <Text style={styles.cardText}>Émise le : {fmt(invoice.issueDate)}</Text>
            <Text style={styles.cardText}>Due le : {fmt(invoice.dueDate)}</Text>
            <View style={{ marginTop: 8, padding: 4, backgroundColor: status.bg, borderRadius: 4 }}>
              <Text style={{ color: status.color, fontSize: 8, textAlign: "center", fontWeight: 700 }}>
                {status.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Table */}
        <View style={styles.tableHeader}>
          <Text style={[styles.col1, { color: "#ffffff", fontWeight: 700 }]}>Description</Text>
          <Text style={[styles.col2, { color: "#ffffff", fontWeight: 700 }]}>Montant HT</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.col1}>
            {invoice.notes ?? "Prestation de location de véhicule"}
            {invoice.totalInstallments && invoice.installmentNumber
              ? `\nMensualité ${invoice.installmentNumber}/${invoice.totalInstallments}`
              : ""}
          </Text>
          <Text style={[styles.col2, { color: "#374151" }]}>{formatMoney(invoice.subtotal)}</Text>
        </View>

        {/* Totals */}
        <View style={styles.totalSection}>
          <View style={{ width: 210 }}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Sous-total HT</Text>
              <Text style={styles.totalValue}>{formatMoney(invoice.subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TVA ({Number(invoice.taxRate)}%)</Text>
              <Text style={styles.totalValue}>{formatMoney(invoice.taxAmount)}</Text>
            </View>
            <View style={styles.totalBox}>
              <View style={styles.totalBoxRow}>
                <Text style={{ fontSize: 12, fontWeight: 700, color: "#ffffff" }}>Total TTC</Text>
                <Text style={{ fontSize: 16, fontWeight: 700, color: "#ffffff" }}>{formatMoney(invoice.total)}</Text>
              </View>
            </View>
          </View>
        </View>

        {settings?.companyEmail && (
          <View style={[styles.notesBox, { marginTop: 20 }]}>
            <Text style={styles.notesTitle}>Informations de paiement</Text>
            <Text style={styles.notesText}>Contact : {settings.companyEmail}</Text>
          </View>
        )}

        <View style={styles.footer} fixed>
          <Text>{companyName}{settings?.siret ? ` — SIRET : ${settings.siret}` : ""}</Text>
          <Text>© {new Date().getFullYear()} {companyName}</Text>
        </View>
      </Page>
    </Document>
  )
}
