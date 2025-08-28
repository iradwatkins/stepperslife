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
    
    // Try to sign in without redirect first
    const result = await authSignIn("credentials", {
      email,
      password,
      redirect: false,
    });
    
    // If successful, manually redirect
    const redirectTo = callbackUrl || "/dashboard";
    redirect(redirectTo);
    
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
    
    // Check if it's a NEXT_REDIRECT error
    if ((error as any)?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error; // Re-throw redirect errors
    }
    
    return { error: "An unexpected error occurred" };
  }
}