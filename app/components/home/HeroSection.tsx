import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative h-[600px] w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=1920&q=80"
          alt="Chicago Steppin"
          fill
          className="object-cover brightness-50"
          priority
        />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex h-full items-center justify-center">
        <div className="container px-4 text-center text-white">
          <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
            Welcome to SteppersLife
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl sm:text-2xl">
            Your complete platform for Chicago Steppin - restaurants, events,
            classes, and more
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" className="text-lg">
              <Link href="/events">Explore Events</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg">
              <Link href="/classes">Browse Classes</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
    </section>
  );
}
