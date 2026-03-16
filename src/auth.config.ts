import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/unauthorized',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isPublic =
        nextUrl.pathname.startsWith('/login') ||
        nextUrl.pathname.startsWith('/unauthorized') ||
        nextUrl.pathname.startsWith('/api/') // API routes handle their own auth
      if (isPublic) return true
      if (!isLoggedIn) {
        return Response.redirect(new URL('/login', nextUrl))
      }
      return true
    },
  },
} satisfies NextAuthConfig
