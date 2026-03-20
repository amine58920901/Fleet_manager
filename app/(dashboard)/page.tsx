import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { PageHeader } from "@/components/layout/page-header"
import { formatCurrency } from "@/lib/utils"
import { Car, Users, ClipboardList, Receipt } from "lucide-react"

async function getStats(organizationId: string) {
  const [
    totalVehicles,
    availableVehicles,
    rentedVehicles,
    maintenanceVehicles,
    totalDrivers,
    activeContracts,
    unpaidInvoices,
    paidThisMonth,
  ] = await Promise.all([
    db.vehicle.count({ where: { organizationId } }),
    db.vehicle.count({ where: { organizationId, status: "AVAILABLE" } }),
    db.vehicle.count({ where: { organizationId, status: "RENTED" } }),
    db.vehicle.count({ where: { organizationId, status: "MAINTENANCE" } }),
    db.driver.count({ where: { organizationId } }),
    db.contract.count({ where: { organizationId, status: "ACTIVE" } }),
    db.invoice.count({ where: { organizationId, status: "UNPAID" } }),
    db.invoice.aggregate({
      where: {
        organizationId,
        status: "PAID",
        updatedAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { total: true },
    }),
  ])

  return {
    totalVehicles,
    availableVehicles,
    rentedVehicles,
    maintenanceVehicles,
    totalDrivers,
    activeContracts,
    unpaidInvoices,
    monthlyRevenue: Number(paidThisMonth._sum.total ?? 0),
  }
}

export default async function DashboardPage() {
  const session = await auth()
  const stats = await getStats(session!.user.organizationId)

  const cards = [
    {
      label: "Véhicules",
      value: stats.totalVehicles,
      sub: `${stats.availableVehicles} disponibles · ${stats.rentedVehicles} en location`,
      icon: Car,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Chauffeurs",
      value: stats.totalDrivers,
      sub: "Chauffeurs enregistrés",
      icon: Users,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Contrats actifs",
      value: stats.activeContracts,
      sub: "Locations en cours",
      icon: ClipboardList,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Factures impayées",
      value: stats.unpaidInvoices,
      sub: `${formatCurrency(stats.monthlyRevenue)} encaissés ce mois`,
      icon: Receipt,
      color: "bg-orange-50 text-orange-600",
    },
  ]

  return (
    <div>
      <PageHeader
        title="Tableau de bord"
        description="Vue d'ensemble de votre flotte"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">{label}</span>
              <span className={`p-2 rounded-lg ${color}`}>
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Statut de la flotte</h2>
          <div className="space-y-3">
            <StatusBar label="Disponibles" value={stats.availableVehicles} total={stats.totalVehicles} color="bg-green-500" />
            <StatusBar label="En location" value={stats.rentedVehicles} total={stats.totalVehicles} color="bg-blue-500" />
            <StatusBar label="En réparation" value={stats.maintenanceVehicles} total={stats.totalVehicles} color="bg-orange-500" />
            <StatusBar
              label="Hors service"
              value={stats.totalVehicles - stats.availableVehicles - stats.rentedVehicles - stats.maintenanceVehicles}
              total={stats.totalVehicles}
              color="bg-red-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusBar({
  label,
  value,
  total,
  color,
}: {
  label: string
  value: number
  total: number
  color: string
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">{value}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
