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
        className="lg:hidden p-2 rounded-lg hover:bg-[#eff4ff] transition-colors"
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-5 w-5 text-[#444651]" />
      </button>

      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={close} />
      )}

      <aside
        className={cn(
          "lg:hidden fixed left-0 top-0 h-full w-[260px] bg-[#00236f] text-white z-50 flex flex-col transition-transform duration-300 ease-in-out shadow-xl",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="px-6 py-8 flex items-center justify-between shrink-0">
          <h1 className="text-xl font-bold text-white">FleetManager</h1>
          <button onClick={close} className="text-[#b6c4ff] hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink key={item.href} {...item} pathname={pathname} onClose={close} />
          ))}
          {isAdmin && adminNavItems.map((item) => (
            <NavLink key={item.href} {...item} pathname={pathname} onClose={close} />
          ))}
        </nav>

        <div className="border-t border-white/10 pt-2 pb-6 space-y-0.5 shrink-0">
          {bottomNavItems.map((item) => (
            <NavLink key={item.href} {...item} pathname={pathname} onClose={close} />
          ))}
        </div>
      </aside>
    </>
  )
}
