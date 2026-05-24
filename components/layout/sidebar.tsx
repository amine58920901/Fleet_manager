"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { navItems, adminNavItems, bottomNavItems } from "@/components/layout/nav-items"

function NavLink({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) {
  const pathname = usePathname()
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href)
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-6 py-3 text-sm font-semibold tracking-wide transition-all duration-200",
        isActive
          ? "bg-[#1e3a8a] text-[#90a8ff] border-l-4 border-[#6cf8bb] rounded-r-lg"
          : "text-[#b6c4ff] hover:text-white hover:bg-white/10 border-l-4 border-transparent"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  )
}

export function Sidebar() {
  const { data: session } = useSession()
  const isAdmin = (session?.user as any)?.role === "ADMIN"

  return (
    <aside className="hidden lg:flex w-[260px] bg-[#00236f] text-white flex-col sticky top-0 h-screen shadow-xl shrink-0">
      <div className="px-6 py-8 mb-2 shrink-0">
        <h1 className="text-xl font-bold text-white">FleetManager</h1>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => <NavLink key={item.href} {...item} />)}
        {isAdmin && adminNavItems.map((item) => <NavLink key={item.href} {...item} />)}
      </nav>

      <div className="border-t border-white/10 pt-2 pb-6 space-y-0.5 shrink-0">
        {bottomNavItems.map((item) => <NavLink key={item.href} {...item} />)}
      </div>
    </aside>
  )
}
