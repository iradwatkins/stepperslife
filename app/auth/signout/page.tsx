"use client";

import { signOut } from "next-auth/react";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function SignOutPage() {
  useEffect(() => {
    signOut({ callbackUrl: "/" });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
      <div className="bg-white rounded-lg shadow-xl p-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
        <h1 className="text-xl font-semibold">Signing out...</h1>
        <p className="text-gray-600 mt-2">Please wait while we sign you out.</p>
      </div>
    </div>
  );
}