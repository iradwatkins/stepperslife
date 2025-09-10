import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Email from "next-auth/providers/email";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getAuthCredentials } from "@/lib/vault";
import nodemailer from "nodemailer";

/**
 * Unified Auth Configuration
 * Supports both Vault and environment variables
 * Works in all environments: development, staging, production
 */
export default async function getAuthConfig(): Promise<NextAuthConfig> {
  let authSecrets = {
    nextAuthSecret: process.env.NEXTAUTH_SECRET || "",
    googleClientId: process.env.GOOGLE_CLIENT_ID || "",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    githubClientId: process.env.GITHUB_CLIENT_ID || "",
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET || "",
  };

  // Try to get credentials from Vault if available
  try {
    if (process.env.VAULT_ADDR && process.env.VAULT_TOKEN) {
      const vaultSecrets = await getAuthCredentials();
      authSecrets = {
        ...authSecrets,
        ...Object.fromEntries(
          Object.entries(vaultSecrets).filter(([_, v]) => v)
        ),
      };
    }
  } catch (error) {
    console.warn("Vault not available, using environment variables");
  }

  // Email transporter configuration
  const emailConfig = process.env.EMAIL_SERVER || process.env.SMTP_HOST
    ? {
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        auth: {
          user: process.env.SMTP_USER || process.env.EMAIL_FROM,
          pass: process.env.SMTP_PASSWORD,
        },
        secure: process.env.SMTP_PORT === "465",
      }
    : undefined;

  const transporter = emailConfig
    ? nodemailer.createTransport(emailConfig)
    : undefined;

  const providers = [
    // Credentials provider (username/password)
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ];

  // Add Google provider if configured
  if (authSecrets.googleClientId && authSecrets.googleClientSecret) {
    providers.push(
      Google({
        clientId: authSecrets.googleClientId,
        clientSecret: authSecrets.googleClientSecret,
      })
    );
  }

  // Add GitHub provider if configured
  if (authSecrets.githubClientId && authSecrets.githubClientSecret) {
    providers.push(
      GitHub({
        clientId: authSecrets.githubClientId,
        clientSecret: authSecrets.githubClientSecret,
      })
    );
  }

  // Add Email provider if email is configured
  if (transporter && process.env.EMAIL_FROM) {
    providers.push(
      Email({
        server: emailConfig,
        from: process.env.EMAIL_FROM,
        async sendVerificationRequest({ identifier: email, url }) {
          await transporter.sendMail({
            to: email,
            from: process.env.EMAIL_FROM,
            subject: "Sign in to SteppersLife",
            html: `
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2>Sign in to SteppersLife</h2>
                <p>Click the link below to sign in to your account:</p>
                <a href="${url}" style="display: inline-block; padding: 10px 20px; background: #6366f1; color: white; text-decoration: none; border-radius: 5px;">
                  Sign In
                </a>
                <p>If you didn't request this email, you can safely ignore it.</p>
                <p>The link will expire in 24 hours.</p>
              </div>
            `,
          });
        },
      })
    );
  }

  return {
    providers,
    pages: {
      signIn: "/auth/signin",
      signOut: "/auth/signout",
      error: "/auth/error",
      verifyRequest: "/auth/verify-request",
      newUser: "/welcome",
    },
    callbacks: {
      async jwt({ token, user, account }) {
        if (user) {
          token.id = user.id;
        }
        if (account) {
          token.provider = account.provider;
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          session.user.id = token.id as string;
          (session.user as any).provider = token.provider;
        }
        return session;
      },
    },
    secret: authSecrets.nextAuthSecret,
    session: {
      strategy: "jwt",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    trustHost: true,
  };
}