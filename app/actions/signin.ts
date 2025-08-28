"use server";

import { signIn as authSignIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export async function signInWithCredentials(
  email: string,
  password: string,
  callbackUrl?: string
) {
  try {
    console.log("SignIn attempt:", { email, callbackUrl });
    
    // Use redirect: true to let NextAuth handle the redirect and cookie setting
    const result = await authSignIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl || "/dashboard",
    });
    
    // This shouldn't be reached if redirect is successful
    return { success: true };
    
  } catch (error) {
    console.error("SignIn error:", error);
    
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials" };
        default:
          return { error: "Something went wrong" };
      }
    }
    
    // Check if it's a NEXT_REDIRECT error (this is expected for successful redirects)
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error; // Re-throw redirect errors (this is the normal flow)
    }
    
    return { error: "An unexpected error occurred" };
  }
}