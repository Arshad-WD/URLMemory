import NextAuth from "next-auth"
import authConfig from "./auth.base"

const { auth } = NextAuth(authConfig)

export default auth

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
