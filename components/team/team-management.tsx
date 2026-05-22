"use client"

import { useState } from "react"
import { Shield, Trash2, User } from "lucide-react"

type UserRow = {
  id: string
  name: string | null
  email: string
  role: "ADMIN" | "USER"
  createdAt: Date
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
    <div className="max-w-3xl space-y-4">
      {error && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border divide-y">
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
                  {user.role === "ADMIN" ? (
                    <Shield className="w-3 h-3" />
                  ) : (
                    <User className="w-3 h-3" />
                  )}
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
  )
}
