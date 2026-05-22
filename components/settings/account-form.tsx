"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"

export function AccountForm() {
  const { data: session } = useSession()
  const [name, setName] = useState(session?.user?.name ?? "")
  const [email, setEmail] = useState(session?.user?.email ?? "")

  const [profileStatus, setProfileStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [profileError, setProfileError] = useState("")
  const [passwordStatus, setPasswordStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [passwordError, setPasswordError] = useState("")

  async function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setProfileStatus("loading")
    setProfileError("")
    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    })
    if (!res.ok) {
      const data = await res.json()
      setProfileError(data.error ?? "Erreur serveur")
      setProfileStatus("error")
    } else {
      setProfileStatus("success")
      setTimeout(() => setProfileStatus("idle"), 3000)
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPasswordStatus("loading")
    setPasswordError("")
    const data = new FormData(e.currentTarget)
    const currentPassword = data.get("currentPassword") as string
    const newPassword = data.get("newPassword") as string
    const confirmPassword = data.get("confirmPassword") as string

    if (newPassword !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas")
      setPasswordStatus("error")
      return
    }

    const res = await fetch("/api/account/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    if (!res.ok) {
      const json = await res.json()
      setPasswordError(json.error ?? "Erreur serveur")
      setPasswordStatus("error")
    } else {
      setPasswordStatus("success")
      ;(e.target as HTMLFormElement).reset()
      setTimeout(() => setPasswordStatus("idle"), 3000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Profil */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Informations du profil</h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          {profileStatus === "success" && (
            <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg border border-green-200">
              Profil mis à jour avec succès.
            </div>
          )}
          {profileStatus === "error" && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">
              {profileError}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Votre nom"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="vous@exemple.com"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={profileStatus === "loading"}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {profileStatus === "loading" ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>

      {/* Sécurité */}
      <div className="bg-white rounded-xl border p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Sécurité</h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {passwordStatus === "success" && (
            <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg border border-green-200">
              Mot de passe modifié avec succès.
            </div>
          )}
          {passwordStatus === "error" && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">
              {passwordError}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
            <input
              name="currentPassword"
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
              <input
                name="newPassword"
                type="password"
                required
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
              <input
                name="confirmPassword"
                type="password"
                required
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={passwordStatus === "loading"}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {passwordStatus === "loading" ? "Modification..." : "Modifier le mot de passe"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
