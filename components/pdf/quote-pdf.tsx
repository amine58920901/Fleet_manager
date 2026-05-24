import {
  Document, Page, Text, View, StyleSheet, Font, Image,
} from "@react-pdf/renderer"
import type { Quote, OrganizationSettings } from "@prisma/client"
import path from "path"

Font.register({
  family: "Plus Jakarta Sans",
  fonts: [
    { src: path.join(process.cwd(), "public/fonts/PlusJakartaSans-Regular.ttf"), fontWeight: 400 },
    { src: path.join(process.cwd(), "public/fonts/PlusJakartaSans-Bold.ttf"), fontWeight: 700 },
  ],
})

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Plus Jakarta Sans", fontSize: 10, color: "#1e293b", paddingBottom: 70 },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30, backgroundColor: "#1e3a8a", padding: 20, borderRadius: 8 },
  companyName: { fontSize: 20, fontWeight: 700, color: "#ffffff" },
  companyInfo: { fontSize: 8, marginTop: 4, color: "rgba(255,255,255,0.8)" },
  docTitle: { fontSize: 24, fontWeight: 700, color: "#ffffff", textAlign: "right" },
  docId: { fontSize: 10, marginTop: 4, color: "rgba(255,255,255,0.85)", textAlign: "right" },
  sectionRow: { flexDirection: "row", gap: 16, marginBottom: 20 },
  card: { flex: 1, padding: 15, borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 8, backgroundColor: "#f8fafc" },
  cardTitle: { fontSize: 8, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 8, borderBottomWidth: 1, borderBottomColor: "#e2e8f0", paddingBottom: 4 },
  cardText: { fontSize: 10, marginBottom: 2, color: "#1e293b" },
  bold: { fontWeight: 700, color: "#1e3a8a" },
  tableHeader: { flexDirection: "row", backgroundColor: "#1e3a8a", color: "#ffffff", padding: 8, borderRadius: 4, fontWeight: 700, marginTop: 20 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f1f5f9", padding: 8 },
  col1: { flex: 3 },
  col2: { flex: 1, textAlign: "center" },
  col3: { flex: 1, textAlign: "right" },
  totalSection: { marginTop: 20, alignItems: "flex-end" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4, paddingVertical: 3, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  totalLabel: { fontSize: 9, color: "#64748b" },
  totalValue: { fontSize: 9, color: "#374151" },
  totalBox: { backgroundColor: "#1e3a8a", color: "#ffffff", padding: 15, borderRadius: 8, width: 210, marginTop: 8 },
  totalBoxRow: { flexDirection: "row", justifyContent: "space-between" },
  installmentBox: { marginTop: 8, padding: 10, backgroundColor: "#eff6ff", borderRadius: 4, flexDirection: "row", justifyContent: "space-between" },
  notesBox: { marginTop: 16, padding: 12, backgroundColor: "#f8fafc", borderRadius: 6, borderLeftWidth: 3, borderLeftColor: "#1e3a8a" },
  notesTitle: { fontSize: 8, fontWeight: 700, color: "#1e3a8a", marginBottom: 4 },
  notesText: { fontSize: 9, color: "#64748b", lineHeight: 1.5 },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, borderTopWidth: 1, borderTopColor: "#e2e8f0", paddingTop: 10, flexDirection: "row", justifyContent: "space-between", fontSize: 8, color: "#94a3b8" },
})

function formatMoney(n: unknown) {
  const num = Number(n)
  const [int, dec] = num.toFixed(2).split(".")
  return `${int.replace(/\B(?=(\d{3})+(?!\d))/g, " ")},${dec} €`
}

function fmt(d: Date | string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
}

interface QuotePDFProps {
  quote: Quote
  settings: OrganizationSettings | null
}

