import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer"
import type { Contract, Vehicle, Driver, OrganizationSettings } from "@prisma/client"

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

function fmt(d: Date | string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
}

function fmtNum(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
}

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
    docType: { color: "#ffffff", fontSize: 16, fontFamily: fontBold, textAlign: "right" },
    docSub: { color: "rgba(255,255,255,0.75)", fontSize: 9, textAlign: "right", marginTop: 2 },
    body: { padding: 24 },
    infoRow: { flexDirection: "row", gap: 12, marginBottom: 14 },
    infoBox: { flex: 1, backgroundColor: accent, borderRadius: 6, padding: 14 },
    infoTitle: { fontSize: 8, color: primary, fontFamily: fontBold, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
    infoText: { fontSize: 9, color: "#374151", lineHeight: 1.5 },
    infoTextBold: { fontSize: 10, color: "#111827", fontFamily: fontBold, marginBottom: 3 },
    detailsRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
    detailBox: { flex: 1, borderRadius: 4, padding: "7 10", backgroundColor: "#f9fafb", border: "1 solid #e5e7eb" },
    detailLabel: { fontSize: 7, color: "#9ca3af", fontFamily: fontBold, textTransform: "uppercase", marginBottom: 2 },
    detailValue: { fontSize: 9, color: "#111827", fontFamily: fontBold },
    section: { marginBottom: 14 },
    sectionTitle: { fontSize: 9, color: primary, fontFamily: fontBold, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6, paddingBottom: 4, borderBottom: `2 solid ${primary}` },
    tableHeader: { flexDirection: "row", backgroundColor: primary, padding: "6 10" },
    tableHeaderText: { color: "#ffffff", fontSize: 8, fontFamily: fontBold },
    tableRow: { flexDirection: "row", padding: "5 10", borderBottom: "1 solid #f3f4f6" },
    tableRowAlt: { flexDirection: "row", padding: "5 10", borderBottom: "1 solid #f3f4f6", backgroundColor: "#f9fafb" },
    tableRowDmg: { flexDirection: "row", padding: "5 10", borderBottom: "1 solid #f3f4f6", backgroundColor: "#fff7ed" },
    tableRowDmgGrave: { flexDirection: "row", padding: "5 10", borderBottom: "1 solid #f3f4f6", backgroundColor: "#fff1f2" },
    colZone: { flex: 3 },
    colStatus: { flex: 2 },
    colDetail: { flex: 5 },
    cellText: { fontSize: 9, color: "#374151" },
    okText: { fontSize: 9, color: "#16a34a", fontFamily: fontBold },
    dmgText: { fontSize: 9, color: "#ea580c", fontFamily: fontBold },
    dmgGraveText: { fontSize: 9, color: "#dc2626", fontFamily: fontBold },
    signatureArea: { marginTop: 20 },
    signatureRow: { flexDirection: "row", gap: 16, marginTop: 4 },
    signatureBox: { flex: 1 },
    signatureLine: { borderTop: "1 solid #d1d5db", paddingTop: 6, marginTop: 52 },
    signatureLabel: { fontSize: 8, color: "#374151", fontFamily: fontBold },
    signatureSub: { fontSize: 7, color: "#9ca3af", marginTop: 2 },
    disclaimer: { fontSize: 8, color: "#6b7280", marginBottom: 14, lineHeight: 1.5 },
    footer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#f9fafb", borderTop: "1 solid #e5e7eb", padding: "10 24", flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    footerText: { fontSize: 8, color: "#9ca3af" },
    footerBold: { fontSize: 8, color: secondary, fontFamily: fontBold },
  })
}

interface ConditionPDFProps {
  contract: ContractFull
  settings: OrganizationSettings | null
}

