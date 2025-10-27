import Image from "next/image";
import Link from "next/link";
import { mockServices } from "@/lib/mock-data/services";
import { Button } from "@/components/ui/button";
import { DollarSign, Star } from "lucide-react";

export function ServicesDirectory() {
  const services = mockServices.filter((s) => s.isPriority).slice(0, 4);

  return (
    <section className="bg-muted/30 py-16">
      <div className="container px-4">
        <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-[250px]">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Professional Services
            </h2>
            <p className="mt-2 text-muted-foreground">
              Connect with DJs, photographers, venues, and more
            </p>
          </div>
          <Button asChild variant="outline" className="flex-shrink-0">
            <Link href="/services">View All Services</Link>
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <Link
              key={service.id}
              href={`/services/${service.slug}`}
              className="group"
            >
              <article className="overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={service.coverImageUrl}
                    alt={service.businessName}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute right-3 top-3">
                    <span className="rounded-full bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
                      {service.category}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  {/* Logo */}
                  <div className="mb-3 flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-border">
                      <Image
                        src={service.logoUrl}
                        alt={service.businessName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold group-hover:text-primary">
                        {service.businessName}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {service.tagline}
                      </p>
                    </div>
                  </div>

                  <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                    {service.description}
                  </p>

                  <div className="mb-4 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">
                          {service.averageRating}
                        </span>
                        <span className="text-muted-foreground">
                          ({service.totalReviews})
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span>From ${service.startingPrice}</span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full" size="sm" variant="outline">
                    View Profile
                  </Button>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
