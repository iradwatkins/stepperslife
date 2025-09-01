import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, MessageCircle, Mail, Phone, Book, FileText, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Help & Support</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Get answers to your questions</p>
      </div>

      <div className="grid gap-6">
        {/* Quick Help */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Quick Help
            </CardTitle>
            <CardDescription>Common questions and answers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <details className="group">
                <summary className="cursor-pointer font-medium text-sm py-2 hover:text-purple-600">
                  How do I purchase tickets?
                </summary>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 pl-4">
                  Browse events, select your tickets, and complete checkout with your preferred payment method. You'll receive your tickets via email immediately after purchase.
                </p>
              </details>
              <details className="group">
                <summary className="cursor-pointer font-medium text-sm py-2 hover:text-purple-600">
                  Can I get a refund?
                </summary>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 pl-4">
                  Refund policies vary by event. Check the event details for specific refund terms. Most events offer refunds up to 48 hours before the event date.
                </p>
              </details>
              <details className="group">
                <summary className="cursor-pointer font-medium text-sm py-2 hover:text-purple-600">
                  How do I transfer tickets?
                </summary>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 pl-4">
                  Go to My Tickets, select the ticket you want to transfer, and enter the recipient's email address. They'll receive the ticket instantly.
                </p>
              </details>
              <details className="group">
                <summary className="cursor-pointer font-medium text-sm py-2 hover:text-purple-600">
                  What if my event is cancelled?
                </summary>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 pl-4">
                  If an event is cancelled, you'll automatically receive a full refund within 3-5 business days. You'll be notified via email.
                </p>
              </details>
            </div>
          </CardContent>
        </Card>

        {/* Contact Options */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <MessageCircle className="h-8 w-8 text-purple-600 mb-2" />
              <CardTitle className="text-lg">Live Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Chat with our support team
              </p>
              <Button className="w-full">
                <MessageCircle className="h-4 w-4 mr-2" />
                Start Chat
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Mail className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle className="text-lg">Email Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Get help via email
              </p>
              <Button variant="outline" className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Phone className="h-8 w-8 text-green-600 mb-2" />
              <CardTitle className="text-lg">Phone Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Call us directly
              </p>
              <Button variant="outline" className="w-full">
                <Phone className="h-4 w-4 mr-2" />
                1-800-TICKETS
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Resources
            </CardTitle>
            <CardDescription>Helpful guides and documentation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <Link href="/help/buying-guide" className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-sm">Ticket Buying Guide</p>
                  <p className="text-xs text-gray-500">Everything you need to know</p>
                </div>
                <ExternalLink className="h-4 w-4 ml-auto text-gray-400" />
              </Link>
              <Link href="/help/organizer-guide" className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-sm">Event Organizer Guide</p>
                  <p className="text-xs text-gray-500">Start selling tickets</p>
                </div>
                <ExternalLink className="h-4 w-4 ml-auto text-gray-400" />
              </Link>
              <Link href="/terms" className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-sm">Terms of Service</p>
                  <p className="text-xs text-gray-500">Our policies and terms</p>
                </div>
                <ExternalLink className="h-4 w-4 ml-auto text-gray-400" />
              </Link>
              <Link href="/privacy" className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-sm">Privacy Policy</p>
                  <p className="text-xs text-gray-500">How we protect your data</p>
                </div>
                <ExternalLink className="h-4 w-4 ml-auto text-gray-400" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}