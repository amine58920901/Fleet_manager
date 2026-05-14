import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer"
import type { Contract, Vehicle, Driver, OrganizationSettings } from "@prisma/client"

type ContractFull = Contract & { vehicle: Vehicle; driver: Driver }

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
    infoRow: { flexDirection: "row", gap: 12, marginBottom: 16 },
    infoBox: { flex: 1, backgroundColor: accent, borderRadius: 6, padding: 14 },
    infoTitle: { fontSize: 8, color: primary, fontFamily: fontBold, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
    infoText: { fontSize: 9, color: "#374151", lineHeight: 1.5 },
    infoTextBold: { fontSize: 10, color: "#111827", fontFamily: fontBold, marginBottom: 3 },
    section: { marginBottom: 16 },
    sectionTitle: { fontSize: 9, color: primary, fontFamily: fontBold, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, paddingBottom: 4, borderBottom: `2 solid ${primary}` },
    tableHeader: { flexDirection: "row", backgroundColor: primary, padding: "8 12", marginBottom: 0 },
    tableHeaderText: { color: "#ffffff", fontSize: 9, fontFamily: fontBold },
    tableRow: { flexDirection: "row", padding: "6 12", borderBottom: "1 solid #f3f4f6" },
    tableRowAlt: { flexDirection: "row", padding: "6 12", borderBottom: "1 solid #f3f4f6", backgroundColor: "#f9fafb" },
    tableText: { color: "#374151", fontSize: 9 },
    col1: { flex: 2 },
    col2: { flex: 2 },
    col3: { flex: 1, textAlign: "center" },
    fieldRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5, borderBottom: "1 solid #f3f4f6" },
    fieldLabel: { fontSize: 9, color: "#6b7280" },
    fieldValue: { fontSize: 9, color: "#111827", fontFamily: fontBold },
    notesBox: { marginTop: 8, padding: 12, backgroundColor: "#f9fafb", borderRadius: 6, borderLeft: `3 solid ${primary}` },
    notesTitle: { fontSize: 8, color: primary, fontFamily: fontBold, marginBottom: 3 },
    notesText: { fontSize: 9, color: "#6b7280", lineHeight: 1.5 },
    twoCol: { flexDirection: "row", gap: 12 },
    halfSection: { flex: 1 },
    signatureRow: { flexDirection: "row", gap: 20, marginTop: 24 },
    signatureBox: { flex: 1, borderTop: "1 solid #d1d5db", paddingTop: 8, marginTop: 52 },
    signatureLabel: { fontSize: 8, color: "#6b7280", fontFamily: fontBold },
    signatureSub: { fontSize: 7, color: "#9ca3af", marginTop: 2 },
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

