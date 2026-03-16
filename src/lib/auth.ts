import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { authConfig } from '../auth.config'

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
    trustHost: true,
    adapter: PrismaAdapter(prisma),
    session: { strategy: 'jwt' },
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
          async jwt({ token, user }) {
                  if (user) {
                            token.sub = user.id
                  }
                  return token
          },
          async session({ session, token }) {
                  if (session.user && token.sub) {
                            session.user.id = token.sub
                            const dbUser = await prisma.user.findUnique({
                                        where: { id: token.sub },
                                        select: { role: true },
                            })
                            session.user.role = dbUser?.role ?? 'COLLABORATOR'
                  }
                  return session
          },
    },
})
