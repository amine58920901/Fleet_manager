import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { Toaster } from "sonner"
import { Providers } from "./providers"
import "./globals.css"

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "FleetManager",
  description: "Gestion de flotte automobile",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full">
        <Providers>{children}</Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
