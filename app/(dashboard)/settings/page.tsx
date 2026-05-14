import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { PageHeader } from "@/components/layout/page-header"
import { SettingsShell } from "@/components/settings/settings-shell"

export default async function SettingsPage() {
  const session = await auth()
  const [settings, org] = await Promise.all([
    db.organizationSettings.findUnique({ where: { organizationId: session!.user.organizationId } }),
    db.organization.findUnique({ where: { id: session!.user.organizationId } }),
  ])

  return (
    <div>
      <PageHeader
        title="Paramètres"
        description="Gérez les informations de votre société et l'apparence de vos documents"
      />
      <SettingsShell settings={settings} orgName={org?.name ?? ""} />
    </div>
  )
}
