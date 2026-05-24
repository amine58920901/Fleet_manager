import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import Link from "next/link"
import { Plus, ChevronRight, AlertTriangle, UserCheck } from "lucide-react"
import { DriversGrid } from "@/components/drivers/drivers-grid"
import { StatusFilter } from "@/components/ui/status-filter"

const FILTER_OPTIONS = [
  { value: "ALL", label: "Tous" },
  { value: "ACTIVE", label: "En service" },
  { value: "AVAILABLE", label: "Disponible" },
]

export default async function DriversPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const session = await auth()
  const orgId = session!.user.organizationId

  const activityFilter =
    status === "ACTIVE"
      ? { contracts: { some: { status: "ACTIVE" as const } } }
      : status === "AVAILABLE"
      ? { contracts: { none: { status: "ACTIVE" as const } } }
      : {}

  const [drivers, totalDrivers, activeDrivers, expiringLicenses] = await Promise.all([
    db.driver.findMany({
      where: { organizationId: orgId, ...activityFilter },
      orderBy: { createdAt: "desc" },
      include: {
        contracts: {
          include: { vehicle: true },
          orderBy: { createdAt: "desc" },
          take: 3,
        },
      },
    }),
    db.driver.count({ where: { organizationId: orgId } }),
    db.driver.count({
      where: { organizationId: orgId, contracts: { some: { status: "ACTIVE" } } },
    }),
    db.driver.count({
      where: {
        organizationId: orgId,
        licenseExpiry: {
          lte: new Date(Date.now() + 60 * 24 * 3600 * 1000),
          gte: new Date(),
        },
      },
    }),
  ])

  return (
    <div className="space-y-8 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <nav className="flex items-center gap-1.5 text-[#444651] mb-2">
            <span className="text-xs font-semibold">Équipe</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-xs font-bold text-[#00236f]">Chauffeurs</span>
          </nav>
          <h1 className="text-4xl font-bold tracking-tight text-[#00236f]">Équipe &amp; Chauffeurs</h1>
          <p className="text-base text-[#444651] mt-1">
            Gérez votre personnel de conduite et suivez leur activité.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-[#dce9ff] px-4 py-2 rounded-xl text-[#00236f]">
            <UserCheck className="h-4 w-4" />
            <span className="text-sm font-semibold">{activeDrivers} en service</span>
          </div>
          {expiringLicenses > 0 && (
            <div className="flex items-center gap-2 bg-[#ffddb8] px-4 py-2 rounded-xl text-[#653e00]">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-semibold">{expiringLicenses} permis expirant</span>
            </div>
          )}
          <Link
            href="/drivers/new"
            className="flex items-center gap-2 bg-[#00236f] text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-[#00236f]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all shrink-0"
          >
            <Plus className="h-4 w-4" />
            Nouveau chauffeur
          </Link>
        </div>
      </div>

      {/* Status filter */}
      <StatusFilter options={FILTER_OPTIONS} className="flex flex-wrap gap-2" />

      {/* Grid */}
      <DriversGrid key={status ?? "ALL"} drivers={drivers} />
    </div>
  )
}
