import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
    trustHost: true,
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const allowedEmails = process.env.ALLOWED_EMAILS
        ?.split(',')
        .map((e) => e.trim()) ?? []

      if (!user.email || !allowedEmails.includes(user.email)) {
        return '/unauthorized'
      }
      return true
    },

    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id

        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        })
        session.user.role = dbUser?.role ?? 'COLLABORATOR'
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/unauthorized',
  },
})
