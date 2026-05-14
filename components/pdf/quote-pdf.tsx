import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer"
import type { Quote, OrganizationSettings } from "@prisma/client"

function makeStyles(s: OrganizationSettings | null) {
  const primary = s?.primaryColor ?? "#2563eb"
  const secondary = s?.secondaryColor ?? "#1e40af"
  const accent = s?.accentColor ?? "#eff6ff"
  const fontFamily = (s?.documentFont ?? "Helvetica") as "Helvetica" | "Times-Roman" | "Courier"
  const fontBold = fontFamily === "Times-Roman" ? "Times-Bold" : fontFamily === "Courier" ? "Courier-Bold" : "Helvetica-Bold"

  return StyleSheet.create({
    page: { fontFamily, fontSize: 10, color: "#1f2937", backgroundColor: "#ffffff", paddingBottom: 60 },
    header: { backgroundColor: primary, padding: 24, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    logo: { width: 48, height: 48, borderRadius: 6, backgroundColor: "rgba(255,255,255,0.2)" },
    companyName: { color: "#ffffff", fontSize: 14, fontFamily: fontBold },
    companyInfo: { color: "rgba(255,255,255,0.75)", fontSize: 8, marginTop: 2 },
    docType: { color: "#ffffff", fontSize: 20, fontFamily: fontBold, textAlign: "right" },
    docNumber: { color: "rgba(255,255,255,0.75)", fontSize: 9, textAlign: "right", marginTop: 2 },
    body: { padding: 24 },
    infoRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
    infoBox: { flex: 1, backgroundColor: accent, borderRadius: 6, padding: 14 },
    infoTitle: { fontSize: 8, color: primary, fontFamily: fontBold, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
    infoText: { fontSize: 9, color: "#374151", lineHeight: 1.5 },
    infoTextBold: { fontSize: 10, color: "#111827", fontFamily: fontBold, marginBottom: 3 },
    tableHeader: { flexDirection: "row", backgroundColor: primary, borderRadius: 4, padding: "8 12" },
    tableHeaderText: { color: "#ffffff", fontSize: 9, fontFamily: fontBold },
    tableRow: { flexDirection: "row", padding: "8 12", borderBottom: "1 solid #f3f4f6" },
    tableText: { color: "#374151", fontSize: 9 },
    col1: { flex: 3 },
    col2: { flex: 1, textAlign: "center" },
    col3: { flex: 1.5, textAlign: "right" },
    totalsBox: { marginTop: 16, marginLeft: "auto", width: 240 },
    totalRow: { flexDirection: "row", justifyContent: "space-between", padding: "5 0", borderBottom: "1 solid #e5e7eb" },
    totalLabel: { fontSize: 9, color: "#6b7280" },
    totalValue: { fontSize: 9, color: "#374151" },
    grandTotalRow: { flexDirection: "row", justifyContent: "space-between", backgroundColor: primary, borderRadius: 4, padding: "10 12", marginTop: 6 },
    grandTotalLabel: { fontSize: 11, color: "#ffffff", fontFamily: fontBold },
    grandTotalValue: { fontSize: 11, color: "#ffffff", fontFamily: fontBold },
    installmentBox: { marginTop: 8, backgroundColor: accent, borderRadius: 4, padding: "8 12", flexDirection: "row", justifyContent: "space-between" },
    installmentLabel: { fontSize: 9, color: primary, fontFamily: fontBold },
    installmentValue: { fontSize: 9, color: primary, fontFamily: fontBold },
    notesBox: { marginTop: 20, padding: 14, backgroundColor: "#f9fafb", borderRadius: 6, borderLeft: `3 solid ${primary}` },
    notesTitle: { fontSize: 8, color: primary, fontFamily: fontBold, marginBottom: 4 },
    notesText: { fontSize: 9, color: "#6b7280", lineHeight: 1.5 },
    footer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#f9fafb", borderTop: "1 solid #e5e7eb", padding: "10 24", flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    footerText: { fontSize: 8, color: "#9ca3af" },
    footerBold: { fontSize: 8, color: secondary, fontFamily: fontBold },
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

interface QuotePDFProps {
  quote: Quote
  settings: OrganizationSettings | null
}

export function QuotePDF({ quote, settings }: QuotePDFProps) {
  const styles = makeStyles(settings)
  const companyName = settings?.companyName ?? "FleetManager"

  return (
    <Document>
      <Page size="A4" style={styles.page}>
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
            <Text style={styles.docType}>DEVIS</Text>
            <Text style={styles.docNumber}>{quote.number}</Text>
            <Text style={styles.docNumber}>Le {fmt(quote.createdAt)}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.infoRow}>
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Émetteur</Text>
              <Text style={styles.infoTextBold}>{companyName}</Text>
              {settings?.companyAddress && <Text style={styles.infoText}>{settings.companyAddress}</Text>}
              {settings?.companyPhone && <Text style={styles.infoText}>{settings.companyPhone}</Text>}
              {settings?.companyEmail && <Text style={styles.infoText}>{settings.companyEmail}</Text>}
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Client</Text>
              <Text style={styles.infoTextBold}>{quote.clientName}</Text>
              {quote.clientAddress && <Text style={styles.infoText}>{quote.clientAddress}</Text>}
              {quote.clientPhone && <Text style={styles.infoText}>{quote.clientPhone}</Text>}
              {quote.clientEmail && <Text style={styles.infoText}>{quote.clientEmail}</Text>}
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Période</Text>
              <Text style={styles.infoText}>Du {fmt(quote.startDate)}</Text>
              <Text style={styles.infoText}>Au {fmt(quote.endDate)}</Text>
              <Text style={styles.infoTextBold}>{quote.days} jour{quote.days > 1 ? "s" : ""}</Text>
              {quote.validUntil && (
                <Text style={[styles.infoText, { marginTop: 6 }]}>Valable jusqu&apos;au {fmt(quote.validUntil)}</Text>
              )}
            </View>
          </View>

          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.col1]}>Véhicule</Text>
            <Text style={[styles.tableHeaderText, styles.col2]}>Durée</Text>
            <Text style={[styles.tableHeaderText, styles.col3]}>Montant HT</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={[styles.tableText, styles.col1]}>{quote.vehicleDesc}</Text>
            <Text style={[styles.tableText, styles.col2]}>{quote.days}j</Text>
            <Text style={[styles.tableText, styles.col3]}>{formatMoney(quote.subtotal)}</Text>
          </View>

          <View style={styles.totalsBox}>
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
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total TTC</Text>
              <Text style={styles.grandTotalValue}>{formatMoney(quote.total)}</Text>
            </View>
            {quote.installmentAmount && quote.totalInstallments && (
              <View style={styles.installmentBox}>
                <Text style={styles.installmentLabel}>{quote.totalInstallments} mensualités</Text>
                <Text style={styles.installmentValue}>{formatMoney(quote.installmentAmount)} / mois</Text>
              </View>
            )}
          </View>

          {quote.notes && (
            <View style={styles.notesBox}>
              <Text style={styles.notesTitle}>Notes</Text>
              <Text style={styles.notesText}>{quote.notes}</Text>
            </View>
          )}
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{companyName}</Text>
          {settings?.siret && <Text style={styles.footerText}>SIRET : {settings.siret}</Text>}
          <Text style={styles.footerBold}>{quote.number}</Text>
        </View>
      </Page>
    </Document>
  )
}
