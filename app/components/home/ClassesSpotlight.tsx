import Image from "next/image";
import Link from "next/link";
import { mockCourses } from "@/lib/mock-data/classes";
import { Button } from "@/components/ui/button";
import { BookOpen, Star, Users } from "lucide-react";

export function ClassesSpotlight() {
  const courses = mockCourses.filter((c) => c.isFeatured);

  return (
    <section className="bg-background py-16">
      <div className="container px-4">
        <div className="mb-10 flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1 min-w-[250px]">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Learn to Step
            </h2>
            <p className="mt-2 text-muted-foreground">
              Master Chicago Steppin with expert-led online classes
            </p>
          </div>
          <Button asChild variant="outline" className="flex-shrink-0">
            <Link href="/classes">Browse All Classes</Link>
          </Button>
        </div>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/classes/${course.slug}`}
              className="group"
            >
              <article className="overflow-hidden rounded-lg border bg-card transition-all hover:shadow-xl">
                <div className="relative aspect-video overflow-hidden">
                  <Image
                    src={course.thumbnailUrl}
                    alt={course.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute left-3 top-3">
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      {course.level}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  {/* Instructor */}
                  <div className="mb-3 flex items-center gap-2">
                    <div className="relative h-8 w-8 overflow-hidden rounded-full">
                      <Image
                        src={course.instructorPhoto}
                        alt={course.instructorName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {course.instructorName}
                    </span>
                  </div>

                  <h3 className="mb-2 text-xl font-bold group-hover:text-primary">
                    {course.title}
                  </h3>
                  <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                    {course.shortDescription}
                  </p>

                  <div className="mb-4 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        <span>{course.totalLessons} lessons</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">
                          {course.averageRating}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{course.enrollmentCount} students enrolled</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      ${course.price.toFixed(2)}
                    </span>
                    <Button size="sm">Enroll Now</Button>
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
