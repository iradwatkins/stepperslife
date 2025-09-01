import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Mail, MessageSquare, Calendar, Ticket } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notification Preferences</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Control how and when we contact you</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Notifications
            </CardTitle>
            <CardDescription>Choose which emails you want to receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Ticket Confirmations</p>
                <p className="text-xs text-gray-500">Receive confirmations when you purchase tickets</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </label>
            <label className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Event Reminders</p>
                <p className="text-xs text-gray-500">Get reminders about upcoming events</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </label>
            <label className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Marketing Updates</p>
                <p className="text-xs text-gray-500">News about new events and special offers</p>
              </div>
              <input type="checkbox" className="rounded" />
            </label>
            <label className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Price Alerts</p>
                <p className="text-xs text-gray-500">Get notified when ticket prices drop</p>
              </div>
              <input type="checkbox" className="rounded" />
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Push Notifications
            </CardTitle>
            <CardDescription>Mobile and browser notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Event Updates</p>
                <p className="text-xs text-gray-500">Changes to events you're attending</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </label>
            <label className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Last Minute Deals</p>
                <p className="text-xs text-gray-500">Special offers and discounts</p>
              </div>
              <input type="checkbox" className="rounded" />
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              SMS Notifications
            </CardTitle>
            <CardDescription>Text message alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Event Day Reminders</p>
                <p className="text-xs text-gray-500">Get a text on the day of your event</p>
              </div>
              <input type="checkbox" className="rounded" />
            </label>
            <label className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Urgent Updates</p>
                <p className="text-xs text-gray-500">Important changes or cancellations</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </label>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button>Save Preferences</Button>
          <Button variant="outline">Reset to Defaults</Button>
        </div>
      </div>
    </div>
  );
}