import {
  Document, Page, Text, View, StyleSheet, Font, Image,
} from "@react-pdf/renderer"
import type { Contract, Vehicle, Driver, OrganizationSettings } from "@prisma/client"

Font.register({
  family: "Plus Jakarta Sans",
  fonts: [
    { src: "https://fonts.gstatic.com/s/plusjakartasans/v3/LDIoaomQNQcsA88c7O9yZ4KMCoOg4Ko70yyygA.ttf", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/plusjakartasans/v3/LDIoaomQNQcsA88c7O9yZ4KMCoOg4IA70yyygA.ttf", fontWeight: 700 },
  ],
})

const ZONES = [
  { id: "parechoc_av",  label: "Pare-choc avant" },
  { id: "capot",        label: "Capot" },
  { id: "aile_avd",    label: "Aile av. droite" },
  { id: "aile_avg",    label: "Aile av. gauche" },
  { id: "porte_avd",   label: "Portière av. droite" },
  { id: "porte_avg",   label: "Portière av. gauche" },
  { id: "porte_ard",   label: "Portière ar. droite" },
  { id: "porte_arg",   label: "Portière ar. gauche" },
  { id: "aile_ard",    label: "Aile ar. droite" },
  { id: "aile_arg",    label: "Aile ar. gauche" },
  { id: "parechoc_ar", label: "Pare-choc arrière" },
  { id: "coffre",      label: "Coffre" },
  { id: "toit",        label: "Toit" },
  { id: "vitres",      label: "Vitres" },
  { id: "interieur",   label: "Intérieur" },
]

type DamageEntry = { type: string; severity: string; note: string }
type VehicleCondition = Record<string, DamageEntry>
type ContractFull = Contract & { vehicle: Vehicle; driver: Driver }

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
  detailsRow: { flexDirection: "row", gap: 10, marginBottom: 20 },
  detailBox: { flex: 1, padding: 10, borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 6, backgroundColor: "#f8fafc" },
  detailLabel: { fontSize: 7, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", marginBottom: 3 },
  detailValue: { fontSize: 9, fontWeight: 700, color: "#1e293b" },
  tableHeader: { flexDirection: "row", backgroundColor: "#1e3a8a", color: "#ffffff", padding: 8, borderRadius: 4, fontWeight: 700 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f1f5f9", padding: 8, alignItems: "center" },
  tableRowDmg: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#f1f5f9", padding: 8, alignItems: "center", backgroundColor: "#fef2f2" },
  statusBadge: { padding: 3, borderRadius: 4, fontSize: 8, fontWeight: 700 },
  signatureSection: { marginTop: 24 },
  signatureTitle: { fontSize: 8, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 12, borderBottomWidth: 1, borderBottomColor: "#e2e8f0", paddingBottom: 4 },
  signatureRow: { flexDirection: "row", gap: 16 },
  signatureBox: { flex: 1, borderTopWidth: 1, borderTopColor: "#d1d5db", paddingTop: 8, marginTop: 52 },
  signatureLabel: { fontSize: 8, fontWeight: 700, color: "#374151" },
  signatureSub: { fontSize: 7, color: "#9ca3af", marginTop: 2 },
  disclaimer: { fontSize: 8, color: "#64748b", marginBottom: 12, lineHeight: 1.5 },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, borderTopWidth: 1, borderTopColor: "#e2e8f0", paddingTop: 10, flexDirection: "row", justifyContent: "space-between", fontSize: 8, color: "#94a3b8" },
})

function fmt(d: Date | string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
}

function fmtNum(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
}

interface ConditionPDFProps {
  contract: ContractFull
  settings: OrganizationSettings | null
}

