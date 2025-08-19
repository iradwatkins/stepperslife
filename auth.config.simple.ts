import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Email from "next-auth/providers/email";
import Credentials from "next-auth/providers/credentials";

// Use environment variables with Vault fallback handled at runtime
const authConfig: NextAuthConfig = {
  providers: [
    // Primary: Magic Link Email
    Email({
      server: {
        host: process.env.EMAIL_SERVER_HOST || "smtp.gmail.com",
        port: Number(process.env.EMAIL_SERVER_PORT || 587),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM || "noreply@stepperslife.com",
      maxAge: 24 * 60 * 60, // 24 hours
    }),
    // Secondary: Google OAuth
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Secondary: Classic Credentials
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // TODO: Add proper validation with Convex
        if (credentials?.email && credentials?.password) {
          return {
            id: "1",
            email: credentials.email as string,
            name: credentials.email as string,
          };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request", // Magic link sent page
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  trustHost: true,
};

export default authConfig;