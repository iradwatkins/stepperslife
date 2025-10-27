import Image from "next/image";
import Link from "next/link";
import { mockRestaurants } from "@/lib/mock-data/restaurants";
import { Button } from "@/components/ui/button";
import { Clock, Star, UtensilsCrossed } from "lucide-react";

export function RestaurantsShowcase() {
  const restaurants = mockRestaurants.slice(0, 5);

  return (
    <section className="bg-muted/30 py-16">
      <div className="container px-4">
        <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-[250px]">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Order from Local Restaurants
            </h2>
            <p className="mt-2 text-muted-foreground">
              Support Chicago&apos;s best restaurants - pickup available now
            </p>
          </div>
          <Button asChild variant="outline" className="flex-shrink-0">
            <Link href="/restaurants">View All Restaurants</Link>
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {restaurants.map((restaurant) => (
            <Link
              key={restaurant.id}
              href={`/restaurants/${restaurant.slug}`}
              className="group"
            >
              <article className="overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={restaurant.coverImageUrl}
                    alt={restaurant.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {!restaurant.acceptingOrders && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <span className="rounded-full bg-background px-3 py-1 text-sm font-semibold">
                        Currently Closed
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="mb-2 text-lg font-bold group-hover:text-primary">
                    {restaurant.name}
                  </h3>

                  <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
                    {restaurant.description}
                  </p>

                  <div className="mb-3 flex flex-wrap gap-1">
                    {restaurant.cuisine.slice(0, 2).map((cuisine) => (
                      <span
                        key={cuisine}
                        className="rounded-full bg-muted px-2 py-1 text-xs"
                      >
                        {cuisine}
                      </span>
                    ))}
                  </div>

                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">
                        {restaurant.averageRating}
                      </span>
                      <span>({restaurant.totalReviews} reviews)</span>
                    </div>
                    {restaurant.acceptingOrders && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>{restaurant.estimatedPickupTime} min pickup</span>
                      </div>
                    )}
                  </div>

                  {restaurant.acceptingOrders && (
                    <Button className="mt-4 w-full" size="sm">
                      <UtensilsCrossed className="mr-2 h-4 w-4" />
                      Order Now
                    </Button>
                  )}
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