export function ContractPDF({ contract, settings }: ContractPDFProps) {
  const styles = makeStyles(settings)
  const companyName = settings?.companyName ?? "FleetManager"
  const days = daysCount(contract.startDate, contract.endDate)

  const hasFinancials = contract.paymentAmount || contract.paymentDueDay || contract.paymentMethod || contract.depositReturnConditions
  const hasMileage = contract.mileageAllowance || contract.extraMileageCost
  const hasInsurance = contract.insuranceFranchise || contract.insuranceInfo || contract.maintenanceInfo
  const hasTermination = contract.returnLocation || contract.earlyTerminationConditions

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
            <Text style={styles.docType}>CONTRAT</Text>
            <Text style={styles.docNumber}>{contract.number}</Text>
            <Text style={styles.docNumber}>Signé le {fmt(contract.createdAt)}</Text>
          </View>
        </View>

        <View style={styles.body}>

          {/* Parties */}
          <View style={styles.infoRow}>
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>Loueur</Text>
              <Text style={styles.infoTextBold}>{companyName}</Text>
              {settings?.companyAddress && <Text style={styles.infoText}>{settings.companyAddress}</Text>}
              {settings?.companyPhone && <Text style={styles.infoText}>{settings.companyPhone}</Text>}
              {settings?.companyEmail && <Text style={styles.infoText}>{settings.companyEmail}</Text>}
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

          {/* Véhicule */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Véhicule loué</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.col1]}>Véhicule</Text>
              <Text style={[styles.tableHeaderText, styles.col2]}>Immatriculation</Text>
              <Text style={[styles.tableHeaderText, styles.col3]}>Année</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.tableText, styles.col1]}>{contract.vehicle.brand} {contract.vehicle.model}</Text>
              <Text style={[styles.tableText, styles.col2]}>{contract.vehicle.licensePlate}</Text>
              <Text style={[styles.tableText, styles.col3]}>{contract.vehicle.year}</Text>
            </View>
          </View>

          {/* Détails contrat + Forfait km */}
          <View style={styles.twoCol}>
            <View style={styles.halfSection}>
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Période & kilométrage</Text>
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
                <View style={styles.fieldRow}>
                  <Text style={styles.fieldLabel}>Km au retour</Text>
                  <Text style={styles.fieldValue}>{contract.mileageEnd != null ? `${fmtNum(contract.mileageEnd)} km` : "À compléter"}</Text>
                </View>
                {contract.fuelLevelStart && (
                  <View style={styles.fieldRow}>
                    <Text style={styles.fieldLabel}>Carburant départ</Text>
                    <Text style={styles.fieldValue}>{contract.fuelLevelStart}</Text>
                  </View>
                )}
                {hasMileage && (
                  <>
                    {contract.mileageAllowance != null && (
                      <View style={styles.fieldRow}>
                        <Text style={styles.fieldLabel}>Forfait km inclus</Text>
                        <Text style={styles.fieldValue}>{fmtNum(contract.mileageAllowance)} km</Text>
                      </View>
                    )}
                    {contract.extraMileageCost != null && (
                      <View style={styles.fieldRow}>
                        <Text style={styles.fieldLabel}>Km supplémentaire</Text>
                        <Text style={styles.fieldValue}>{Number(contract.extraMileageCost).toFixed(2)} {"€"}/km</Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            </View>

            <View style={styles.halfSection}>
              {hasFinancials && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Modalités financières</Text>
                  {contract.paymentAmount != null && (
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>Mensualité</Text>
                      <Text style={styles.fieldValue}>{formatMoney(contract.paymentAmount)} {contract.paymentTaxType ?? "TTC"}</Text>
                    </View>
                  )}
                  {contract.paymentDueDay != null && (
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>Échéance</Text>
                      <Text style={styles.fieldValue}>Le {contract.paymentDueDay} de chaque mois</Text>
                    </View>
                  )}
                  {contract.paymentMethod && (
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>Mode de règlement</Text>
                      <Text style={styles.fieldValue}>{contract.paymentMethod}</Text>
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
                  {contract.returnLocation && (
                    <View style={styles.fieldRow}>
                      <Text style={styles.fieldLabel}>Lieu de restitution</Text>
                      <Text style={styles.fieldValue}>{contract.returnLocation}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>

          {/* Dépôt de garantie — conditions */}
          {contract.depositReturnConditions && (
            <View style={styles.notesBox}>
              <Text style={styles.notesTitle}>Restitution de la caution</Text>
              <Text style={styles.notesText}>{contract.depositReturnConditions}</Text>
            </View>
          )}

          {/* Assurance */}
          {hasInsurance && (
            <View style={[styles.section, { marginTop: 10 }]}>
              <Text style={styles.sectionTitle}>Assurance & entretien</Text>
              {contract.insuranceInfo && (
                <View style={styles.notesBox}>
                  <Text style={styles.notesTitle}>Assurance</Text>
                  <Text style={styles.notesText}>{contract.insuranceInfo}</Text>
                </View>
              )}
              {contract.maintenanceInfo && (
                <View style={[styles.notesBox, { marginTop: 6 }]}>
                  <Text style={styles.notesTitle}>Entretien & réparations</Text>
                  <Text style={styles.notesText}>{contract.maintenanceInfo}</Text>
                </View>
              )}
            </View>
          )}

          {/* Résiliation */}
          {hasTermination && contract.earlyTerminationConditions && (
            <View style={[styles.section, { marginTop: 4 }]}>
              <Text style={styles.sectionTitle}>Résiliation anticipée</Text>
              <View style={styles.notesBox}>
                <Text style={styles.notesText}>{contract.earlyTerminationConditions}</Text>
              </View>
            </View>
          )}

          {/* Conditions générales */}
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
              <Text style={styles.signatureLabel}>Date & lieu</Text>
              <Text style={styles.signatureSub}>À compléter lors de la signature</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>{companyName}</Text>
          {settings?.siret && <Text style={styles.footerText}>SIRET : {settings.siret}</Text>}
          <Text style={styles.footerBold}>{contract.number}</Text>
        </View>
      </Page>
    </Document>
  )
}
