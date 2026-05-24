import {
  Document, Page, Text, View, StyleSheet, Font, Image,
} from "@react-pdf/renderer"
import type { Contract, Vehicle, Driver, OrganizationSettings } from "@prisma/client"
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
  page: { padding: 40, fontFamily: "Plus Jakarta Sans", fontSize: 10, color: "#1e293b", paddingBottom: 70 },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30, backgroundColor: "#1e3a8a", padding: 20, borderRadius: 8 },
  companyName: { fontSize: 20, fontWeight: 700, color: "#ffffff" },
  companyInfo: { fontSize: 8, marginTop: 4, color: "rgba(255,255,255,0.8)" },
  docTitle: { fontSize: 24, fontWeight: 700, color: "#ffffff", textAlign: "right" },
  docId: { fontSize: 10, marginTop: 4, color: "rgba(255,255,255,0.85)", textAlign: "right" },
  sectionRow: { flexDirection: "row", gap: 16, marginBottom: 20 },
  card: { flex: 1, padding: 15, borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 8, backgroundColor: "#f8fafc" },
  cardFull: { padding: 15, borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 8, backgroundColor: "#f8fafc", marginBottom: 20 },
  cardTitle: { fontSize: 8, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 8, borderBottomWidth: 1, borderBottomColor: "#e2e8f0", paddingBottom: 4 },
  cardText: { fontSize: 10, marginBottom: 2, color: "#1e293b" },
  bold: { fontWeight: 700 },
  tableHeader: { flexDirection: "row", backgroundColor: "#1e3a8a", color: "#ffffff", padding: 8, borderRadius: 4, fontWeight: 700, marginTop: 10 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f1f5f9", padding: 8 },
  twoCol: { flexDirection: "row", gap: 16, marginBottom: 20 },
  halfCard: { flex: 1, padding: 15, borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 8, backgroundColor: "#f8fafc" },
  fieldRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  fieldLabel: { fontSize: 9, color: "#64748b" },
  fieldValue: { fontSize: 9, fontWeight: 700, color: "#1e293b" },
  notesBox: { marginTop: 12, padding: 12, backgroundColor: "#f8fafc", borderRadius: 6, borderLeftWidth: 3, borderLeftColor: "#1e3a8a" },
  notesTitle: { fontSize: 8, fontWeight: 700, color: "#1e3a8a", marginBottom: 4 },
  notesText: { fontSize: 9, color: "#64748b", lineHeight: 1.5 },
  signatureRow: { flexDirection: "row", gap: 16, marginTop: 24 },
  signatureBox: { flex: 1, borderTopWidth: 1, borderTopColor: "#d1d5db", paddingTop: 8, marginTop: 52 },
  signatureLabel: { fontSize: 8, fontWeight: 700, color: "#374151" },
  signatureSub: { fontSize: 7, color: "#9ca3af", marginTop: 2 },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, borderTopWidth: 1, borderTopColor: "#e2e8f0", paddingTop: 10, flexDirection: "row", justifyContent: "space-between", fontSize: 8, color: "#94a3b8" },
})

type ContractFull = Contract & { vehicle: Vehicle; driver: Driver }

function formatMoney(n: unknown) {
  const num = Number(n)
  const [int, dec] = num.toFixed(2).split(".")
  return `${int.replace(/\B(?=(\d{3})+(?!\d))/g, " ")},${dec} €`
}

function fmt(d: Date | string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
}

function fmtNum(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
}

function daysCount(start: Date | string, end: Date | string) {
  return Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000)
}

interface ContractPDFProps {
  contract: ContractFull
  settings: OrganizationSettings | null
}

const BUILTIN_FONTS = new Set(["Helvetica", "Times-Roman", "Courier"])

function resolveFont(documentFont: string | null | undefined): string {
  const f = documentFont ?? "Plus Jakarta Sans"
  return BUILTIN_FONTS.has(f) ? f : f
}

