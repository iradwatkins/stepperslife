"use server";

import { signIn as authSignIn } from "@/auth";
import { AuthError } from "next-auth";

export async function signInWithCredentials(
  email: string,
  password: string,
  callbackUrl?: string
) {
  try {
    await authSignIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl || "/dashboard",
    });
    
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials" };
        default:
          return { error: "Something went wrong" };
      }
    }
    throw error;
  }
}