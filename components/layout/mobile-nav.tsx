"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { Menu, X } from "lucide-react"
import { navItems, adminNavItems, bottomNavItems } from "@/components/layout/nav-items"

function NavLink({
  href,
  label,
  icon: Icon,
  pathname,
  onClose,
}: {
  href: string
  label: string
  icon: React.ElementType
  pathname: string
  onClose: () => void
}) {
  const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href)
  return (
    <Link
      href={href}
      onClick={onClose}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        isActive ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  )
}

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()
  const isAdmin = (session?.user as any)?.role === "ADMIN"
  const close = () => setOpen(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-5 w-5 text-gray-600" />
      </button>

      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={close} />
      )}

      <aside
        className={cn(
          "lg:hidden fixed left-0 top-0 h-full w-64 bg-gray-900 text-white z-50 flex flex-col transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="px-6 py-5 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
          <h1 className="text-lg font-bold text-white">FleetManager</h1>
          <button onClick={close} className="text-gray-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} pathname={pathname} onClose={close} />
          ))}
          {isAdmin && adminNavItems.map((item) => (
            <NavLink key={item.href} {...item} pathname={pathname} onClose={close} />
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-gray-800 space-y-1 flex-shrink-0">
          {bottomNavItems.map((item) => (
            <NavLink key={item.href} {...item} pathname={pathname} onClose={close} />
          ))}
        </div>
      </aside>
    </>
  )
}
