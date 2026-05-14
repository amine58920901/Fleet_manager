"use client"

import { useState, useRef } from "react"
import { toast } from "sonner"
import { saveSettingsAction } from "@/actions/settings.actions"
import type { OrganizationSettings } from "@prisma/client"
import { Upload, X } from "lucide-react"

interface PdfSettingsFormProps {
  settings: OrganizationSettings | null
  orgName: string
}

export function PdfSettingsForm({ settings, orgName }: PdfSettingsFormProps) {
  const [loading, setLoading] = useState(false)
  const [primaryColor, setPrimaryColor] = useState(settings?.primaryColor ?? "#2563eb")
  const [secondaryColor, setSecondaryColor] = useState(settings?.secondaryColor ?? "#1e40af")
  const [accentColor, setAccentColor] = useState(settings?.accentColor ?? "#eff6ff")
  const [logo, setLogo] = useState<string | null>(settings?.logoBase64 ?? null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo trop lourd (max 2 Mo)")
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => setLogo(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const fd = new FormData(e.currentTarget)
    const result = await saveSettingsAction({
      primaryColor,
      secondaryColor,
      accentColor,
      logoBase64: logo,
      companyName: fd.get("companyName") as string || undefined,
      companyAddress: fd.get("companyAddress") as string || undefined,
      companyPhone: fd.get("companyPhone") as string || undefined,
      companyEmail: fd.get("companyEmail") as string || undefined,
      companyWebsite: fd.get("companyWebsite") as string || undefined,
    })

    setLoading(false)
    if (result.success) toast.success("Paramètres sauvegardés")
    else toast.error(result.error)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Aperçu */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Aperçu des couleurs</h2>
        <div className="rounded-lg overflow-hidden border" style={{ borderColor: primaryColor }}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4" style={{ backgroundColor: primaryColor }}>
            <div className="flex items-center gap-3">
              {logo ? (
                <img src={logo} alt="Logo" className="h-10 w-10 object-contain rounded bg-white p-0.5" />
              ) : (
                <div className="h-10 w-10 rounded bg-white/20 flex items-center justify-center text-white text-xs font-bold">
                  LOGO
                </div>
              )}
              <div>
                <div className="text-white font-bold text-sm">{settings?.companyName || orgName}</div>
                <div className="text-white/70 text-xs">Votre entreprise</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white font-bold text-lg">DEVIS</div>
              <div className="text-white/70 text-xs">DEV-2025-00001</div>
            </div>
          </div>
          {/* Body */}
          <div className="p-6" style={{ backgroundColor: accentColor }}>
            <div className="bg-white rounded p-4 text-xs text-gray-600 space-y-1">
              <div className="flex justify-between font-semibold" style={{ color: primaryColor }}>
                <span>Description</span><span>Montant</span>
              </div>
              <div className="flex justify-between border-t pt-1">
                <span>Toyota Corolla 2022 — 5 jours</span><span>500,00 €</span>
              </div>
              <div className="flex justify-between font-bold" style={{ color: secondaryColor }}>
                <span>Total TTC</span><span>595,00 €</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logo */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Logo</h2>
        <div className="flex items-center gap-4">
          {logo ? (
            <div className="relative">
              <img src={logo} alt="Logo" className="h-20 w-20 object-contain border rounded-lg p-2" />
              <button
                type="button"
                onClick={() => { setLogo(null); if (fileInputRef.current) fileInputRef.current.value = "" }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="h-20 w-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
              <Upload className="h-6 w-6" />
            </div>
          )}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              {logo ? "Changer le logo" : "Uploader un logo"}
            </button>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG · max 2 Mo · recommandé : carré</p>
          </div>
        </div>
      </div>

      {/* Couleurs */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Couleurs du PDF</h2>
        <div className="grid grid-cols-3 gap-6">
          <ColorPicker label="Couleur principale" value={primaryColor} onChange={setPrimaryColor}
            description="En-tête, boutons" />
          <ColorPicker label="Couleur secondaire" value={secondaryColor} onChange={setSecondaryColor}
            description="Totaux, accents" />
          <ColorPicker label="Couleur de fond" value={accentColor} onChange={setAccentColor}
            description="Fond de la zone client" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <p className="text-xs text-gray-500 w-full mb-1">Palettes prédéfinies :</p>
          {PALETTES.map((p) => (
            <button key={p.name} type="button"
              onClick={() => { setPrimaryColor(p.primary); setSecondaryColor(p.secondary); setAccentColor(p.accent) }}
              className="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs hover:bg-gray-50 transition-colors">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: p.primary }} />
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Infos entreprise */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Informations entreprise (apparaissent sur les PDFs)</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l&apos;entreprise</label>
            <input name="companyName" defaultValue={settings?.companyName ?? orgName}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input name="companyEmail" type="email" defaultValue={settings?.companyEmail ?? ""}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <input name="companyPhone" defaultValue={settings?.companyPhone ?? ""}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site web</label>
            <input name="companyWebsite" defaultValue={settings?.companyWebsite ?? ""}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
            <input name="companyAddress" defaultValue={settings?.companyAddress ?? ""}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      <button type="submit" disabled={loading}
        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
        {loading ? "Sauvegarde..." : "Sauvegarder les paramètres"}
      </button>
    </form>
  )
}

function ColorPicker({ label, value, onChange, description }: {
  label: string; value: string; onChange: (v: string) => void; description: string
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <div className="relative">
          <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
            className="h-10 w-10 rounded-lg border cursor-pointer p-0.5" />
        </div>
        <input type="text" value={value}
          onChange={(e) => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) onChange(e.target.value) }}
          className="flex-1 px-3 py-2 border rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <p className="text-xs text-gray-400 mt-1">{description}</p>
    </div>
  )
}

const PALETTES = [
  { name: "Bleu (défaut)", primary: "#2563eb", secondary: "#1e40af", accent: "#eff6ff" },
  { name: "Vert", primary: "#16a34a", secondary: "#166534", accent: "#f0fdf4" },
  { name: "Violet", primary: "#7c3aed", secondary: "#5b21b6", accent: "#f5f3ff" },
  { name: "Orange", primary: "#ea580c", secondary: "#9a3412", accent: "#fff7ed" },
  { name: "Ardoise", primary: "#475569", secondary: "#1e293b", accent: "#f8fafc" },
  { name: "Rose", primary: "#db2777", secondary: "#9d174d", accent: "#fdf2f8" },
]
