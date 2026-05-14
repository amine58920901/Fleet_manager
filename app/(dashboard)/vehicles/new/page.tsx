import { PageHeader } from "@/components/layout/page-header"
import { VehicleForm } from "@/components/vehicles/vehicle-form"

export default function NewVehiclePage() {
  return (
    <div>
      <PageHeader
        title="Ajouter un véhicule"
        description="Enregistrer un nouveau véhicule dans votre flotte"
        backHref="/vehicles"
      />
      <div className="max-w-2xl">
        <VehicleForm />
      </div>
    </div>
  )
}
