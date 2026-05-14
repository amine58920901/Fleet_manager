"use client"

import { useState } from "react"
import { toast } from "sonner"
import { saveSettingsAction } from "@/actions/settings.actions"
import type { OrganizationSettings } from "@prisma/client"

const LEGAL_FORMS = [
  "Auto-entrepreneur",
  "EI",
  "EIRL",
  "EURL",
  "SARL",
  "SAS",
  "SASU",
  "SA",
  "SNC",
  "Autre",
]

interface Props {
  settings: OrganizationSettings | null
  orgName: string
}

export function CompanySettingsForm({ settings, orgName }: Props) {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)

    const result = await saveSettingsAction({
      companyName: (fd.get("companyName") as string) || undefined,
      legalForm: (fd.get("legalForm") as string) || undefined,
      siret: (fd.get("siret") as string) || undefined,
      vatNumber: (fd.get("vatNumber") as string) || undefined,
      companyAddress: (fd.get("companyAddress") as string) || undefined,
      companyCity: (fd.get("companyCity") as string) || undefined,
      companyZip: (fd.get("companyZip") as string) || undefined,
      companyCountry: (fd.get("companyCountry") as string) || undefined,
      companyPhone: (fd.get("companyPhone") as string) || undefined,
      companyEmail: (fd.get("companyEmail") as string) || undefined,
      companyWebsite: (fd.get("companyWebsite") as string) || undefined,
    })

    setLoading(false)
    if (result.success) toast.success("Informations sauvegardées")
    else toast.error(result.error)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Identité légale */}
      <Section title="Identité légale">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Raison sociale *">
              <input
                name="companyName"
                required
                defaultValue={settings?.companyName ?? orgName}
                placeholder="Nom de votre entreprise"
                className={input}
              />
            </Field>
          </div>
          <Field label="Forme juridique">
            <select name="legalForm" defaultValue={settings?.legalForm ?? ""} className={`${input} bg-white`}>
              <option value="">— Sélectionner —</option>
              {LEGAL_FORMS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </Field>
          <Field label="SIRET" hint="14 chiffres">
            <input
              name="siret"
              defaultValue={settings?.siret ?? ""}
              placeholder="000 000 000 00000"
              maxLength={17}
              className={input}
            />
          </Field>
          <Field label="N° TVA intracommunautaire" hint="Optionnel">
            <input
              name="vatNumber"
              defaultValue={settings?.vatNumber ?? ""}
              placeholder="FR 00 000000000"
              className={input}
            />
          </Field>
        </div>
      </Section>

      {/* Adresse */}
      <Section title="Adresse du siège social">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Adresse">
              <input
                name="companyAddress"
                defaultValue={settings?.companyAddress ?? ""}
                placeholder="Numéro et nom de rue"
                className={input}
              />
            </Field>
          </div>
          <Field label="Code postal">
            <input
              name="companyZip"
              defaultValue={settings?.companyZip ?? ""}
              placeholder="75001"
              className={input}
            />
          </Field>
          <Field label="Ville">
            <input
              name="companyCity"
              defaultValue={settings?.companyCity ?? ""}
              placeholder="Paris"
              className={input}
            />
          </Field>
          <div className="col-span-2">
            <Field label="Pays">
              <input
                name="companyCountry"
                defaultValue={settings?.companyCountry ?? "France"}
                placeholder="France"
                className={input}
              />
            </Field>
          </div>
        </div>
      </Section>

      {/* Contact */}
      <Section title="Coordonnées">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Téléphone">
            <input
              name="companyPhone"
              type="tel"
              defaultValue={settings?.companyPhone ?? ""}
              placeholder="+33 1 23 45 67 89"
              className={input}
            />
          </Field>
          <Field label="Email">
            <input
              name="companyEmail"
              type="email"
              defaultValue={settings?.companyEmail ?? ""}
              placeholder="contact@société.fr"
              className={input}
            />
          </Field>
          <div className="col-span-2">
            <Field label="Site web">
              <input
                name="companyWebsite"
                defaultValue={settings?.companyWebsite ?? ""}
                placeholder="https://www.société.fr"
                className={input}
              />
            </Field>
          </div>
        </div>
      </Section>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "Sauvegarde…" : "Sauvegarder"}
      </button>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="px-5 py-3 border-b bg-gray-50">
        <h2 className="text-sm font-semibold text-gray-700">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {hint && <span className="ml-1.5 text-xs text-gray-400 font-normal">{hint}</span>}
      </label>
      {children}
    </div>
  )
}

const input = "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
