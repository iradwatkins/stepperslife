import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MagazineArticle } from "@/lib/types/aggregated-content";
import { Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { InFeedAd } from "@/app/components/ads/InFeedAd";

interface ArticlesGridProps {
  articles: MagazineArticle[];
}

export function ArticlesGrid({ articles }: ArticlesGridProps) {
  if (articles.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
          <p className="text-lg font-medium">No articles found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article, index) => (
        <React.Fragment key={article.id}>
          {/* Show in-feed ad after every 6 articles */}
          {index > 0 && index % 6 === 0 && (
            <div className="sm:col-span-2 lg:col-span-3">
              <InFeedAd />
            </div>
          )}
          <Link
            href={`/magazine/${article.slug}`}
            className="group"
          >
            <article className="overflow-hidden rounded-lg border bg-card transition-all hover:shadow-xl">
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={article.featuredImage}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {article.isFeatured && (
                  <div className="absolute right-3 top-3">
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      Featured
                    </span>
                  </div>
                )}
                <div className="absolute left-3 top-3">
                  <span className="rounded-full bg-background/90 px-3 py-1 text-xs font-semibold">
                    {article.category}
                  </span>
                </div>
              </div>

              <div className="p-5">
                <h3 className="mb-2 text-xl font-bold group-hover:text-primary">
                  {article.title}
                </h3>
                <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                  {article.excerpt}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{article.authorName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(article.publishedAt), "PPP")}</span>
                  </div>
                  <div className="text-muted-foreground">
                    {article.readTime} min read
                  </div>
                </div>
              </div>
            </article>
          </Link>
        </React.Fragment>
      ))}
    </div>
  );
}
