"use client"

import { useState, useRef } from "react"
import { toast } from "sonner"
import { saveSettingsAction } from "@/actions/settings.actions"
import type { OrganizationSettings } from "@prisma/client"
import { Upload, X, Check } from "lucide-react"

const FONTS: { id: string; label: string; description: string; style: React.CSSProperties }[] = [
  { id: "Helvetica",        label: "Helvetica",        description: "Sans-serif · Moderne & épuré",  style: { fontFamily: "Arial, sans-serif" } },
  { id: "Times-Roman",      label: "Times Roman",       description: "Serif · Classique & formel",   style: { fontFamily: "Georgia, serif" } },
  { id: "Courier",          label: "Courier",           description: "Monospace · Technique",         style: { fontFamily: "Courier New, monospace" } },
  { id: "Plus Jakarta Sans", label: "Plus Jakarta Sans", description: "Sans-serif · Contemporain",    style: { fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" } },
  { id: "Montserrat",       label: "Montserrat",        description: "Sans-serif · Élégant & pro",   style: { fontFamily: "'Montserrat', Arial, sans-serif" } },
]

const PALETTES = [
  { name: "Bleu",     primary: "#2563eb", secondary: "#1e40af", accent: "#eff6ff" },
  { name: "Vert",     primary: "#16a34a", secondary: "#166534", accent: "#f0fdf4" },
  { name: "Violet",   primary: "#7c3aed", secondary: "#5b21b6", accent: "#f5f3ff" },
  { name: "Orange",   primary: "#ea580c", secondary: "#9a3412", accent: "#fff7ed" },
  { name: "Ardoise",  primary: "#475569", secondary: "#1e293b", accent: "#f8fafc" },
  { name: "Rose",     primary: "#db2777", secondary: "#9d174d", accent: "#fdf2f8" },
  { name: "Teal",     primary: "#0d9488", secondary: "#0f766e", accent: "#f0fdfa" },
  { name: "Noir",     primary: "#18181b", secondary: "#3f3f46", accent: "#fafafa" },
]

interface Props {
  settings: OrganizationSettings | null
  orgName: string
}

export function DocumentSettingsForm({ settings, orgName }: Props) {
  const [loading, setLoading] = useState(false)
  const [primary, setPrimary] = useState(settings?.primaryColor ?? "#2563eb")
  const [secondary, setSecondary] = useState(settings?.secondaryColor ?? "#1e40af")
  const [accent, setAccent] = useState(settings?.accentColor ?? "#eff6ff")
  const [font, setFont] = useState(settings?.documentFont ?? "Helvetica")
  const [logo, setLogo] = useState<string | null>(settings?.logoBase64 ?? null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const companyName = settings?.companyName ?? orgName
  const fontStyle = FONTS.find((f) => f.id === font)?.style ?? {}

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error("Logo trop lourd (max 2 Mo)"); return }
    const reader = new FileReader()
    reader.onload = (ev) => setLogo(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const result = await saveSettingsAction({ primaryColor: primary, secondaryColor: secondary, accentColor: accent, documentFont: font, logoBase64: logo })
    setLoading(false)
    if (result.success) toast.success("Paramètres documents sauvegardés")
    else toast.error(result.error)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Aperçu live */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-5 py-3 border-b bg-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Aperçu document</h2>
          <span className="text-xs text-gray-400">Mis à jour en temps réel</span>
        </div>
        <div className="p-5">
          <div className="rounded-xl overflow-hidden border shadow-sm" style={{ borderColor: primary }}>
            {/* En-tête document */}
            <div className="flex items-center justify-between px-6 py-4" style={{ backgroundColor: primary }}>
              <div className="flex items-center gap-3">
                {logo ? (
                  <img src={logo} alt="Logo" className="h-10 w-10 object-contain rounded-lg bg-white p-0.5" />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center text-white text-[10px] font-bold">
                    LOGO
                  </div>
                )}
                <div>
                  <div className="text-white font-bold text-sm" style={fontStyle}>{companyName}</div>
                  <div className="text-white/60 text-xs" style={fontStyle}>
                    {settings?.legalForm ?? "Votre forme juridique"} {settings?.siret ? `· SIRET ${settings.siret}` : ""}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-white font-bold text-lg tracking-wide" style={fontStyle}>DEVIS</div>
                <div className="text-white/60 text-xs" style={fontStyle}>DEV-2025-00001</div>
              </div>
            </div>
            {/* Corps */}
            <div className="p-5" style={{ backgroundColor: accent }}>
              <div className="bg-white rounded-lg p-4 space-y-2 shadow-sm">
                <div className="flex justify-between text-xs font-semibold pb-1.5 border-b" style={{ color: primary, fontFamily: fontStyle.fontFamily }}>
                  <span>Description</span>
                  <span>Montant HT</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600" style={{ fontFamily: fontStyle.fontFamily }}>
                  <span>Peugeot 308 — 30 jours</span>
                  <span>900,00 €</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400" style={{ fontFamily: fontStyle.fontFamily }}>
                  <span>TVA 20%</span>
                  <span>180,00 €</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-1.5 border-t" style={{ color: secondary, fontFamily: fontStyle.fontFamily }}>
                  <span>Total TTC</span>
                  <span>1 080,00 €</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logo */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-5 py-3 border-b bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700">Logo société</h2>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-5">
            {logo ? (
              <div className="relative">
                <img src={logo} alt="Logo" className="h-20 w-20 object-contain border rounded-xl p-2 bg-gray-50" />
                <button
                  type="button"
                  onClick={() => { setLogo(null); if (fileInputRef.current) fileInputRef.current.value = "" }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="h-20 w-20 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:border-blue-400 hover:text-blue-400 transition-colors"
              >
                <Upload className="h-5 w-5 mb-1" />
                <span className="text-[10px]">Upload</span>
              </div>
            )}
            <div>
              <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleLogoChange} className="hidden" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                {logo ? "Changer le logo" : "Choisir un fichier"}
              </button>
              <p className="text-xs text-gray-400 mt-1.5">PNG, JPG, WEBP · max 2 Mo</p>
              <p className="text-xs text-gray-400">Recommandé : fond transparent, format carré</p>
            </div>
          </div>
        </div>
      </div>

      {/* Palette de couleurs */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-5 py-3 border-b bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700">Couleurs des documents</h2>
        </div>
        <div className="p-5 space-y-5">
          {/* Palettes rapides */}
          <div>
            <p className="text-xs text-gray-500 mb-2 font-medium">Thèmes prédéfinis</p>
            <div className="flex flex-wrap gap-2">
              {PALETTES.map((p) => {
                const active = p.primary === primary && p.secondary === secondary
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => { setPrimary(p.primary); setSecondary(p.secondary); setAccent(p.accent) }}
                    className={`flex items-center gap-2 px-3 py-1.5 border rounded-lg text-xs transition-all ${active ? "border-blue-500 bg-blue-50 font-semibold text-blue-700" : "hover:border-gray-300 text-gray-600"}`}
                  >
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: p.primary }} />
                    {p.name}
                    {active && <Check className="w-3 h-3" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Pickers personnalisés */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ColorPicker label="Couleur principale" description="En-tête, titres" value={primary} onChange={setPrimary} />
            <ColorPicker label="Couleur secondaire" description="Totaux, accents forts" value={secondary} onChange={setSecondary} />
            <ColorPicker label="Couleur de fond" description="Fond des blocs infos" value={accent} onChange={setAccent} />
          </div>
        </div>
      </div>

      {/* Police */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-5 py-3 border-b bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700">Police des documents</h2>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {FONTS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFont(f.id)}
                className={`border rounded-xl p-4 text-left transition-all ${font === f.id ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "hover:border-gray-300"}`}
              >
                <div className="text-2xl font-bold text-gray-800 mb-2 leading-none" style={f.style}>Aa</div>
                <div className="text-sm font-semibold text-gray-900">{f.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{f.description}</div>
                {/* Aperçu phrase */}
                <div className="mt-3 text-[10px] text-gray-500 leading-relaxed border-t pt-2" style={f.style}>
                  Devis · Facture · Contrat
                </div>
                {font === f.id && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-blue-600 font-medium">
                    <Check className="w-3 h-3" /> Sélectionné
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "Sauvegarde…" : "Sauvegarder les paramètres documents"}
      </button>
    </form>
  )
}

function ColorPicker({ label, description, value, onChange }: { label: string; description: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center gap-2 mb-1">
        <div className="relative flex-shrink-0">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 w-9 rounded-lg border cursor-pointer p-0.5 bg-white"
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={(e) => { if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) onChange(e.target.value) }}
          className="flex-1 px-2 py-1.5 border rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-0"
        />
      </div>
      <p className="text-[11px] text-gray-400">{description}</p>
    </div>
  )
}
