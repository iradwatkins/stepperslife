import { servicesAPI } from "@/lib/api";
import { ServicesGrid } from "./ServicesGrid";
import { ServicesFilters } from "./ServicesFilters";
import { LeaderboardAd } from "@/app/components/ads/LeaderboardAd";
import { MobileBannerAd } from "@/app/components/ads/MobileBannerAd";
import { SidebarAd } from "@/app/components/ads/SidebarAd";
import { FooterBannerAd } from "@/app/components/ads/FooterBannerAd";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
  }>;
}

export default async function ServicesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Fetch services from subdomain API
  const { providers, pagination } = await servicesAPI.getServices({
    category: params.category as
      | "DJ"
      | "PHOTOGRAPHER"
      | "VIDEOGRAPHER"
      | "EVENT_PLANNER"
      | "INSTRUCTOR"
      | "VENUE"
      | undefined,
    limit: 50,
  });

  // Filter by search query if provided
  const filteredServices = params.search
    ? providers.filter(
        (service) =>
          service.businessName.toLowerCase().includes(params.search!.toLowerCase()) ||
          service.description.toLowerCase().includes(params.search!.toLowerCase()) ||
          service.tagline.toLowerCase().includes(params.search!.toLowerCase())
      )
    : providers;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b bg-muted/30 py-16">
        <div className="container px-4">
          <h1 className="mb-4 text-4xl font-bold">Steppers Services</h1>
          <p className="text-xl text-muted-foreground">
            Professional services for the Chicago Steppin community
          </p>
        </div>
      </section>

      {/* Ad: Top Leaderboard (Desktop) / Mobile Banner */}
      <LeaderboardAd />
      <MobileBannerAd />

      {/* Filters & Content */}
      <section className="container px-4 py-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            <ServicesFilters />
            <div className="mt-8">
              <p className="mb-6 text-sm text-muted-foreground">
                Showing {filteredServices.length} of {pagination.total} services
              </p>
              <ServicesGrid services={filteredServices} />
            </div>
          </div>

          {/* Sidebar with Sticky Ad (Desktop only) */}
          <aside className="hidden lg:block lg:w-[300px]">
            <SidebarAd />
          </aside>
        </div>
      </section>

      {/* Ad: Footer Banner */}
      <FooterBannerAd />
    </div>
  );
}
