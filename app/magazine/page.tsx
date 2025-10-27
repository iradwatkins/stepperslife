import { magazineAPI } from "@/lib/api";
import { ArticlesGrid } from "./ArticlesGrid";
import { MagazineFilters } from "./MagazineFilters";
import { LeaderboardAd } from "@/app/components/ads/LeaderboardAd";
import { MobileBannerAd } from "@/app/components/ads/MobileBannerAd";
import { SidebarAd } from "@/app/components/ads/SidebarAd";
import { FooterBannerAd } from "@/app/components/ads/FooterBannerAd";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    featured?: string;
    search?: string;
  }>;
}

export default async function MagazinePage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Fetch articles from subdomain API
  const { articles, pagination } = await magazineAPI.getArticles({
    category: params.category,
    featured: params.featured === "true",
    limit: 50,
  });

  // Filter by search query if provided (client-side for mock data)
  const filteredArticles = params.search
    ? articles.filter(
        (article) =>
          article.title.toLowerCase().includes(params.search!.toLowerCase()) ||
          article.excerpt.toLowerCase().includes(params.search!.toLowerCase())
      )
    : articles;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b bg-muted/30 py-16">
        <div className="container px-4">
          <h1 className="mb-4 text-4xl font-bold">The Steppers Magazine</h1>
          <p className="text-xl text-muted-foreground">
            Stories, culture, and news from the Chicago Steppin community
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
            <MagazineFilters />
            <div className="mt-8">
              <p className="mb-6 text-sm text-muted-foreground">
                Showing {filteredArticles.length} of {pagination.total} articles
              </p>
              <ArticlesGrid articles={filteredArticles} />
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
