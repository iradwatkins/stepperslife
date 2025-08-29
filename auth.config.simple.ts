import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

// Simple auth config for local development
const authConfig: NextAuthConfig = {
  providers: [
    // Simple Credentials for local development
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const password = credentials?.password as string;

        if (!email || !password) return null;

        // First try Convex database
        try {
          const { ConvexHttpClient } = await import("convex/browser");
          const { api } = await import("@/convex/_generated/api");
          const bcrypt = await import("bcryptjs");
          
          const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
          const user = await convex.query(api.users.getUserByEmail, { email });
          
          if (user && user.passwordHash) {
            const isValid = await bcrypt.compare(password, user.passwordHash);
            if (isValid) {
              return {
                id: user.userId || user.email,
                email: user.email,
                name: user.name,
                role: "user",
              };
            }
          }
        } catch (error) {
          console.error("Error checking Convex for user:", error);
        }

        // Fallback to demo accounts for development
        const demoAccounts = [
          { email: "admin@stepperslife.com", password: "Admin123!", name: "Admin User", role: "admin" },
          { email: "test@stepperslife.com", password: "Test123!", name: "Test User", role: "user" },
          { email: "demo@stepperslife.com", password: "Demo123!", name: "Demo User", role: "user" },
          { email: "test@example.com", password: "test123", name: "Legacy Test User", role: "user" },
          { email: "irawatkins@gmail.com", password: "demo123", name: "Ira Watkins", role: "admin" }
        ];

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