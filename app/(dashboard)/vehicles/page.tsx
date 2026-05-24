import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { VehiclesGrid } from "@/components/vehicles/vehicles-grid"
import { StatusFilter } from "@/components/ui/status-filter"
import Link from "next/link"
import { Plus, ChevronRight } from "lucide-react"
import type { VehicleStatus } from "@prisma/client"

const VALID_STATUSES: VehicleStatus[] = ["AVAILABLE", "RENTED", "MAINTENANCE", "OUT_OF_SERVICE"]

const FILTER_OPTIONS = [
  { value: "ALL", label: "Tous" },
  { value: "AVAILABLE", label: "Disponible" },
  { value: "RENTED", label: "En location" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "OUT_OF_SERVICE", label: "Hors service" },
]

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const session = await auth()

  const statusFilter =
    status && VALID_STATUSES.includes(status as VehicleStatus)
      ? { status: status as VehicleStatus }
      : {}

  const vehicles = await db.vehicle.findMany({
    where: { organizationId: session!.user.organizationId, ...statusFilter },
    orderBy: { createdAt: "desc" },
    include: {
      contracts: {
        include: { driver: true },
        orderBy: { createdAt: "desc" },
        take: 3,
      },
    },
  })

  return (
    <div className="space-y-8 max-w-[1440px] mx-auto">
      {/* Page Header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <nav className="flex items-center gap-1.5 text-[#444651] mb-2">
            <span className="text-xs font-semibold">Flotte</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-xs font-bold text-[#00236f]">Véhicules</span>
          </nav>
          <h1 className="text-4xl font-bold tracking-tight text-[#00236f]">
            Gestion de la flotte
          </h1>
          <p className="text-base text-[#444651] mt-1">
            Supervisez et gérez l&apos;ensemble de vos actifs roulants.
          </p>
        </div>
        <Link
          href="/vehicles/new"
          className="flex items-center gap-2 bg-[#00236f] text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-[#00236f]/20 hover:shadow-xl hover:-translate-y-0.5 transition-all shrink-0"
        >
          <Plus className="h-4 w-4" />
          Ajouter un véhicule
        </Link>
      </div>

      {/* Status filter pills */}
      <StatusFilter options={FILTER_OPTIONS} className="flex flex-wrap gap-2" />

      {/* Vehicle grid with inline search */}
      <VehiclesGrid key={status ?? "ALL"} vehicles={vehicles} />
    </div>
  )
}
