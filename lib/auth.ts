import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import GoogleProvider from "next-auth/providers/google"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  // Trust the configured host
  trustHost: true,

  // 🔥 SSO MAGIC - Cookie domain sharing
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        domain: '.stepperslife.com', // ← KEY: Enables SSO across all subdomains
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true,
      },
    },
  },

  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: '/sign-in',
    signOut: '/sign-out',
    error: '/auth/error',
  },

  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        // @ts-expect-error - Adding custom role field
        session.user.role = user.role || 'USER'
      }
      return session
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
})
