"use client";

import { useUser, RedirectToSignIn } from "@clerk/nextjs";
import { useUserRole } from "@/hooks/useUserRole";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AffiliateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn, isLoaded } = useUser();
  const { isAffiliate } = useUserRole();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn && !isAffiliate) {
      router.push("/profile");
    }
  }, [isLoaded, isSignedIn, isAffiliate, router]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  if (!isAffiliate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Not an Affiliate</h1>
          <p className="text-gray-600 dark:text-gray-400">
            You need to be invited to an affiliate program to access this section.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}