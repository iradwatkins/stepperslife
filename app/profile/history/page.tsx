import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Clock, Calendar, MapPin, DollarSign } from "lucide-react";

export default function PurchaseHistory() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Purchase History</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">View your past ticket purchases and transactions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Purchases</CardTitle>
          <CardDescription>Your ticket purchase history</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">No purchase history yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              Your ticket purchases will appear here
            </p>
            <Link href="/events">
              <Button>Browse Events</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}