"use client"

import { useState } from "react"
import { Plus, X, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

export const ZONES = [
  { id: "parechoc_av",  label: "Pare-choc avant" },
  { id: "capot",        label: "Capot" },
  { id: "aile_avd",    label: "Aile av. droite" },
  { id: "aile_avg",    label: "Aile av. gauche" },
  { id: "porte_avd",   label: "Portière av. droite" },
  { id: "porte_avg",   label: "Portière av. gauche" },
  { id: "porte_ard",   label: "Portière ar. droite" },
  { id: "porte_arg",   label: "Portière ar. gauche" },
  { id: "aile_ard",    label: "Aile ar. droite" },
  { id: "aile_arg",    label: "Aile ar. gauche" },
  { id: "parechoc_ar", label: "Pare-choc arrière" },
  { id: "coffre",      label: "Coffre" },
  { id: "toit",        label: "Toit" },
  { id: "vitres",      label: "Vitres" },
  { id: "interieur",   label: "Intérieur" },
]

const DAMAGE_TYPES = [
  { value: "rayure",  label: "Rayure" },
  { value: "bosse",   label: "Bosse" },
  { value: "bris",    label: "Bris / Cassure" },
  { value: "absent",  label: "Élément absent" },
  { value: "autre",   label: "Autre" },
]

const SEVERITIES = [
  { value: "léger",  label: "Léger" },
  { value: "moyen",  label: "Moyen" },
  { value: "grave",  label: "Grave" },
]

export interface DamageEntry {
  type: string
  severity: string
  note: string
}

export type VehicleCondition = Record<string, DamageEntry>

interface VehicleConditionFormProps {
  value: VehicleCondition
  onChange: (v: VehicleCondition) => void
}

export function VehicleConditionForm({ value, onChange }: VehicleConditionFormProps) {
  const [activeZone, setActiveZone] = useState<string | null>(null)
  const [draft, setDraft] = useState<DamageEntry>({ type: "rayure", severity: "léger", note: "" })

  function openZone(zoneId: string) {
    const existing = value[zoneId]
    setDraft(existing ? { ...existing } : { type: "rayure", severity: "léger", note: "" })
    setActiveZone(zoneId)
  }

  function toggle(zoneId: string) {
    if (activeZone === zoneId) {
      setActiveZone(null)
    } else {
      openZone(zoneId)
    }
  }

  function save() {
    if (!activeZone) return
    onChange({ ...value, [activeZone]: { ...draft } })
    setActiveZone(null)
  }

  function remove(zoneId: string) {
    const next = { ...value }
    delete next[zoneId]
    onChange(next)
    setActiveZone(null)
  }

  const damagedCount = Object.keys(value).length

  return (
    <div>
      {damagedCount > 0 && (
        <div className="mb-3 flex items-center gap-1.5 text-sm font-medium text-orange-600">
          <AlertTriangle className="w-4 h-4" />
          {damagedCount} zone{damagedCount > 1 ? "s" : ""} endommagée{damagedCount > 1 ? "s" : ""}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {ZONES.map((zone) => {
          const damage = value[zone.id]
          const isActive = activeZone === zone.id
          return (
            <button
              key={zone.id}
              type="button"
              onClick={() => toggle(zone.id)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg border text-xs font-medium transition-all",
                damage
                  ? "border-orange-300 bg-orange-50 text-orange-700"
                  : isActive
                  ? "border-blue-400 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              )}
            >
              <div className="flex items-start justify-between gap-1">
                <span className="leading-tight">{zone.label}</span>
                {damage ? (
                  <span className="shrink-0 mt-0.5 w-2 h-2 rounded-full bg-orange-400" />
                ) : (
                  <Plus className="shrink-0 mt-0.5 w-3 h-3 text-gray-400" />
                )}
              </div>
              {damage && (
                <div className="mt-0.5 font-normal text-orange-500">
                  {damage.type} · {damage.severity}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {activeZone && (
        <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-gray-800">
              {ZONES.find((z) => z.id === activeZone)?.label}
            </h4>
            <button
              type="button"
              onClick={() => setActiveZone(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mb-3 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Type de dommage</label>
              <select
                value={draft.type}
                onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value }))}
                className="w-full rounded-lg border px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {DAMAGE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Gravité</label>
              <select
                value={draft.severity}
                onChange={(e) => setDraft((d) => ({ ...d, severity: e.target.value }))}
                className="w-full rounded-lg border px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {SEVERITIES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-3">
            <label className="mb-1 block text-xs font-medium text-gray-600">Note (optionnel)</label>
            <input
              type="text"
              value={draft.note}
              onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))}
              placeholder="Ex : rayure de 10 cm sur le bas de la portière..."
              className="w-full rounded-lg border px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={save}
              className="flex-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Confirmer
            </button>
            {value[activeZone] && (
              <button
                type="button"
                onClick={() => remove(activeZone)}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                Supprimer
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface ConditionDisplayProps {
  condition: VehicleCondition | null | undefined
}

export function ConditionDisplay({ condition }: ConditionDisplayProps) {
  if (!condition || Object.keys(condition).length === 0) {
    return <p className="text-sm text-gray-400 italic">Aucun dommage enregistré</p>
  }

  return (
    <div className="space-y-2">
      {Object.entries(condition).map(([zoneId, damage]) => {
        const zone = ZONES.find((z) => z.id === zoneId)
        const severityColor =
          damage.severity === "grave"
            ? "text-red-600 bg-red-50 border-red-200"
            : damage.severity === "moyen"
            ? "text-orange-600 bg-orange-50 border-orange-200"
            : "text-yellow-700 bg-yellow-50 border-yellow-200"

        return (
          <div
            key={zoneId}
            className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 ${severityColor}`}
          >
            <span className="mt-1 shrink-0 w-2 h-2 rounded-full bg-current opacity-60" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800">{zone?.label ?? zoneId}</p>
              <p className="text-xs capitalize">
                {damage.type} · {damage.severity}
              </p>
              {damage.note && (
                <p className="mt-0.5 text-xs text-gray-500">{damage.note}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
