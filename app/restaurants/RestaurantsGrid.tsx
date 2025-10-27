import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Restaurant } from "@/lib/types/aggregated-content";
import { Button } from "@/components/ui/button";
import { Star, Clock } from "lucide-react";
import { InFeedAd } from "@/app/components/ads/InFeedAd";

interface RestaurantsGridProps {
  restaurants: Restaurant[];
}

export function RestaurantsGrid({ restaurants }: RestaurantsGridProps) {
  if (restaurants.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
          <p className="text-lg font-medium">No restaurants found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {restaurants.map((restaurant, index) => (
        <React.Fragment key={restaurant.id}>
          {/* Show in-feed ad after every 6 restaurants */}
          {index > 0 && index % 6 === 0 && (
            <div className="sm:col-span-2 lg:col-span-3">
              <InFeedAd />
            </div>
          )}
          <Link
            href={`/restaurants/${restaurant.slug}`}
            className="group"
          >
            <article className="overflow-hidden rounded-lg border bg-card transition-all hover:shadow-xl">
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={restaurant.coverImageUrl}
                  alt={restaurant.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {!restaurant.acceptingOrders && (
                  <div className="absolute right-3 top-3">
                    <span className="rounded-full bg-destructive px-3 py-1 text-xs font-semibold text-destructive-foreground">
                      Not Accepting Orders
                    </span>
                  </div>
                )}
              </div>

              <div className="p-5">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold group-hover:text-primary">
                      {restaurant.name}
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      {restaurant.cuisine.join(", ")}
                    </span>
                  </div>
                </div>

                <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                  {restaurant.description}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium">{restaurant.averageRating.toFixed(1)}</span>
                    <span className="text-muted-foreground">
                      ({restaurant.totalReviews} reviews)
                    </span>
                  </div>

                  {restaurant.acceptingOrders && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Pickup in {restaurant.estimatedPickupTime} min</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <Button className="flex-1" size="sm">
                    View Menu
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    size="sm"
                    disabled={!restaurant.acceptingOrders}
                  >
                    Order Now
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
