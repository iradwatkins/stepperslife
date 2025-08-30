import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SellerNavigation from "@/components/SellerNavigation";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SellerNavigation />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}