import { restaurantsAPI } from "@/lib/api";
import { RestaurantsGrid } from "./RestaurantsGrid";
import { RestaurantsFilters } from "./RestaurantsFilters";
import { LeaderboardAd } from "@/app/components/ads/LeaderboardAd";
import { MobileBannerAd } from "@/app/components/ads/MobileBannerAd";
import { SidebarAd } from "@/app/components/ads/SidebarAd";
import { FooterBannerAd } from "@/app/components/ads/FooterBannerAd";

interface PageProps {
  searchParams: Promise<{
    cuisine?: string;
    openNow?: string;
    search?: string;
  }>;
}

export default async function RestaurantsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Fetch restaurants from subdomain API
  const { restaurants, pagination } = await restaurantsAPI.getRestaurants({
    cuisine: params.cuisine,
    acceptingOrders: params.openNow === "true",
    limit: 50,
  });

  // Filter by search query if provided
  const filteredRestaurants = params.search
    ? restaurants.filter(
        (restaurant) =>
          restaurant.name.toLowerCase().includes(params.search!.toLowerCase()) ||
          restaurant.description.toLowerCase().includes(params.search!.toLowerCase()) ||
          restaurant.cuisine.join(" ").toLowerCase().includes(params.search!.toLowerCase())
      )
    : restaurants;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b bg-muted/30 py-16">
        <div className="container px-4">
          <h1 className="mb-4 text-4xl font-bold">Steppers Restaurants</h1>
          <p className="text-xl text-muted-foreground">
            Dine at Chicago&apos;s best restaurants in the Steppin community
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
            <RestaurantsFilters />
            <div className="mt-8">
              <p className="mb-6 text-sm text-muted-foreground">
                Showing {filteredRestaurants.length} of {pagination.total} restaurants
              </p>
              <RestaurantsGrid restaurants={filteredRestaurants} />
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
