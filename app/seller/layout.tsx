import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SellerNavigation from "@/components/SellerNavigation";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/signin");
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