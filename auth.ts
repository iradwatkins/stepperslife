import NextAuth from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import authConfig from "./auth.config.simple";

export const { 
  handlers, 
  auth, 
  signIn, 
  signOut 
} = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || 'YC4H/yZ0wC+1O9M7fQZeNauGk=',
});