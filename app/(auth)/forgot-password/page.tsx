"use client"

import { useState } from "react"
import Link from "next/link"
import { AuthCard } from "@/components/auth/auth-card"

export default function ForgotPasswordPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus("loading")
    const email = new FormData(e.currentTarget).get("email")
    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error()
      setStatus("sent")
    } catch {
      setStatus("error")
    }
  }

  return (
    <AuthCard subtitle="Mot de passe oublié">
      {status === "sent" ? (
        <div className="space-y-4 text-center">
          <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg border border-green-200">
            Si un compte existe avec cet email, vous recevrez un lien de réinitialisation dans quelques minutes.
          </div>
          <Link href="/login" className="text-blue-600 hover:underline text-sm font-medium block">
            Retour à la connexion
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {status === "error" && (
            <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">
              Une erreur est survenue. Réessayez plus tard.
            </div>
          )}

          <p className="text-sm text-gray-600">
            Saisissez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="vous@exemple.com"
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {status === "loading" ? "Envoi en cours..." : "Envoyer le lien"}
          </button>

          <p className="text-center text-sm text-gray-500">
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Retour à la connexion
            </Link>
          </p>
        </form>
      )}
    </AuthCard>
  )
}
