import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

const publicRoutes = ["/login", "/register"]

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
