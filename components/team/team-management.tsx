"use client"

import { useState } from "react"
import { Shield, Trash2, User, UserPlus, X } from "lucide-react"

type UserRow = {
  id: string
  name: string | null
  email: string
  role: "ADMIN" | "USER"
  createdAt: Date
}

type AddForm = {
  firstName: string
  lastName: string
  email: string
  password: string
  role: "ADMIN" | "USER"
}

const EMPTY_FORM: AddForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  role: "USER",
}

export function TeamManagement({
  users: initial,
  currentUserId,
}: {
  users: UserRow[]
  currentUserId: string
}) {
  const [users, setUsers] = useState(initial)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState("")

  // Add member modal
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<AddForm>(EMPTY_FORM)
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState("")

  function openModal() {
    setForm(EMPTY_FORM)
    setAddError("")
    setShowModal(true)
  }

  function field(key: keyof AddForm) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }))
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setAddLoading(true)
    setAddError("")

    const res = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    setAddLoading(false)

    if (!res.ok) {
      const data = await res.json()
      setAddError(data.error ?? "Erreur serveur")
      return
    }

    const created: UserRow = await res.json()
    setUsers((prev) => [...prev, created])
    setShowModal(false)
  }

  async function toggleRole(user: UserRow) {
    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN"
    const label = user.name ?? user.email
    const msg =
      newRole === "ADMIN"
        ? `Promouvoir ${label} en administrateur ?`
        : `Rétrograder ${label} en utilisateur ?`
    if (!confirm(msg)) return

    setLoading(user.id)
    setError("")
    const res = await fetch(`/api/team/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    })
    setLoading(null)

    if (res.ok) {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u)))
    } else {
      const data = await res.json()
      setError(data.error ?? "Erreur serveur")
    }
  }

  async function removeUser(user: UserRow) {
    const label = user.name ?? user.email
    if (!confirm(`Supprimer le compte de ${label} ? Cette action est irréversible.`)) return

    setLoading(user.id)
    setError("")
    const res = await fetch(`/api/team/${user.id}`, { method: "DELETE" })
    setLoading(null)

    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== user.id))
    } else {
      const data = await res.json()
      setError(data.error ?? "Erreur serveur")
    }
  }

  return (
    <>
      <div className="max-w-3xl space-y-4">
        {/* Header actions */}
        <div className="flex justify-end">
          <button
            onClick={openModal}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Ajouter un membre
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {/* User list */}
        <div className="bg-white rounded-xl border divide-y">
          {users.length === 0 && (
            <p className="text-center py-10 text-sm text-gray-400">Aucun membre dans l&apos;organisation.</p>
          )}
          {users.map((user) => {
            const isSelf = user.id === currentUserId
            const isProcessing = loading === user.id
            const initials = (user.name ?? user.email)[0].toUpperCase()

            return (
              <div key={user.id} className="flex items-center justify-between gap-4 px-5 py-4">
                {/* Identité */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <span className="text-sm font-semibold text-blue-700">{initials}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.name ?? "—"}
                      {isSelf && <span className="ml-2 text-xs text-gray-400 font-normal">(vous)</span>}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>

                {/* Rôle + actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      user.role === "ADMIN"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {user.role === "ADMIN" ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                    {user.role === "ADMIN" ? "Admin" : "Utilisateur"}
                  </span>

                  {!isSelf && (
                    <>
                      <button
                        onClick={() => toggleRole(user)}
                        disabled={isProcessing}
                        className="text-xs px-3 py-1.5 border rounded-lg text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 whitespace-nowrap"
                      >
                        {user.role === "ADMIN" ? "Rétrograder" : "Promouvoir admin"}
                      </button>
                      <button
                        onClick={() => removeUser(user)}
                        disabled={isProcessing}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <p className="text-xs text-gray-400">
          {users.length} membre{users.length !== 1 ? "s" : ""} dans votre organisation.
        </p>
      </div>

      {/* Modal ajout */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header modale */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-semibold text-gray-900">Ajouter un membre</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              {addError && (
                <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">
                  {addError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                  <input
                    type="text"
                    required
                    value={form.firstName}
                    onChange={field("firstName")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Jean"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    required
                    value={form.lastName}
                    onChange={field("lastName")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Dupont"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={field("email")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="jean.dupont@exemple.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={field("password")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                <select
                  value={form.role}
                  onChange={field("role")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="USER">Utilisateur</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {addLoading ? "Création..." : "Créer le compte"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
