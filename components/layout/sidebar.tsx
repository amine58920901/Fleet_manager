"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { navItems, bottomNavItems } from "@/components/layout/nav-items"

function NavLink({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) {
  const pathname = usePathname()
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href)
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        isActive
          ? "bg-blue-600 text-white"
          : "text-gray-400 hover:text-white hover:bg-gray-800"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  )
}

export function Sidebar() {
  return (
    <aside className="hidden lg:flex w-60 bg-gray-900 text-white flex-col sticky top-0 h-screen">
      <div className="px-6 py-5 border-b border-gray-800 flex-shrink-0">
        <h1 className="text-lg font-bold text-white">FleetManager</h1>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => <NavLink key={item.href} {...item} />)}
      </nav>

      <div className="px-3 py-4 border-t border-gray-800 space-y-1 flex-shrink-0">
        {bottomNavItems.map((item) => <NavLink key={item.href} {...item} />)}
      </div>
    </aside>
  )
}
