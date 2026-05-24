import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"
import {
  Car, Users, FileText, Receipt,
  TrendingUp, TrendingDown, CheckCircle2,
  Plus, MapPin,
} from "lucide-react"

const MONTH_LABELS = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"]
const C = 100.53 // SVG circle circumference for r=16

function timeAgo(date: Date): string {
  const diffMs = Date.now() - date.getTime()
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffHours < 1) return "Il y a quelques minutes"
  if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? "s" : ""}`
  if (diffDays === 1) return "Hier"
  return `Il y a ${diffDays} jours`
}

async function getDashboardData(organizationId: string) {
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  sixMonthsAgo.setDate(1)
  sixMonthsAgo.setHours(0, 0, 0, 0)

  const [
    totalVehicles,
    availableVehicles,
    rentedVehicles,
    maintenanceVehicles,
    outOfServiceVehicles,
    totalDrivers,
    activeContracts,
    unpaidInvoices,
    paidInvoices,
    recentContracts,
  ] = await Promise.all([
    db.vehicle.count({ where: { organizationId } }),
    db.vehicle.count({ where: { organizationId, status: "AVAILABLE" } }),
    db.vehicle.count({ where: { organizationId, status: "RENTED" } }),
    db.vehicle.count({ where: { organizationId, status: "MAINTENANCE" } }),
    db.vehicle.count({ where: { organizationId, status: "OUT_OF_SERVICE" } }),
    db.driver.count({ where: { organizationId } }),
    db.contract.count({ where: { organizationId, status: "ACTIVE" } }),
    db.invoice.count({ where: { organizationId, status: "UNPAID" } }),
    db.invoice.findMany({
      where: { organizationId, status: "PAID" },
      select: { total: true, issueDate: true },
    }),
    db.contract.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { vehicle: true, driver: true },
    }),
  ])

  // Aggregate revenue by month (UTC to avoid timezone drift)
  const now = new Date()
  const currentYear = now.getUTCFullYear()
  const currentMonth = now.getUTCMonth()
  const revenueMap: Record<string, number> = {}
  for (let i = 5; i >= 0; i--) {
    const y = currentMonth - i < 0
      ? currentYear - 1
      : currentYear
    const m = ((currentMonth - i) % 12 + 12) % 12
    revenueMap[`${y}-${m}`] = 0
  }
  for (const inv of paidInvoices) {
    const key = `${inv.issueDate.getUTCFullYear()}-${inv.issueDate.getUTCMonth()}`
    if (key in revenueMap) revenueMap[key] += Number(inv.total)
  }

  const monthlyRevenue = Object.entries(revenueMap)
    .sort(([a], [b]) => {
      const [ay, am] = a.split("-").map(Number)
      const [by, bm] = b.split("-").map(Number)
      return ay !== by ? ay - by : am - bm
    })
    .map(([key, value]) => {
      const [, m] = key.split("-").map(Number)
      return { label: MONTH_LABELS[m], value, isCurrent: Number(key.split("-")[0]) === currentYear && m === currentMonth }
    })

  return {
    totalVehicles, availableVehicles, rentedVehicles,
    maintenanceVehicles, outOfServiceVehicles,
    totalDrivers, activeContracts, unpaidInvoices,
    monthlyRevenue, recentContracts,
  }
}

export default async function DashboardPage() {
  const session = await auth()
  const data = await getDashboardData(session!.user.organizationId)

  const {
    totalVehicles, availableVehicles, rentedVehicles,
    maintenanceVehicles, outOfServiceVehicles,
    totalDrivers, activeContracts, unpaidInvoices,
    monthlyRevenue, recentContracts,
  } = data

  // Donut segments
  const donutSegments = (() => {
    const segs = [
      { count: availableVehicles, color: "#006c49" },
      { count: rentedVehicles, color: "#00236f" },
      { count: maintenanceVehicles, color: "#ffb95f" },
      { count: outOfServiceVehicles, color: "#ba1a1a" },
    ]
    let cumulative = 0
    return segs.map((seg) => {
      const len = totalVehicles > 0 ? (seg.count / totalVehicles) * C : 0
      const offset = -cumulative
      cumulative += len
      return { ...seg, len, offset }
    })
  })()

  const operationalPct = totalVehicles > 0
    ? Math.round(((availableVehicles + rentedVehicles) / totalVehicles) * 100)
    : 0

  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.value), 1)

  const activityConfig = {
    ACTIVE: { label: "Actif", className: "bg-[#6cf8bb] text-[#005236]", verb: "loué" },
    COMPLETED: { label: "Clôturé", className: "bg-[#e5eeff] text-[#444651]", verb: "restitué" },
    CANCELLED: { label: "Annulé", className: "bg-[#ffdad6] text-[#93000a]", verb: "annulé" },
  }

  return (
    <div className="space-y-8 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-[#00236f]">Tableau de bord</h1>
          <p className="text-base text-[#444651] mt-1">Vue d&apos;ensemble de votre flotte en temps réel.</p>
        </div>
        <Link
          href="/contracts/new"
          className="flex items-center gap-2 bg-[#00236f] text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-[#00236f]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all shrink-0"
        >
          <Plus className="h-4 w-4" />
          Nouvelle réservation
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-[0px_4px_20px_rgba(15,23,42,0.05)] border border-[#c5c5d3]/10 relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-semibold text-[#444651] uppercase tracking-wider mb-1">Véhicules</p>
              <h3 className="text-5xl font-bold text-[#0b1c30]">{totalVehicles}</h3>
            </div>
            <div className="w-12 h-12 bg-[#dce1ff] rounded-xl flex items-center justify-center text-[#00236f]">
              <Car className="h-6 w-6" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#006c49] flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              {availableVehicles} disponibles
            </span>
            <span className="text-xs text-[#444651]/60">· {rentedVehicles} en location</span>
          </div>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-[#00236f] group-hover:h-2 transition-all" />
        </div>

        <div className="bg-white rounded-xl p-6 shadow-[0px_4px_20px_rgba(15,23,42,0.05)] border border-[#c5c5d3]/10 relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-semibold text-[#444651] uppercase tracking-wider mb-1">Chauffeurs</p>
              <h3 className="text-5xl font-bold text-[#0b1c30]">{totalDrivers}</h3>
            </div>
            <div className="w-12 h-12 bg-[#6cf8bb]/30 rounded-xl flex items-center justify-center text-[#006c49]">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <span className="text-xs font-semibold text-[#444651]">Chauffeurs enregistrés</span>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-[#006c49] group-hover:h-2 transition-all" />
        </div>

        <div className="bg-white rounded-xl p-6 shadow-[0px_4px_20px_rgba(15,23,42,0.05)] border border-[#c5c5d3]/10 relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-semibold text-[#444651] uppercase tracking-wider mb-1">Contrats actifs</p>
              <h3 className="text-5xl font-bold text-[#0b1c30]">{activeContracts}</h3>
            </div>
            <div className="w-12 h-12 bg-[#dce9ff] rounded-xl flex items-center justify-center text-[#1e3a8a]">
              <FileText className="h-6 w-6" />
            </div>
          </div>
          <span className="text-xs font-semibold text-[#444651]">Locations en cours</span>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-[#1e3a8a] group-hover:h-2 transition-all" />
        </div>

        <div className="bg-white rounded-xl p-6 shadow-[0px_4px_20px_rgba(15,23,42,0.05)] border border-[#c5c5d3]/10 relative overflow-hidden group hover:scale-[1.02] transition-transform">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-semibold text-[#444651] uppercase tracking-wider mb-1">Factures impayées</p>
              <h3 className="text-5xl font-bold text-[#0b1c30]">{unpaidInvoices}</h3>
            </div>
            <div className="w-12 h-12 bg-[#ffdad6] rounded-xl flex items-center justify-center text-[#ba1a1a]">
              <Receipt className="h-6 w-6" />
            </div>
          </div>
          {unpaidInvoices === 0 ? (
            <span className="text-xs font-semibold text-[#006c49] flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Tout est à jour
            </span>
          ) : (
            <span className="text-xs font-semibold text-[#ba1a1a] flex items-center gap-1">
              <TrendingDown className="h-3.5 w-3.5" />
              {unpaidInvoices} en attente de paiement
            </span>
          )}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-[#ba1a1a] group-hover:h-2 transition-all" />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left — Revenue chart + Activities */}
        <div className="lg:col-span-8 space-y-6">
          {/* Revenue Bar Chart */}
          <div className="bg-white rounded-xl shadow-[0px_4px_20px_rgba(15,23,42,0.05)] border border-[#c5c5d3]/10 p-6">
            <div className="flex items-center justify-between border-b border-[#c5c5d3]/20 pb-4 mb-6">
              <h4 className="text-xl font-semibold text-[#0b1c30]">Aperçu des revenus</h4>
              <span className="px-3 py-1 bg-[#e5eeff] rounded-full text-xs font-bold text-[#00236f]">
                6 derniers mois
              </span>
            </div>
            <div className="flex items-end justify-between gap-3 px-2" style={{ height: 224 }}>
              {monthlyRevenue.map((month) => {
                const BAR_MAX_PX = 180
                const barPx = month.value > 0
                  ? Math.max(Math.round((month.value / maxRevenue) * BAR_MAX_PX), 16)
                  : 4
                return (
                  <div key={month.label} className="flex-1 flex flex-col items-center justify-end gap-2 group/bar" style={{ height: 224 }}>
                    {month.value > 0 && (
                      <span className="text-[10px] font-semibold text-[#444651] opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap">
                        {formatCurrency(month.value)}
                      </span>
                    )}
                    <div
                      className={`w-full rounded-t-lg transition-all duration-300 ${
                        month.isCurrent
                          ? "bg-[#00236f]"
                          : "bg-[#b6c4ff] group-hover/bar:bg-[#1e3a8a]"
                      }`}
                      style={{ height: barPx }}
                    />
                    <p className={`text-xs font-semibold ${month.isCurrent ? "text-[#00236f] font-bold" : "text-[#444651]/60"}`}>
                      {month.label}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-xl shadow-[0px_4px_20px_rgba(15,23,42,0.05)] border border-[#c5c5d3]/10 p-6">
            <div className="flex items-center justify-between border-b border-[#c5c5d3]/20 pb-4 mb-6">
              <h4 className="text-xl font-semibold text-[#0b1c30]">Activités récentes</h4>
              <Link href="/contracts" className="text-sm font-semibold text-[#00236f] hover:underline">
                Voir tout
              </Link>
            </div>
            {recentContracts.length === 0 ? (
              <p className="text-sm text-[#757682] italic text-center py-8">Aucune activité récente</p>
            ) : (
              <div className="space-y-1">
                {recentContracts.map((contract) => {
                  const cfg = activityConfig[contract.status as keyof typeof activityConfig]
                  const iconBg =
                    contract.status === "ACTIVE"
                      ? "bg-[#006c49]/10 text-[#006c49]"
                      : contract.status === "COMPLETED"
                      ? "bg-[#e5eeff] text-[#00236f]"
                      : "bg-[#ffdad6] text-[#ba1a1a]"
                  return (
                    <Link
                      key={contract.id}
                      href={`/contracts/${contract.id}`}
                      className="flex items-start gap-4 p-4 hover:bg-[#f8f9ff] transition-all rounded-xl border border-transparent hover:border-[#c5c5d3]/20"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
                        <Car className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#0b1c30]">
                          Véhicule{" "}
                          <span className="font-bold">{contract.vehicle.brand} {contract.vehicle.model}</span>{" "}
                          {cfg?.verb ?? "modifié"} par{" "}
                          <span className="font-bold">{contract.driver.firstName} {contract.driver.lastName}</span>
                        </p>
                        <p className="text-xs text-[#444651]/60 mt-0.5">
                          {timeAgo(contract.createdAt)} · Contrat {contract.number}
                        </p>
                      </div>
                      {cfg && (
                        <span className={`px-2 py-1 text-[10px] font-bold rounded uppercase shrink-0 ${cfg.className}`}>
                          {cfg.label}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right — Fleet status donut + Map card */}
        <div className="lg:col-span-4 space-y-6">
          {/* Donut Chart */}
          <div className="bg-white rounded-xl shadow-[0px_4px_20px_rgba(15,23,42,0.05)] border border-[#c5c5d3]/10 p-6 flex flex-col items-center">
            <h4 className="text-xl font-semibold text-[#0b1c30] w-full mb-6">Statut de la flotte</h4>

            <div className="relative w-52 h-52 flex items-center justify-center mb-6">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="#e5eeff" strokeWidth="3" />
                {totalVehicles === 0 ? (
                  <circle cx="18" cy="18" r="16" fill="none" stroke="#c5c5d3" strokeWidth="3"
                    strokeDasharray={`${C} ${C}`} />
                ) : (
                  donutSegments.map((seg, i) =>
                    seg.len > 0 ? (
                      <circle
                        key={i}
                        cx="18" cy="18" r="16"
                        fill="none"
                        stroke={seg.color}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={`${seg.len} ${C}`}
                        strokeDashoffset={seg.offset}
                      />
                    ) : null
                  )
                )}
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-bold text-[#0b1c30]">{operationalPct}%</span>
                <span className="text-[10px] text-[#444651] uppercase tracking-tighter">Opérationnel</span>
              </div>
            </div>

            <div className="w-full space-y-3">
              {[
                { label: "Disponibles", count: availableVehicles, color: "#006c49" },
                { label: "En location", count: rentedVehicles, color: "#00236f" },
                { label: "En réparation", count: maintenanceVehicles, color: "#ffb95f" },
                { label: "Hors service", count: outOfServiceVehicles, color: "#ba1a1a" },
              ].map(({ label, count, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-sm text-[#444651]">{label}</span>
                  </div>
                  <span className="font-bold text-[#0b1c30]">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick links card */}
          <div className="bg-[#00236f] rounded-xl p-6 text-white relative overflow-hidden h-64 flex flex-col justify-between">
            {/* Decorative grid */}
            <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid-dash" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M 24 0 L 0 0 0 24" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-dash)" />
            </svg>
            <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-white/5 border border-white/10" />
            <div className="absolute bottom-16 right-8 w-12 h-12 rounded-full bg-white/5 border border-white/10" />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-5 w-5 text-[#6cf8bb]" />
                <h5 className="text-lg font-semibold">Accès rapide</h5>
              </div>
              <p className="text-sm opacity-75 leading-relaxed">
                Naviguez rapidement vers les sections clés de votre flotte.
              </p>
            </div>

            <div className="relative z-10 grid grid-cols-2 gap-2">
              <Link
                href="/vehicles"
                className="py-2.5 text-center bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold transition-colors border border-white/10"
              >
                Véhicules
              </Link>
              <Link
                href="/contracts"
                className="py-2.5 text-center bg-[#6cf8bb] text-[#00236f] rounded-lg text-sm font-semibold hover:bg-[#4edea3] transition-colors"
              >
                Contrats
              </Link>
              <Link
                href="/drivers"
                className="py-2.5 text-center bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold transition-colors border border-white/10"
              >
                Chauffeurs
              </Link>
              <Link
                href="/invoices"
                className="py-2.5 text-center bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold transition-colors border border-white/10"
              >
                Factures
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