export function ConditionPDF({ contract, settings }: ConditionPDFProps) {
  const companyName = settings?.companyName ?? "FleetManager"
  const condition = (contract.conditionStart ?? {}) as VehicleCondition
  const damagedCount = Object.keys(condition).length

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
          </View>
          <View>
            <Text style={styles.docTitle}>État des Lieux</Text>
            <Text style={styles.docId}>{contract.number}</Text>
            <Text style={styles.docId}>Édité le {fmt(contract.startDate)}</Text>
          </View>
        </View>

        {/* Vehicle & Driver */}
        <View style={styles.sectionRow}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Véhicule</Text>
            <Text style={[styles.cardText, { fontWeight: 700 }]}>{contract.vehicle.brand} {contract.vehicle.model}</Text>
            <Text style={styles.cardText}>{contract.vehicle.licensePlate} · {contract.vehicle.color ?? ""} / {contract.vehicle.year}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Locataire</Text>
            <Text style={[styles.cardText, { fontWeight: 700 }]}>{contract.driver.firstName} {contract.driver.lastName}</Text>
            {contract.driver.licenseNumber && <Text style={styles.cardText}>{contract.driver.licenseNumber}</Text>}
            {contract.driver.phone && <Text style={styles.cardText}>{contract.driver.phone}</Text>}
          </View>
        </View>

        {/* Details row */}
        <View style={styles.detailsRow}>
          <View style={styles.detailBox}>
            <Text style={styles.detailLabel}>Date de départ</Text>
            <Text style={styles.detailValue}>{fmt(contract.startDate)}</Text>
          </View>
          <View style={styles.detailBox}>
            <Text style={styles.detailLabel}>Km au départ</Text>
            <Text style={styles.detailValue}>{contract.mileageStart != null ? fmtNum(contract.mileageStart) : "—"} km</Text>
          </View>
          <View style={styles.detailBox}>
            <Text style={styles.detailLabel}>Carburant</Text>
            <Text style={styles.detailValue}>{contract.fuelLevelStart ?? "—"}</Text>
          </View>
          {contract.depositAmount && (
            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>Caution</Text>
              <Text style={styles.detailValue}>{Number(contract.depositAmount).toFixed(2)} €</Text>
            </View>
          )}
        </View>

        {/* Zones table */}
        <View style={styles.tableHeader}>
          <Text style={{ flex: 2, color: "#ffffff", fontWeight: 700 }}>Zone</Text>
          <Text style={{ flex: 1, textAlign: "center", color: "#ffffff", fontWeight: 700 }}>État</Text>
          <Text style={{ flex: 2, textAlign: "right", color: "#ffffff", fontWeight: 700 }}>Détails</Text>
        </View>

        {ZONES.map((zone) => {
          const dmg = condition[zone.id]
          const isDmg = Boolean(dmg)
          const isGrave = dmg?.severity === "grave"
          const rowStyle = isDmg
            ? [styles.tableRowDmg, isGrave ? { backgroundColor: "#fef2f2" } : {}]
            : styles.tableRow
          const statusBg = isDmg ? (isGrave ? "#fef2f2" : "#fef2f2") : "#f0fdf4"
          const statusColor = isDmg ? (isGrave ? "#991b1b" : "#991b1b") : "#166534"
          const statusLabel = isDmg ? "ENDOMMAGÉ" : "RAS"
          const detail = dmg
            ? `${dmg.type.charAt(0).toUpperCase() + dmg.type.slice(1)} — ${dmg.severity}${dmg.note ? " · " + dmg.note : ""}`
            : "—"

          return (
            <View key={zone.id} style={rowStyle}>
              <Text style={{ flex: 2 }}>{zone.label}</Text>
              <View style={{ flex: 1, alignItems: "center" }}>
                <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                  <Text style={{ color: statusColor }}>{statusLabel}</Text>
                </View>
              </View>
              <Text style={{ flex: 2, textAlign: "right", color: isDmg ? "#991b1b" : "#94a3b8" }}>{detail}</Text>
            </View>
          )
        })}

        {/* Signatures */}
        <View style={styles.signatureSection}>
          <Text style={styles.signatureTitle}>
            {`État au départ — ${damagedCount === 0 ? "Aucun dommage constaté" : `${damagedCount} zone${damagedCount > 1 ? "s" : ""} endommagée${damagedCount > 1 ? "s" : ""}`}`}
          </Text>
          <Text style={styles.disclaimer}>
            Je soussigné(e) déclare avoir pris connaissance de l&apos;état du véhicule tel que décrit ci-dessus et l&apos;accepte sans réserve.
          </Text>
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
        </View>

        <View style={styles.footer} fixed>
          <Text>{companyName}{settings?.siret ? ` — SIRET : ${settings.siret}` : ""}</Text>
          <Text>© {new Date().getFullYear()} {companyName}</Text>
        </View>
      </Page>
    </Document>
  )
}
