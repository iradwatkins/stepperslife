import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Service } from "@/lib/types/aggregated-content";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { InFeedAd } from "@/app/components/ads/InFeedAd";

interface ServicesGridProps {
  services: Service[];
}

export function ServicesGrid({ services }: ServicesGridProps) {
  if (services.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
          <p className="text-lg font-medium">No services found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters
          </p>
        </div>
      </div>
    );
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      DJ: "DJ Services",
      PHOTOGRAPHER: "Photography",
      VIDEOGRAPHER: "Videography",
      EVENT_PLANNER: "Event Planning",
      INSTRUCTOR: "Instruction",
      VENUE: "Venue",
    };
    return labels[category] || category;
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service, index) => (
        <React.Fragment key={service.id}>
          {/* Show in-feed ad after every 6 services */}
          {index > 0 && index % 6 === 0 && (
            <div className="sm:col-span-2 lg:col-span-3">
              <InFeedAd />
            </div>
          )}
          <Link
            href={`/services/${service.slug}`}
            className="group"
          >
            <article className="overflow-hidden rounded-lg border bg-card transition-all hover:shadow-xl">
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={service.coverImageUrl}
                  alt={service.businessName}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute left-3 top-3">
                  <span className="rounded-full bg-background/90 px-3 py-1 text-xs font-semibold">
                    {getCategoryLabel(service.category)}
                  </span>
                </div>
                {service.isPriority && (
                  <div className="absolute right-3 top-3">
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      Featured
                    </span>
                  </div>
                )}
              </div>

              <div className="p-5">
                <h3 className="mb-1 text-xl font-bold group-hover:text-primary">
                  {service.businessName}
                </h3>
                <p className="mb-3 text-sm text-muted-foreground">
                  {service.tagline}
                </p>

                <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                  {service.description}
                </p>

                <div className="mb-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium">{service.averageRating.toFixed(1)}</span>
                    <span className="text-muted-foreground">
                      ({service.totalReviews} reviews)
                    </span>
                  </div>
                </div>

                <div className="space-y-2 border-t pt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-muted-foreground">
                      Starting at
                    </span>
                    <span className="text-xl font-bold">
                      ${service.startingPrice.toFixed(2)}
                    </span>
                  </div>
                  <Button className="w-full" size="sm">
                    Get a Quote
                  </Button>
                </div>
              </div>
            </article>
          </Link>
        </React.Fragment>
      ))}
    </div>
  );
}
