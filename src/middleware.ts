import NextAuth from "next-auth"
import { NextResponse } from "next/server"
import authConfig from "./auth.base"

const { auth } = NextAuth(authConfig)

// Pages that authenticated users should be redirected away from
const publicOnlyPaths = ["/", "/auth/login", "/auth/signup", "/auth/register"]

export default auth((req) => {
    const { pathname } = req.nextUrl
    const isLoggedIn = !!req.auth

    // If user is logged in and visiting a public-only page, redirect to dashboard
    if (isLoggedIn && publicOnlyPaths.includes(pathname)) {
        return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin))
    }

    return NextResponse.next()
})

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public (public folder)
         */
        "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
    ],
}

