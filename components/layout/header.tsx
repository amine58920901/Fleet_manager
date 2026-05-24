import { auth } from "@/lib/auth"
import { Bell, HelpCircle, Search } from "lucide-react"
import { MobileNav } from "@/components/layout/mobile-nav"

export async function Header() {
  const session = await auth()
  const userName = session?.user?.name ?? session?.user?.email ?? ""
  const initials = userName.slice(0, 2).toUpperCase()
  const role = (session?.user as any)?.role === "ADMIN" ? "Administrateur" : "Fleet Manager"

  return (
    <header className="h-20 bg-white border-b border-[#c5c5d3] flex items-center px-6 lg:px-8 gap-4 shrink-0 shadow-sm">
      <MobileNav />

      {/* Search */}
      <div className="relative flex-1 max-w-md hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#757682]" />
        <input
          type="text"
          placeholder="Rechercher..."
          className="w-full pl-10 pr-4 py-2 bg-white border border-[#c5c5d3] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00236f]/30 focus:border-[#00236f] text-[#0b1c30] placeholder:text-[#757682] transition-all"
        />
      </div>

      <div className="ml-auto flex items-center gap-4 lg:gap-6">
        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-full hover:bg-[#eff4ff] transition-all" aria-label="Notifications">
            <Bell className="h-5 w-5 text-[#444651]" />
          </button>
          <button className="p-2 rounded-full hover:bg-[#eff4ff] transition-all hidden sm:flex" aria-label="Aide">
            <HelpCircle className="h-5 w-5 text-[#444651]" />
          </button>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-[#c5c5d3] hidden sm:block" />

        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-[#0b1c30] leading-none">{userName}</p>
            <p className="text-xs text-[#444651] mt-0.5">{role}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#dce1ff] flex items-center justify-center border border-[#c5c5d3] shrink-0">
            <span className="text-sm font-bold text-[#00236f]">{initials}</span>
          </div>
        </div>

      </div>
    </header>
  )
}
