import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Building, CreditCard, Bell, Shield, Globe, Palette, Key } from "lucide-react";

export default function OrganizerSettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Organizer Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your organizer profile and preferences</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Organizer Profile
            </CardTitle>
            <CardDescription>Your public organizer information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Organizer Name</label>
                <input type="text" placeholder="Your organizer name" className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Contact Email</label>
                <input type="email" placeholder="contact@example.com" className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone Number</label>
                <input type="tel" placeholder="+1 (555) 000-0000" className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Website</label>
                <input type="url" placeholder="https://yourwebsite.com" className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea 
                  placeholder="Tell customers about your organization..." 
                  className="w-full px-3 py-2 border rounded-lg h-24"
                ></textarea>
              </div>
            </div>
            <Button>Save Profile</Button>
          </CardContent>
        </Card>

        {/* Business Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Business Information
            </CardTitle>
            <CardDescription>Legal and tax information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Business Name</label>
                <input type="text" placeholder="Legal business name" className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Tax ID / EIN</label>
                <input type="text" placeholder="XX-XXXXXXX" className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Business Address</label>
                <input type="text" placeholder="Street address" className="w-full px-3 py-2 border rounded-lg mb-2" />
                <div className="grid grid-cols-3 gap-2">
                  <input type="text" placeholder="City" className="px-3 py-2 border rounded-lg" />
                  <input type="text" placeholder="State" className="px-3 py-2 border rounded-lg" />
                  <input type="text" placeholder="ZIP" className="px-3 py-2 border rounded-lg" />
                </div>
              </div>
            </div>
            <Button>Update Business Info</Button>
          </CardContent>
        </Card>

        {/* Event Defaults */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Event Defaults
            </CardTitle>
            <CardDescription>Default settings for new events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Default Venue</label>
                <input type="text" placeholder="Venue name and address" className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Default Refund Policy</label>
                <select className="w-full px-3 py-2 border rounded-lg">
                  <option>No refunds</option>
                  <option>7 days before event</option>
                  <option>48 hours before event</option>
                  <option>24 hours before event</option>
                  <option>Anytime before event</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Default Service Fee</label>
                <div className="flex gap-2">
                  <input type="number" placeholder="0" className="w-24 px-3 py-2 border rounded-lg" />
                  <select className="px-3 py-2 border rounded-lg">
                    <option>% of ticket</option>
                    <option>Fixed amount</option>
                  </select>
                </div>
              </div>
            </div>
            <Button>Save Defaults</Button>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>How we notify you about your events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-6">
              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">New Ticket Sales</p>
                  <p className="text-xs text-gray-500">Get notified when tickets are sold</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Daily Summary</p>
                  <p className="text-xs text-gray-500">Daily email with sales and metrics</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Low Ticket Alerts</p>
                  <p className="text-xs text-gray-500">When ticket inventory is running low</p>
                </div>
                <input type="checkbox" className="rounded" />
              </label>
              <label className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">Customer Messages</p>
                  <p className="text-xs text-gray-500">Questions from ticket buyers</p>
                </div>
                <input type="checkbox" defaultChecked className="rounded" />
              </label>
            </div>
            <Button>Update Notifications</Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>Protect your organizer account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">Two-Factor Authentication</p>
                  <p className="text-xs text-gray-500">Add an extra layer of security</p>
                </div>
                <Button size="sm">Enable</Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium text-sm">Change Password</p>
                  <p className="text-xs text-gray-500">Update your account password</p>
                </div>
                <Button size="sm" variant="outline">
                  <Key className="h-4 w-4 mr-2" />
                  Change
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}