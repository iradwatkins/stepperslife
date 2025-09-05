"use client";

import { useUser } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import ProductSection from "@/components/products/ProductSection";
import { redirect } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { Suspense } from "react";

function ProductsContent() {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId") as Id<"events"> | null;

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="py-12">
        <ProductSection userId={user.id} eventId={eventId || undefined} />
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-600"></div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}