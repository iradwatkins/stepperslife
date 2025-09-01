import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar, Plus, Ticket, MapPin } from "lucide-react";

export default function OrganizerEvents() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Events</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage and track your events</p>
        </div>
        <Link href="/organizer/new-event">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Events</CardTitle>
          <CardDescription>All events you're organizing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">No events yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              Create your first event to start selling tickets
            </p>
            <Link href="/organizer/new-event">
              <Button>Create Your First Event</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}