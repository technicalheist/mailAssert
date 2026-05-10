import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    providers: [],
    callbacks: {
        async redirect({ url, baseUrl }) {
            // After login, redirect to dashboard
            // If url is the base URL or login page, redirect to dashboard
            if (url === baseUrl || url === `${baseUrl}/login` || url === `${baseUrl}/`) {
                return `${baseUrl}/dashboard`
            }
            // Otherwise, if it's a relative URL, allow it
            if (url.startsWith('/')) {
                return `${baseUrl}${url}`
            }
            // If it's an absolute URL on the same origin, allow it
            if (url.startsWith(baseUrl)) {
                return url
            }
            // Otherwise, redirect to dashboard
            return `${baseUrl}/dashboard`
        },
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub
            }
            return session
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id
            }
            return token
        }
    },
    session: {
        strategy: "jwt"
    },
    pages: {
        signIn: "/login",
    },
} satisfies NextAuthConfig
