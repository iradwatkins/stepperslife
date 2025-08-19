"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = () => {
    switch (error) {
      case "Configuration":
        return "There is a problem with the server configuration.";
      case "AccessDenied":
        return "Access denied. You do not have permission to sign in.";
      case "Verification":
        return "The verification token has expired or has already been used.";
      case "OAuthSignin":
        return "Error occurred while signing in with OAuth provider.";
      case "OAuthCallback":
        return "Error occurred while handling OAuth callback.";
      case "OAuthCreateAccount":
        return "Could not create account with OAuth provider.";
      case "EmailCreateAccount":
        return "Could not create account with email provider.";
      case "Callback":
        return "Error occurred in the OAuth callback handler.";
      case "OAuthAccountNotLinked":
        return "This email is already associated with another account.";
      case "EmailSignin":
        return "Check your email for the sign in link.";
      case "CredentialsSignin":
        return "Sign in failed. Check the details you provided are correct.";
      default:
        return "An unexpected error occurred. Please try again.";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600 p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 p-3 rounded-full">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-2">Authentication Error</h1>
        <p className="text-gray-600 mb-6">{getErrorMessage()}</p>

        <div className="space-y-3">
          <Link href="/auth/signin" className="block">
            <Button className="w-full">
              Try Again
            </Button>
          </Link>
          
          <Link href="/" className="block">
            <Button variant="outline" className="w-full">
              Go Home
            </Button>
          </Link>
        </div>

        {error && (
          <p className="text-xs text-gray-400 mt-6">
            Error code: {error}
          </p>
        )}
      </div>
    </div>
  );
}