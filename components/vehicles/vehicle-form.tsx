"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Car, ImagePlus, X, Loader2 } from "lucide-react"
import { createVehicleAction, updateVehicleAction } from "@/actions/vehicle.actions"
import { VehicleCombobox } from "@/components/vehicles/vehicle-combobox"
import { CAR_BRANDS, CAR_COLORS, CAR_YEARS } from "@/lib/car-data"
import type { Vehicle } from "@prisma/client"

interface VehicleFormProps {
  vehicle?: Vehicle
  onSuccess?: () => void
}

export function VehicleForm({ vehicle, onSuccess }: VehicleFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  // Step 1 fields
  const [brand, setBrand] = useState(vehicle?.brand ?? "")
  const [model, setModel] = useState(vehicle?.model ?? "")
  const [year, setYear] = useState(vehicle?.year ? String(vehicle.year) : "")
  const [licensePlate, setLicensePlate] = useState(vehicle?.licensePlate ?? "")
  const [color, setColor] = useState(vehicle?.color ?? "")
  const [notes, setNotes] = useState(vehicle?.notes ?? "")

  // Step 2 fields
  const [dailyRate, setDailyRate] = useState(vehicle ? String(Number(vehicle.dailyRate)) : "")
  const [weeklyRate, setWeeklyRate] = useState(vehicle?.weeklyRate ? String(Number(vehicle.weeklyRate)) : "")
  const [monthlyRate, setMonthlyRate] = useState(vehicle?.monthlyRate ? String(Number(vehicle.monthlyRate)) : "")
  const [depositAmount, setDepositAmount] = useState(vehicle?.depositAmount ? String(Number(vehicle.depositAmount)) : "")
  const [mileage, setMileage] = useState(String(vehicle?.mileage ?? 0))
  const [vin, setVin] = useState(vehicle?.vin ?? "")
  const [status, setStatus] = useState(vehicle?.status ?? "AVAILABLE")

  const [imageUrl, setImageUrl] = useState(vehicle?.imageUrl ?? "")
  const [imageUploading, setImageUploading] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const [availableModels, setAvailableModels] = useState<string[]>(
    () => CAR_BRANDS.find((b) => b.name === (vehicle?.brand ?? ""))?.models ?? []
  )
  const brandNames = CAR_BRANDS.map((b) => b.name)

  async function handleImageChange(file: File) {
    setImageUploading(true)
    const fd = new FormData()
    fd.append("file", file)
    const res = await fetch("/api/upload", { method: "POST", body: fd })
    setImageUploading(false)
    if (!res.ok) {
      const text = await res.text()
      let msg = "Erreur lors de l'upload"
      try { msg = JSON.parse(text).error ?? msg } catch { /* not JSON */ }
      toast.error(msg)
      return
    }
    const { url } = await res.json()
    setImageUrl(url)
  }

  function handleBrandChange(val: string) {
    setBrand(val)
    setModel("")
    setAvailableModels(CAR_BRANDS.find((b) => b.name === val)?.models ?? [])
  }

  function validateStep1() {
    if (!brand) { toast.error("Sélectionnez un constructeur"); return false }
    if (availableModels.length > 0 && !model) { toast.error("Sélectionnez un modèle"); return false }
    if (!year) { toast.error("Sélectionnez l'année"); return false }
    if (!licensePlate.trim()) { toast.error("Saisissez la plaque d'immatriculation"); return false }
    if (!color) { toast.error("Sélectionnez la couleur"); return false }
    return true
  }

  async function handleSubmit() {
    if (!validateStep1()) return
    if (!dailyRate) { toast.error("Le tarif journalier est obligatoire"); return }

    setLoading(true)

    const data = {
      brand,
      model: model || brand,
      year: parseInt(year),
      licensePlate: licensePlate.trim().toUpperCase(),
      color: color || undefined,
      vin: vin.trim() || undefined,
      mileage: parseInt(mileage) || 0,
      status: status as any,
      dailyRate: parseFloat(dailyRate),
      weeklyRate: weeklyRate ? parseFloat(weeklyRate) : undefined,
      monthlyRate: monthlyRate ? parseFloat(monthlyRate) : undefined,
      depositAmount: depositAmount ? parseFloat(depositAmount) : undefined,
      imageUrl: imageUrl || undefined,
      notes: notes.trim() || undefined,
    }

    const result = vehicle
      ? await updateVehicleAction(vehicle.id, data)
      : await createVehicleAction(data)

    setLoading(false)

    if (result.success) {
      toast.success(vehicle ? "Véhicule mis à jour" : "Véhicule ajouté avec succès")
      if (!vehicle) {
        onSuccess?.()
        router.push("/vehicles")
        router.refresh()
      }
    } else {
      toast.error(result.error)
    }
  }

  function ImageUploadField({ compact = false }: { compact?: boolean }) {
    return (
      <div>
        <label className={`block font-medium text-gray-${compact ? "500" : "900"} mb-1.5 ${compact ? "text-xs" : "text-sm"}`}>
          Photo du véhicule
        </label>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageChange(f) }}
        />
        {imageUrl ? (
          <div className="relative rounded-xl overflow-hidden border border-[#c5c5d3] h-40 group">
            <img src={imageUrl} alt="Aperçu" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="px-3 py-1.5 bg-white rounded-lg text-xs font-semibold text-[#0b1c30]"
              >
                Changer
              </button>
              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="p-1.5 bg-white rounded-lg text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={imageUploading}
            className="w-full h-40 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#c5c5d3] rounded-xl text-[#757682] hover:border-[#00236f] hover:text-[#00236f] hover:bg-[#f0f4ff] transition-all disabled:opacity-50"
          >
            {imageUploading ? (
              <Loader2 className="w-7 h-7 animate-spin" />
            ) : (
              <ImagePlus className="w-7 h-7" />
            )}
            <span className="text-xs font-medium">
              {imageUploading ? "Upload en cours..." : "Cliquez pour ajouter une photo"}
            </span>
            <span className="text-[10px]">JPEG, PNG, WEBP · max 5 Mo</span>
          </button>
        )}
      </div>
    )
  }

  // Edit mode: render the original compact form
  if (vehicle) {
    return (
      <div className="space-y-4">
        <ImageUploadField compact />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Marque *</label>
            <VehicleCombobox options={brandNames} value={brand} onChange={handleBrandChange} placeholder="Marque" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Modèle *</label>
            <VehicleCombobox
              options={availableModels}
              value={model}
              onChange={setModel}
              placeholder="Modèle"
              disabled={availableModels.length === 0}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Année *</label>
            <VehicleCombobox options={CAR_YEARS} value={year} onChange={setYear} placeholder="Année" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Couleur</label>
            <VehicleCombobox options={CAR_COLORS} value={color} onChange={setColor} placeholder="Couleur" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Plaque *</label>
          <input
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value)}
            className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
            placeholder="Plaque d'immatriculation"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Statut</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "AVAILABLE" | "RENTED" | "MAINTENANCE" | "OUT_OF_SERVICE")}
            className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
          >
            <option value="AVAILABLE">Disponible</option>
            <option value="RENTED">En location</option>
            <option value="MAINTENANCE">En réparation</option>
            <option value="OUT_OF_SERVICE">Hors service</option>
          </select>
        </div>
        <div className="pt-1">
          <p className="text-xs font-semibold text-gray-700 mb-2">Tarifs (€)</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Journalier *</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={dailyRate}
                  onChange={(e) => setDailyRate(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 pr-10"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">€/j</span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Hebdo</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={weeklyRate}
                  onChange={(e) => setWeeklyRate(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 pr-12"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">€/sem</span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Mensuel</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={monthlyRate}
                  onChange={(e) => setMonthlyRate(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 pr-14"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">€/mois</span>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Caution (€)</label>
            <input
              type="number"
              step="0.01"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Kilométrage</label>
            <input
              type="number"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">VIN</label>
          <input
            value={vin}
            onChange={(e) => setVin(e.target.value)}
            className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
            placeholder="Numéro de série"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 resize-none"
          />
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-green-600 text-white py-2.5 px-4 rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
        >
          {loading ? "Enregistrement..." : "Mettre à jour"}
        </button>
      </div>
    )
  }

  // Add mode: 2-step Bolt-inspired form
  return (
    <div>
      {/* Car icon */}
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
          <Car className="w-8 h-8 text-gray-500" />
        </div>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Ajouter un véhicule</h2>

      {/* Progress bar */}
      <div className="flex gap-2 mb-6">
        <div className="h-1 flex-1 rounded-full bg-green-500" />
        <div className={`h-1 flex-1 rounded-full transition-colors ${step === 2 ? "bg-green-500" : "bg-gray-200"}`} />
      </div>

      {step === 1 && (
        <div className="space-y-4">
          {/* Brand */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">
              Nom du constructeur <span className="text-red-500">*</span>
            </label>
            <VehicleCombobox
              options={brandNames}
              value={brand}
              onChange={handleBrandChange}
              placeholder="Nom du constructeur"
            />
          </div>

          {/* Model */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">
              Modèle du véhicule
            </label>
            <VehicleCombobox
              options={availableModels}
              value={model}
              onChange={setModel}
              placeholder={availableModels.length > 0 ? "Modèle du véhicule" : "Sélectionnez d'abord un constructeur"}
              disabled={availableModels.length === 0}
            />
          </div>

          {/* Year */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">
              Année du véhicule <span className="text-red-500">*</span>
            </label>
            <VehicleCombobox
              options={CAR_YEARS}
              value={year}
              onChange={setYear}
              placeholder="Année du véhicule"
            />
          </div>

          {/* License plate */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">
              Plaque d&apos;immatriculation <span className="text-red-500">*</span>
            </label>
            <input
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value)}
              placeholder="Plaque d'immatriculation"
              className="w-full px-4 py-3 rounded-xl bg-gray-100 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">
              Couleur du véhicule <span className="text-red-500">*</span>
            </label>
            <VehicleCombobox
              options={CAR_COLORS}
              value={color}
              onChange={setColor}
              placeholder="Couleur du véhicule"
            />
          </div>

          {/* Image */}
          <ImageUploadField />

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Commentaire</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Commentaire"
              className="w-full px-4 py-3 rounded-xl bg-gray-100 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors resize-none"
            />
          </div>

          <button
            type="button"
            onClick={() => { if (validateStep1()) setStep(2) }}
            className="w-full bg-green-600 text-white py-3.5 px-4 rounded-xl font-semibold hover:bg-green-700 transition-colors text-sm"
          >
            Suivant
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 -mt-2 mb-2">
            {brand} {model} · {year}
          </p>

          {/* Daily rate */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">
              Tarif journalier <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={dailyRate}
                onChange={(e) => setDailyRate(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 rounded-xl bg-gray-100 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors pr-10"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">€/j</span>
            </div>
          </div>

          {/* Weekly rate */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Tarif hebdomadaire</label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={weeklyRate}
                onChange={(e) => setWeeklyRate(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 rounded-xl bg-gray-100 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors pr-14"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">€/sem</span>
            </div>
          </div>

          {/* Monthly rate */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Tarif mensuel</label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={monthlyRate}
                onChange={(e) => setMonthlyRate(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 rounded-xl bg-gray-100 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors pr-16"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">€/mois</span>
            </div>
          </div>

          {/* Deposit */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Caution</label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-3 rounded-xl bg-gray-100 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors pr-10"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">€</span>
            </div>
          </div>

          {/* Mileage */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Kilométrage</label>
            <div className="relative">
              <input
                type="number"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-3 rounded-xl bg-gray-100 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors pr-10"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400">km</span>
            </div>
          </div>

          {/* VIN */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">VIN</label>
            <input
              value={vin}
              onChange={(e) => setVin(e.target.value)}
              placeholder="Numéro de série"
              className="w-full px-4 py-3 rounded-xl bg-gray-100 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Statut</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "AVAILABLE" | "RENTED" | "MAINTENANCE" | "OUT_OF_SERVICE")}
              className="w-full px-4 py-3 rounded-xl bg-gray-100 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors appearance-none"
            >
              <option value="AVAILABLE">Disponible</option>
              <option value="RENTED">En location</option>
              <option value="MAINTENANCE">En réparation</option>
              <option value="OUT_OF_SERVICE">Hors service</option>
            </select>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 border border-gray-200 text-gray-700 py-3.5 px-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm"
            >
              Retour
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-green-600 text-white py-3.5 px-4 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors text-sm"
            >
              {loading ? "Enregistrement..." : "Ajouter"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
