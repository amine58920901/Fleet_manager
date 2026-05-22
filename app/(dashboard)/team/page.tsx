import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { TeamManagement } from "@/components/team/team-management"
import { PageHeader } from "@/components/layout/page-header"

export default async function TeamPage() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "ADMIN") redirect("/")

  const users = await db.user.findMany({
    where: { organizationId: session.user.organizationId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  })

  return (
    <>
      <PageHeader
        title="Équipe"
        description="Gérez les membres de votre organisation et leurs droits d'accès."
      />
      <TeamManagement users={users} currentUserId={session.user.id} />
    </>
  )
}
