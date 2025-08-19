"use client";

import { api } from "@/convex/_generated/api";
import { useSession } from "next-auth/react";
import { useMutation } from "convex/react";
import { useEffect } from "react";

export default function SyncUserWithConvex() {
  const { data: session, status } = useSession();
  const updateUser = useMutation(api.users.updateUser);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;

    const syncUser = async () => {
      try {
        await updateUser({
          userId: session.user.id || session.user.email || "",
          name: session.user.name || session.user.email?.split("@")[0] || "User",
          email: session.user.email || "",
        });
      } catch (error) {
        console.error("Error syncing user:", error);
      }
    };

    syncUser();
  }, [session, status, updateUser]);

  return null;
}