export function ContractPDF({ contract, settings }: ContractPDFProps) {
  const companyName = settings?.companyName ?? "FleetManager"
  const fontFamily = resolveFont(settings?.documentFont)
  const days = daysCount(contract.startDate, contract.endDate)
  const hasFinancials = contract.paymentAmount || contract.paymentDueDay || contract.paymentMethod || contract.depositAmount || contract.insuranceFranchise
  const hasMileage = contract.mileageAllowance || contract.extraMileageCost

  return (
    <Document>
      <Page size="A4" style={[styles.page, { fontFamily }]}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            {settings?.logoBase64 && (
              <Image src={settings.logoBase64} style={{ width: 40, height: 40, marginBottom: 6 }} />
            )}
            <Text style={styles.companyName}>{companyName}</Text>
            {settings?.companyAddress && <Text style={styles.companyInfo}>{settings.companyAddress}</Text>}
            {settings?.companyPhone && <Text style={styles.companyInfo}>{settings.companyPhone}</Text>}
          </View>
          <View>
            <Text style={styles.docTitle}>Contrat</Text>
            <Text style={styles.docId}>{contract.number}</Text>
            <Text style={styles.docId}>Signé le {fmt(contract.createdAt)}</Text>
          </View>
        </View>

        {/* Parties */}
        <View style={styles.sectionRow}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Loueur</Text>
            <Text style={[styles.cardText, styles.bold]}>{companyName}</Text>
            {settings?.companyAddress && <Text style={styles.cardText}>{settings.companyAddress}</Text>}
            {settings?.companyPhone && <Text style={styles.cardText}>{settings.companyPhone}</Text>}
            {settings?.companyEmail && <Text style={styles.cardText}>{settings.companyEmail}</Text>}
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Locataire</Text>
            <Text style={[styles.cardText, styles.bold]}>{contract.driver.firstName} {contract.driver.lastName}</Text>
            {contract.driver.licenseNumber && <Text style={styles.cardText}>Permis : {contract.driver.licenseNumber}</Text>}
            {contract.driver.phone && <Text style={styles.cardText}>{contract.driver.phone}</Text>}
            {contract.driver.email && <Text style={styles.cardText}>{contract.driver.email}</Text>}
            {contract.driver.address && <Text style={styles.cardText}>{contract.driver.address}</Text>}
          </View>
        </View>

        {/* Vehicle */}
        <View style={styles.cardFull}>
          <Text style={styles.cardTitle}>Véhicule Loué</Text>
          <View style={styles.tableHeader}>
            <Text style={{ flex: 1, color: "#ffffff", fontWeight: 700 }}>Véhicule</Text>
            <Text style={{ flex: 1, textAlign: "center", color: "#ffffff", fontWeight: 700 }}>Immatriculation</Text>
            <Text style={{ flex: 1, textAlign: "right", color: "#ffffff", fontWeight: 700 }}>Année</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={{ flex: 1, fontWeight: 700 }}>{contract.vehicle.brand} {contract.vehicle.model}</Text>
            <Text style={{ flex: 1, textAlign: "center" }}>{contract.vehicle.licensePlate}</Text>
            <Text style={{ flex: 1, textAlign: "right" }}>{contract.vehicle.year}</Text>
          </View>
        </View>

        {/* Period & Financials */}
        <View style={styles.twoCol}>
          <View style={styles.halfCard}>
            <Text style={styles.cardTitle}>Période &amp; Kilométrage</Text>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Prise en charge</Text>
              <Text style={styles.fieldValue}>{fmt(contract.startDate)}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Restitution prévue</Text>
              <Text style={styles.fieldValue}>{fmt(contract.endDate)}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Durée</Text>
              <Text style={styles.fieldValue}>{days} jour{days > 1 ? "s" : ""}</Text>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Km au départ</Text>
              <Text style={styles.fieldValue}>{contract.mileageStart != null ? fmtNum(contract.mileageStart) : "—"} km</Text>
            </View>
            {contract.fuelLevelStart && (
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Carburant départ</Text>
                <Text style={styles.fieldValue}>{contract.fuelLevelStart}</Text>
              </View>
            )}
            {hasMileage && contract.mileageAllowance != null && (
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Forfait km inclus</Text>
                <Text style={styles.fieldValue}>{fmtNum(contract.mileageAllowance)} km</Text>
              </View>
            )}
            {contract.extraMileageCost != null && (
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>Km supplémentaire</Text>
                <Text style={styles.fieldValue}>{Number(contract.extraMileageCost).toFixed(2)} €/km</Text>
              </View>
            )}
          </View>

          {hasFinancials && (
            <View style={styles.halfCard}>
              <Text style={styles.cardTitle}>Modalités Financières</Text>
              {contract.paymentAmount != null && (
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Mensualité</Text>
                  <Text style={styles.fieldValue}>{formatMoney(contract.paymentAmount)} {contract.paymentTaxType ?? "TTC"}</Text>
                </View>
              )}
              {contract.depositAmount != null && (
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Caution versée</Text>
                  <Text style={styles.fieldValue}>{formatMoney(contract.depositAmount)}</Text>
                </View>
              )}
              {contract.insuranceFranchise != null && (
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Franchise sinistre</Text>
                  <Text style={styles.fieldValue}>{formatMoney(contract.insuranceFranchise)}</Text>
                </View>
              )}
              {contract.paymentMethod && (
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Mode de règlement</Text>
                  <Text style={styles.fieldValue}>{contract.paymentMethod}</Text>
                </View>
              )}
              {contract.paymentDueDay != null && (
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Échéance</Text>
                  <Text style={styles.fieldValue}>Le {contract.paymentDueDay} du mois</Text>
                </View>
              )}
              {contract.returnLocation && (
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Lieu de restitution</Text>
                  <Text style={styles.fieldValue}>{contract.returnLocation}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Notes */}
        {contract.depositReturnConditions && (
          <View style={styles.notesBox}>
            <Text style={styles.notesTitle}>Restitution de la caution</Text>
            <Text style={styles.notesText}>{contract.depositReturnConditions}</Text>
          </View>
        )}
        {contract.insuranceInfo && (
          <View style={[styles.notesBox, { marginTop: 8 }]}>
            <Text style={styles.notesTitle}>Assurance</Text>
            <Text style={styles.notesText}>{contract.insuranceInfo}</Text>
          </View>
        )}
        {contract.earlyTerminationConditions && (
          <View style={[styles.notesBox, { marginTop: 8 }]}>
            <Text style={styles.notesTitle}>Résiliation anticipée</Text>
            <Text style={styles.notesText}>{contract.earlyTerminationConditions}</Text>
          </View>
        )}
        {contract.terms && (
          <View style={[styles.notesBox, { marginTop: 8 }]}>
            <Text style={styles.notesTitle}>Clauses additionnelles</Text>
            <Text style={styles.notesText}>{contract.terms}</Text>
          </View>
        )}

        {/* Signatures */}
        <View style={styles.signatureRow}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Signature du loueur</Text>
            <Text style={styles.signatureSub}>{companyName}</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Signature du locataire</Text>
            <Text style={styles.signatureSub}>{contract.driver.firstName} {contract.driver.lastName}</Text>
          </View>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>Date &amp; lieu</Text>
            <Text style={styles.signatureSub}>À compléter lors de la signature</Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>{companyName}{settings?.siret ? ` — SIRET : ${settings.siret}` : ""}</Text>
          <Text>© {new Date().getFullYear()} {companyName}</Text>
        </View>
      </Page>
    </Document>
  )
}
