import Image from "next/image";
import Link from "next/link";
import { mockStoreProducts } from "@/lib/mock-data/stores";
import { Button } from "@/components/ui/button";
import { Tag } from "lucide-react";

export function StoresShowcase() {
  const products = mockStoreProducts.slice(0, 3);

  return (
    <section className="bg-background py-16">
      <div className="container px-4">
        <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-[250px]">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Steppers Stores
            </h2>
            <p className="mt-2 text-muted-foreground">
              Find everything you need for the dance floor
            </p>
          </div>
          <Button asChild variant="outline" className="flex-shrink-0">
            <Link href="/stores">Browse Stores</Link>
          </Button>
        </div>

        <div className="grid gap-6 grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/stores/${product.vendorSlug}/${product.slug}`}
              className="group"
            >
              <article className="overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg">
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {product.compareAtPrice && (
                    <div className="absolute left-2 top-2">
                      <span className="rounded-full bg-destructive px-2 py-1 text-xs font-semibold text-destructive-foreground">
                        SALE
                      </span>
                    </div>
                  )}
                  {!product.inStock && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <span className="rounded-full bg-background px-3 py-1 text-sm font-semibold">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <p className="mb-1 text-xs text-muted-foreground">
                    {product.vendorName}
                  </p>
                  <h3 className="mb-2 line-clamp-2 text-sm font-semibold group-hover:text-primary">
                    {product.name}
                  </h3>

                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.compareAtPrice && (
                      <span className="text-sm text-muted-foreground line-through">
                        ${product.compareAtPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="mt-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs">
                      <Tag className="h-3 w-3" />
                      {product.category}
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
