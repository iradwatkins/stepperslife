import NextAuth from "next-auth";
import authConfig from "./auth.config.simple";

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
  secret: process.env.NEXTAUTH_SECRET || 'YC4H/yZ0wC+rvmZni8BSexg4sYXQSiZMmwc6AdsC0rg=',
});