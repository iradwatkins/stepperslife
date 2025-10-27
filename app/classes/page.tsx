import { classesAPI } from "@/lib/api";
import { ClassesGrid } from "./ClassesGrid";
import { ClassesFilters } from "./ClassesFilters";
import { LeaderboardAd } from "@/app/components/ads/LeaderboardAd";
import { MobileBannerAd } from "@/app/components/ads/MobileBannerAd";
import { SidebarAd } from "@/app/components/ads/SidebarAd";
import { FooterBannerAd } from "@/app/components/ads/FooterBannerAd";

interface PageProps {
  searchParams: Promise<{
    level?: string;
    search?: string;
  }>;
}

export default async function ClassesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Fetch classes from subdomain API
  const { courses, pagination } = await classesAPI.getCourses({
    level: params.level as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | undefined,
    limit: 50,
  });

  // Filter by search query if provided
  const filteredCourses = params.search
    ? courses.filter(
        (course) =>
          course.title.toLowerCase().includes(params.search!.toLowerCase()) ||
          course.shortDescription.toLowerCase().includes(params.search!.toLowerCase()) ||
          course.instructorName.toLowerCase().includes(params.search!.toLowerCase())
      )
    : courses;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b bg-muted/30 py-16">
        <div className="container px-4">
          <h1 className="mb-4 text-4xl font-bold">Chicago Steppin Classes</h1>
          <p className="text-xl text-muted-foreground">
            Learn to step with the best instructors in Chicago
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
            <ClassesFilters />
            <div className="mt-8">
              <p className="mb-6 text-sm text-muted-foreground">
                Showing {filteredCourses.length} of {pagination.total} classes
              </p>
              <ClassesGrid courses={filteredCourses} />
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
