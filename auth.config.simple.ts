import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Email from "next-auth/providers/email";

// Simple auth config for local development
const authConfig: NextAuthConfig = {
  providers: [
    // Mock Email provider for development
    Email({
      server: {
        host: "localhost",
        port: 1025,
        auth: null,
      },
      from: "dev@stepperslife.local",
    }),
    
    // Simple Credentials for local development
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // For local development, allow demo accounts
        const demoAccounts = [
          { email: "admin@stepperslife.com", password: "admin123", name: "Admin User", role: "admin" },
          { email: "test@example.com", password: "test123", name: "Test User", role: "user" },
          { email: "irawatkins@gmail.com", password: "demo123", name: "Ira Watkins", role: "admin" }
        ];

        const email = credentials?.email as string;
        const password = credentials?.password as string;

        const demoUser = demoAccounts.find(acc => acc.email === email && acc.password === password);
        
        if (demoUser) {
          return {
            id: demoUser.email,
            email: demoUser.email,
            name: demoUser.name,
            role: demoUser.role,
          };
        }

        return null;
      }
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
    verifyRequest: "/auth/verify-request",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        (session.user as any).role = token.role;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Always allow redirects to the same origin
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  trustHost: true,
  // Skip CSRF check for development
  experimental: {
    enableWebAuthn: false,
  },
};

export default authConfig;