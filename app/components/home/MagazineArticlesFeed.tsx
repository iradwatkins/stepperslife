import Image from "next/image";
import Link from "next/link";
import { mockMagazineArticles } from "@/lib/mock-data/magazine";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

export function MagazineArticlesFeed() {
  const articles = mockMagazineArticles.slice(0, 4);

  return (
    <section className="bg-background py-16">
      <div className="container px-4">
        <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-[250px]">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Latest from the Magazine
            </h2>
            <p className="mt-2 text-muted-foreground">
              Stories, tips, and news from the Chicago Steppin community
            </p>
          </div>
          <Button asChild variant="outline" className="flex-shrink-0">
            <Link href="/magazine">View All Articles</Link>
          </Button>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/magazine/${article.slug}`}
              className="group"
            >
              <article className="overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={article.featuredImage}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute left-3 top-3">
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      {article.category}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="mb-2 line-clamp-2 text-xl font-bold group-hover:text-primary">
                    {article.title}
                  </h3>
                  <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                    {article.excerpt}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <div className="relative h-6 w-6 overflow-hidden rounded-full">
                        <Image
                          src={article.authorPhoto}
                          alt={article.authorName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span>{article.authorName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{article.readTime} min read</span>
                    </div>
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
