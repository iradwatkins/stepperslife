import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Course } from "@/lib/types/aggregated-content";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, Star } from "lucide-react";
import { InFeedAd } from "@/app/components/ads/InFeedAd";

interface ClassesGridProps {
  courses: Course[];
}

export function ClassesGrid({ courses }: ClassesGridProps) {
  if (courses.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
          <p className="text-lg font-medium">No classes found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters
          </p>
        </div>
      </div>
    );
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case "BEGINNER":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "INTERMEDIATE":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "ADVANCED":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course, index) => (
        <React.Fragment key={course.id}>
          {/* Show in-feed ad after every 6 courses */}
          {index > 0 && index % 6 === 0 && (
            <div className="sm:col-span-2 lg:col-span-3">
              <InFeedAd />
            </div>
          )}
          <Link
            href={`/classes/${course.slug}`}
            className="group"
          >
            <article className="overflow-hidden rounded-lg border bg-card transition-all hover:shadow-xl">
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={course.thumbnailUrl}
                  alt={course.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute left-3 top-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getLevelColor(course.level)}`}
                  >
                    {course.level}
                  </span>
                </div>
                {course.isFeatured && (
                  <div className="absolute right-3 top-3">
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      Featured
                    </span>
                  </div>
                )}
              </div>

              <div className="p-5">
                <h3 className="mb-2 text-xl font-bold group-hover:text-primary">
                  {course.title}
                </h3>
                <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                  {course.shortDescription}
                </p>

                <div className="mb-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <GraduationCap className="h-4 w-4" />
                    <span className="font-medium">{course.instructorName}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium">{course.averageRating}</span>
                    <span className="text-muted-foreground">
                      ({course.enrollmentCount} enrolled)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{course.totalLessons} lessons</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t pt-4">
                  <div>
                    <span className="text-2xl font-bold">
                      ${course.price.toFixed(2)}
                    </span>
                  </div>
                  <Button size="sm">Enroll Now</Button>
                </div>
              </div>
            </article>
          </Link>
        </React.Fragment>
      ))}
    </div>
  );
}
