"use client";

import { useRouter } from "next/navigation";
import { useAuth, SignInButton } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp,
  CheckCircle,
  ArrowRight
} from "lucide-react";

export default function OrganizerOnboarding() {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  const benefits = [
    {
      icon: DollarSign,
      title: "Earn Revenue",
      description: "Keep 100% of your ticket sales minus a small platform fee"
    },
    {
      icon: Users,
      title: "Reach More Customers",
      description: "Access our growing community of event attendees"
    },
    {
      icon: TrendingUp,
      title: "Analytics & Insights",
      description: "Track sales, understand your audience, and optimize events"
    },
    {
      icon: Calendar,
      title: "Easy Event Management",
      description: "Simple tools to create, manage, and promote your events"
    }
  ];

  const features = [
    "Create unlimited events",
    "Sell tickets online",
    "QR code check-in system",
    "Real-time sales tracking",
    "Customer database",
    "Affiliate program support",
    "Multiple payment options",
    "Detailed analytics"
  ];

  const handleGetStarted = () => {
    if (isSignedIn) {
      router.push("/organizer/new-event");
    } else {
      // Store intended destination for after sign-in
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirectAfterSignIn', '/organizer/new-event');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Become an Event Organizer
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Start selling tickets and managing your events with SteppersLife
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {benefits.map((benefit, index) => (
            <Card key={index} className="border-2 hover:border-blue-500 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                    <benefit.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{benefit.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main CTA Card */}
        <Card className="mb-12 border-2 border-blue-500">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Ready to Start Organizing?</CardTitle>
            <CardDescription className="text-lg">
              Create your first event in minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>
            
            <div className="text-center">
              {isSignedIn ? (
                <Button 
                  size="lg" 
                  onClick={handleGetStarted}
                  className="px-8"
                >
                  Create Your First Event
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              ) : (
                <SignInButton 
                  mode="modal" 
                  afterSignInUrl="/organizer/new-event"
                  fallbackRedirectUrl="/organizer/new-event"
                >
                  <Button size="lg" className="px-8">
                    Sign In to Create Event
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </SignInButton>
              )}
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
                No setup fees • Only pay $1.50 per ticket sold
              </p>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>Get started in 3 simple steps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                  1
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Create Your Event</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Add event details, set ticket prices, and configure options
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                  2
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Share & Promote</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Share your event link and let customers purchase tickets online
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                  3
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Manage & Track</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Check in attendees with QR codes and track your sales in real-time
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}