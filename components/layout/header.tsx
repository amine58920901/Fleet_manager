import { auth, signOut } from "@/lib/auth"
import { LogOut, User } from "lucide-react"
import { MobileNav } from "@/components/layout/mobile-nav"

export async function Header() {
  const session = await auth()

  return (
    <header className="h-14 bg-white border-b flex items-center px-4 lg:px-6 gap-4">
      <MobileNav />
      <div className="ml-auto flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">{session?.user?.name ?? session?.user?.email}</span>
        </div>
        <form
          action={async () => {
            "use server"
            await signOut({ redirectTo: "/login" })
          }}
        >
          <button
            type="submit"
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </form>
      </div>
    </header>
  )
}
