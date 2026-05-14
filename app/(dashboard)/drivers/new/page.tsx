import { PageHeader } from "@/components/layout/page-header"
import { DriverForm } from "@/components/drivers/driver-form"

export default function NewDriverPage() {
  return (
    <div>
      <PageHeader
        title="Ajouter un chauffeur"
        description="Enregistrer un nouveau chauffeur"
        backHref="/drivers"
      />
      <div className="max-w-2xl">
        <DriverForm />
      </div>
    </div>
  )
}
