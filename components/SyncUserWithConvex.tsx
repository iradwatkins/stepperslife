"use client";

import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useEffect } from "react";

export default function SyncUserWithConvex() {
  const { user, isSignedIn } = useUser();
  const updateUser = useMutation(api.users.updateUser);

  useEffect(() => {
    if (!isSignedIn || !user) return;

    const syncUser = async () => {
      try {
        await updateUser({
          userId: user.id,
          name: user.fullName || user.firstName || user.emailAddresses[0]?.emailAddress?.split("@")[0] || "User",
          email: user.emailAddresses[0]?.emailAddress || "",
        });
      } catch (error) {
        console.error("Error syncing user:", error);
      }
    };

    syncUser();
  }, [user, isSignedIn, updateUser]);

  return null;
}