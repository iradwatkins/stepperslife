import SellerNavigation from "@/components/SellerNavigation";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <SellerNavigation />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}