export function QuotePDF({ quote, settings }: QuotePDFProps) {
  const companyName = settings?.companyName ?? "FleetManager"

  return (
    <Document>
      <Page size="A4" style={styles.page}>
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
            <Text style={styles.docTitle}>Devis</Text>
            <Text style={styles.docId}>{quote.number}</Text>
            <Text style={styles.docId}>Le {fmt(quote.createdAt)}</Text>
          </View>
        </View>

        {/* Info cards */}
        <View style={styles.sectionRow}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Émetteur</Text>
            <Text style={[styles.cardText, { fontWeight: 700 }]}>{companyName}</Text>
            {settings?.companyAddress && <Text style={styles.cardText}>{settings.companyAddress}</Text>}
            {settings?.companyPhone && <Text style={styles.cardText}>{settings.companyPhone}</Text>}
            {settings?.companyEmail && <Text style={styles.cardText}>{settings.companyEmail}</Text>}
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Client</Text>
            <Text style={[styles.cardText, { fontWeight: 700 }]}>{quote.clientName}</Text>
            {quote.clientAddress && <Text style={styles.cardText}>{quote.clientAddress}</Text>}
            {quote.clientPhone && <Text style={styles.cardText}>{quote.clientPhone}</Text>}
            {quote.clientEmail && <Text style={styles.cardText}>{quote.clientEmail}</Text>}
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Période</Text>
            <Text style={styles.cardText}>Du {fmt(quote.startDate)}</Text>
            <Text style={styles.cardText}>Au {fmt(quote.endDate)}</Text>
            <Text style={[styles.cardText, styles.bold, { marginTop: 6 }]}>
              {quote.days} jour{quote.days > 1 ? "s" : ""}
            </Text>
            {quote.validUntil && (
              <Text style={[styles.cardText, { marginTop: 4, fontSize: 9, color: "#64748b" }]}>
                Valable jusqu&apos;au {fmt(quote.validUntil)}
              </Text>
            )}
          </View>
        </View>

        {/* Table */}
        <View style={styles.tableHeader}>
          <Text style={[styles.col1, { color: "#ffffff", fontWeight: 700 }]}>Véhicule</Text>
          <Text style={[styles.col2, { color: "#ffffff", fontWeight: 700 }]}>Durée</Text>
          <Text style={[styles.col3, { color: "#ffffff", fontWeight: 700 }]}>Montant HT</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.col1}>{quote.vehicleDesc}</Text>
          <Text style={[styles.col2, { color: "#374151" }]}>{quote.days}j</Text>
          <Text style={[styles.col3, { color: "#374151" }]}>{formatMoney(quote.subtotal)}</Text>
        </View>

        {/* Totals */}
        <View style={styles.totalSection}>
          <View style={{ width: 210 }}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Sous-total HT</Text>
              <Text style={styles.totalValue}>{formatMoney(quote.subtotal)}</Text>
            </View>
            {Number(quote.discountAmount) > 0 && (
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: "#16a34a" }]}>
                  Remise {quote.discountType === "PERCENT" ? `(${Number(quote.discountValue)}%)` : ""}
                </Text>
                <Text style={[styles.totalValue, { color: "#16a34a" }]}>- {formatMoney(quote.discountAmount)}</Text>
              </View>
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TVA ({Number(quote.taxRate)}%)</Text>
              <Text style={styles.totalValue}>{formatMoney(quote.taxAmount)}</Text>
            </View>
            <View style={styles.totalBox}>
              <View style={styles.totalBoxRow}>
                <Text style={{ fontWeight: 700, color: "#ffffff" }}>Total TTC</Text>
                <Text style={{ fontSize: 16, fontWeight: 700, color: "#ffffff" }}>{formatMoney(quote.total)}</Text>
              </View>
            </View>
            {quote.installmentAmount && quote.totalInstallments && (
              <View style={styles.installmentBox}>
                <Text style={{ fontSize: 9, fontWeight: 700, color: "#1e3a8a" }}>{quote.totalInstallments} mensualités</Text>
                <Text style={{ fontSize: 9, fontWeight: 700, color: "#1e3a8a" }}>{formatMoney(quote.installmentAmount)} / mois</Text>
              </View>
            )}
          </View>
        </View>

        {quote.notes && (
          <View style={styles.notesBox}>
            <Text style={styles.notesTitle}>Notes</Text>
            <Text style={styles.notesText}>{quote.notes}</Text>
          </View>
        )}

        <View style={styles.footer} fixed>
          <Text>{companyName}{settings?.siret ? ` — SIRET : ${settings.siret}` : ""}</Text>
          <Text>{quote.validUntil ? `Valable jusqu'au ${fmt(quote.validUntil)}` : `© ${new Date().getFullYear()} ${companyName}`}</Text>
        </View>
      </Page>
    </Document>
  )
}
