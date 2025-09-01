import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Heart, Calendar } from "lucide-react";

export default function Wishlist() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Wishlist</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Events you've saved for later</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Saved Events</CardTitle>
          <CardDescription>Events you're interested in attending</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">Your wishlist is empty</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              Save events you're interested in to find them here
            </p>
            <Link href="/events">
              <Button>Discover Events</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}