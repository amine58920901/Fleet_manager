import { LayoutDashboard, Car, Users, FileText, Receipt, ClipboardList, Settings, Shield } from "lucide-react"

export const navItems = [
  { href: "/", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/vehicles", label: "Véhicules", icon: Car },
  { href: "/drivers", label: "Chauffeurs", icon: Users },
  { href: "/quotes", label: "Devis", icon: FileText },
  { href: "/invoices", label: "Factures", icon: Receipt },
  { href: "/contracts", label: "Contrats", icon: ClipboardList },
]

export const adminNavItems = [
  { href: "/team", label: "Équipe", icon: Shield },
]

export const bottomNavItems = [
  { href: "/settings", label: "Paramètres", icon: Settings },
]