export function ConditionPDF({ contract, settings }: ConditionPDFProps) {
  const styles = makeStyles(settings)
  const companyName = settings?.companyName ?? "FleetManager"
  const condition = (contract.conditionStart ?? {}) as VehicleCondition
  const damagedCount = Object.keys(condition).length

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
            <Text style={styles.docType}>ÉTAT DES LIEUX</Text>
            <Text style={styles.docSub}>Départ · {contract.number}</Text>
            <Text style={styles.docSub}>Le {fmt(contract.startDate)}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.infoRow}>
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Véhicule</Text>
              <Text style={styles.infoTextBold}>{contract.vehicle.brand} {contract.vehicle.model}</Text>
              <Text style={styles.infoText}>Immatriculation : {contract.vehicle.licensePlate}</Text>
              {contract.vehicle.color && <Text style={styles.infoText}>Couleur : {contract.vehicle.color}</Text>}
              <Text style={styles.infoText}>Année : {contract.vehicle.year}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Locataire</Text>
              <Text style={styles.infoTextBold}>{contract.driver.firstName} {contract.driver.lastName}</Text>
              {contract.driver.licenseNumber && <Text style={styles.infoText}>Permis : {contract.driver.licenseNumber}</Text>}
              {contract.driver.phone && <Text style={styles.infoText}>{contract.driver.phone}</Text>}
              {contract.driver.email && <Text style={styles.infoText}>{contract.driver.email}</Text>}
              {contract.driver.address && <Text style={styles.infoText}>{contract.driver.address}</Text>}
            </View>
          </View>

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

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {`État du véhicule au départ — ${damagedCount === 0 ? "Aucun dommage constaté" : `${damagedCount} zone${damagedCount > 1 ? "s" : ""} endommagée${damagedCount > 1 ? "s" : ""}`}`}
            </Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.colZone]}>Zone</Text>
              <Text style={[styles.tableHeaderText, styles.colStatus]}>État</Text>
              <Text style={[styles.tableHeaderText, styles.colDetail]}>Détails</Text>
            </View>
            {ZONES.map((zone, i) => {
              const dmg = condition[zone.id]
              const rowStyle = dmg
                ? (dmg.severity === "grave" ? styles.tableRowDmgGrave : styles.tableRowDmg)
                : i % 2 === 1 ? styles.tableRowAlt : styles.tableRow
              const statusStyle = dmg
                ? (dmg.severity === "grave" ? styles.dmgGraveText : styles.dmgText)
                : styles.okText
              const detail = dmg
                ? `${dmg.type.charAt(0).toUpperCase() + dmg.type.slice(1)} · ${dmg.severity}${dmg.note ? " — " + dmg.note : ""}`
                : "—"
              return (
                <View key={zone.id} style={rowStyle}>
                  <Text style={[styles.cellText, styles.colZone]}>{zone.label}</Text>
                  <Text style={[statusStyle, styles.colStatus]}>{dmg ? "ENDOMMAGÉ" : "RAS"}</Text>
                  <Text style={[styles.cellText, styles.colDetail, { color: dmg ? "#9a3412" : "#9ca3af" }]}>{detail}</Text>
                </View>
              )
            })}
          </View>

          <View style={styles.signatureArea}>
            <Text style={styles.sectionTitle}>Signatures</Text>
            <Text style={styles.disclaimer}>
              {`Je soussigné(e) déclare avoir pris connaissance de l'état du véhicule tel que décrit ci-dessus et l'accepte sans réserve.`}
            </Text>
            <View style={styles.signatureRow}>
              <View style={styles.signatureBox}>
                <View style={styles.signatureLine}>
                  <Text style={styles.signatureLabel}>Signature du loueur</Text>
                  <Text style={styles.signatureSub}>{companyName}</Text>
                </View>
              </View>
              <View style={styles.signatureBox}>
                <View style={styles.signatureLine}>
                  <Text style={styles.signatureLabel}>Signature du locataire</Text>
                  <Text style={styles.signatureSub}>{contract.driver.firstName} {contract.driver.lastName}</Text>
                </View>
              </View>
              <View style={styles.signatureBox}>
                <View style={styles.signatureLine}>
                  <Text style={styles.signatureLabel}>Date et lieu</Text>
                  <Text style={styles.signatureSub}>À compléter lors de la signature</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{companyName}</Text>
          <Text style={styles.footerText}>État des lieux de départ</Text>
          <Text style={styles.footerBold}>{contract.number}</Text>
        </View>
      </Page>
    </Document>
  )
}
