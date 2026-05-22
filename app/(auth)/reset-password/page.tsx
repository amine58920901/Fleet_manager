"use client"

import { Suspense, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { AuthCard } from "@/components/auth/auth-card"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus("loading")
    setErrorMsg("")

    const data = new FormData(e.currentTarget)
    const password = data.get("password") as string
    const confirm = data.get("confirm") as string

    if (password !== confirm) {
      setErrorMsg("Les mots de passe ne correspondent pas")
      setStatus("error")
      return
    }

    const res = await fetch("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    })
    const json = await res.json()

    if (!res.ok) {
      setErrorMsg(json.error ?? "Erreur serveur")
      setStatus("error")
    } else {
      setStatus("success")
      setTimeout(() => router.push("/login"), 2500)
    }
  }

  if (!token) {
    return (
      <div className="text-center space-y-3">
        <p className="text-red-600 font-medium">Lien invalide.</p>
        <Link href="/forgot-password" className="text-blue-600 hover:underline text-sm block">
          Demander un nouveau lien
        </Link>
      </div>
    )
  }

  if (status === "success") {
    return (
      <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-lg border border-green-200 text-center">
        Mot de passe mis à jour ! Redirection vers la connexion…
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {status === "error" && (
        <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">
          {errorMsg}
        </div>
      )}

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Nouveau mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="••••••••"
        />
      </div>

      <div>
        <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">
          Confirmer le mot de passe
        </label>
        <input
          id="confirm"
          name="confirm"
          type="password"
          required
          minLength={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {status === "loading" ? "Mise à jour..." : "Réinitialiser le mot de passe"}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <AuthCard subtitle="Nouveau mot de passe">
      <Suspense fallback={<p className="text-center text-sm text-gray-500">Chargement…</p>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthCard>
  )
}
