import NextAuth from "next-auth";
import authConfig from "./auth.config";

export const { 
  handlers, 
  auth, 
  signIn, 
  signOut 
} = NextAuth({
  ...authConfig,
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});