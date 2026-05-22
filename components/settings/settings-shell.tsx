"use client"

import { useState } from "react"
import type { OrganizationSettings } from "@prisma/client"
import { CompanySettingsForm } from "./company-settings-form"
import { DocumentSettingsForm } from "./document-settings-form"
import { AccountForm } from "./account-form"
import { Building2, FileText, UserCircle } from "lucide-react"

const TABS = [
  { id: "company", label: "Ma société", icon: Building2 },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "account", label: "Mon compte", icon: UserCircle },
] as const

type TabId = (typeof TABS)[number]["id"]

interface SettingsShellProps {
  settings: OrganizationSettings | null
  orgName: string
}

export function SettingsShell({ settings, orgName }: SettingsShellProps) {
  const [tab, setTab] = useState<TabId>("company")

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 max-w-5xl">
      {/* Sidebar navigation */}
      <aside className="w-full lg:w-52 flex-shrink-0">
        <nav className="bg-white rounded-xl border overflow-hidden">
          {TABS.map((t) => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors border-b last:border-0 text-left ${
                  active
                    ? "bg-blue-50 text-blue-700 font-semibold border-l-2 border-l-blue-600"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {t.label}
              </button>
            )
          })}
        </nav>

        {/* Aide */}
        <div className="mt-4 bg-blue-50 rounded-xl border border-blue-100 p-4">
          <p className="text-xs font-semibold text-blue-800 mb-1">Astuce</p>
          <p className="text-xs text-blue-600 leading-relaxed">
            Les informations de votre société apparaissent sur tous vos devis, factures et contrats.
          </p>
        </div>
      </aside>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        {tab === "company" && (
          <CompanySettingsForm settings={settings} orgName={orgName} />
        )}
        {tab === "documents" && (
          <DocumentSettingsForm settings={settings} orgName={orgName} />
        )}
        {tab === "account" && <AccountForm />}
      </div>
    </div>
  )
}
