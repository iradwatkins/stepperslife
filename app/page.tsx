import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, ArrowRight, Star, Music, PartyPopper, Trophy } from "lucide-react";
import SplashScreen from "@/components/SplashScreen";

export default function Home() {
  return (
    <>
      <SplashScreen />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-teal-50 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-12 md:py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent mb-4 md:mb-6">
              Welcome to Stepper's Life
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 dark:text-gray-300 mb-6 md:mb-8">
              Discover amazing dance events, workshops, and social gatherings in your area
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/events">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg">
                  Browse Events
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/organizer/new-event">
                <Button size="lg" variant="outline" className="px-8 py-6 text-lg">
                  Host an Event
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements - Hidden on mobile */}
        <div className="hidden md:block absolute top-10 left-10 text-purple-200 dark:text-purple-700 opacity-50">
          <Music className="w-20 h-20" />
        </div>
        <div className="hidden md:block absolute bottom-10 right-10 text-teal-200 dark:text-teal-700 opacity-50">
          <PartyPopper className="w-24 h-24" />
        </div>
        <div className="hidden lg:block absolute top-1/2 left-20 text-gold-200 dark:text-gold-700 opacity-30">
          <Trophy className="w-16 h-16" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 md:mb-12">
            Why Choose Stepper's Life?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-10 h-10 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Diverse Events</h3>
              <p className="text-gray-600 dark:text-gray-400">
                From workshops to socials, competitions to cruises - find your perfect dance experience
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-teal-100 dark:bg-teal-900 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-10 h-10 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Local & Global</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Discover events in your neighborhood or plan your next dance vacation worldwide
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-gold-100 dark:bg-yellow-900 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Vibrant Community</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Connect with fellow dancers, instructors, and organizers who share your passion
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 md:py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 md:mb-12">
            Event Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 max-w-4xl mx-auto">
            {[
              "Workshops", "Performances", "Social Dancing", "Competitions",
              "Classes", "Holiday Events", "Cruises", "Festivals"
            ].map((category) => (
              <Link key={category} href={`/events?category=${category.toLowerCase()}`}>
                <div className="bg-white dark:bg-gray-700 rounded-lg p-4 md:p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">{category}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-gradient-to-r from-purple-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg sm:text-xl mb-6 md:mb-8 opacity-90">
            Join thousands of dancers discovering amazing events every day
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/events">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-6 text-lg">
                Explore Events
                <Star className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10 px-8 py-6 text-lg">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
            <div>
              <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">1000+</p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Active Events</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-teal-600 dark:text-teal-400">50+</p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Cities</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">10k+</p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Happy Dancers</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">500+</p>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Event Organizers</p>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
}