import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

const publicRoutes = ["/login", "/register", "/forgot-password", "/reset-password"]

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isPublic = publicRoutes.some((route) => pathname.startsWith(route))

  if (!req.auth && !isPublic) {
    const loginUrl = new URL("/login", req.url)
    return NextResponse.redirect(loginUrl)
  }

  if (req.auth && isPublic) {
    const dashboardUrl = new URL("/", req.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
