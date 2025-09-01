import AffiliateDashboard from '@/components/AffiliateDashboard';

export default function AffiliatesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Affiliate Program</h1>
        <p className="text-gray-600 mt-2">
          Earn commission by promoting events and selling tickets
        </p>
      </div>
      <AffiliateDashboard />
    </div>
  );
}