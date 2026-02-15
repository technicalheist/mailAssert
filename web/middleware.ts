import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard') || req.nextUrl.pathname.startsWith('/inbox')
    const isAuthPage = req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/register')

    if (isOnDashboard) {
        if (isLoggedIn) return
        return NextResponse.redirect(new URL('/login', req.nextUrl.origin))
    }

    if (isAuthPage) {
        if (isLoggedIn) {
            return NextResponse.redirect(new URL('/dashboard', req.nextUrl.origin))
        }
        return
    }
})

export const config = {
    // Match dashboard routes AND auth routes so middleware runs on them
    matcher: ["/dashboard/:path*", "/inbox/:path*", "/login", "/register"],
}
