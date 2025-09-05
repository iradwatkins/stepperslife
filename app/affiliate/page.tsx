"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  UserPlus, 
  DollarSign, 
  TrendingUp, 
  Link2,
  Share2,
  ChevronRight,
  Copy,
  QrCode
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

export default function AffiliateDashboard() {
  const { user } = useUser();
  
  // Get affiliate programs for the current user
  const affiliatePrograms = useQuery(
    api.affiliates.getUserAffiliatePrograms,
    user?.id ? { userId: user.id } : "skip"
  );
  
  // Get affiliate stats
  const affiliateStats = useQuery(
    api.affiliates.getAffiliateStats,
    user?.id ? { affiliateUserId: user.id } : "skip"
  );

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (!affiliatePrograms || affiliatePrograms.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-16 pb-16">
              <div className="text-center">
                <UserPlus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">No Affiliate Programs Yet</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  You haven't joined any affiliate programs. Ask event organizers to invite you to their affiliate program.
                </p>
                <Link href="/events">
                  <Button>Browse Events</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Affiliate Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your referrals, commissions, and share events to earn
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-green-600">
                  {formatCurrency(affiliateStats?.totalEarnings || 0)}
                </span>
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Lifetime commissions earned
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Tickets Sold
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">
                  {affiliateStats?.totalTicketsSold || 0}
                </span>
                <QrCode className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Through your referral links
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Programs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">
                  {affiliateStats?.activePrograms || 0}
                </span>
                <UserPlus className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Events you can promote
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Active Affiliate Programs */}
        <Card>
          <CardHeader>
            <CardTitle>Your Affiliate Programs</CardTitle>
            <CardDescription>
              Share these events to earn commission on each ticket sold
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {affiliatePrograms?.map((program) => (
                <div
                  key={program._id}
                  className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{program.eventName}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(program.eventDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-gray-500">{program.eventLocation}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="secondary">
                          Code: {program.referralCode}
                        </Badge>
                        <span className="text-sm font-medium text-green-600">
                          {formatCurrency(program.commissionPerTicket)}/ticket
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="text-right mb-2">
                        <p className="text-sm text-gray-500">Your earnings</p>
                        <p className="text-xl font-bold text-green-600">
                          {formatCurrency(program.totalEarned)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {program.totalSold} tickets sold
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(program.referralLink, 'Referral link')}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy Link
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => {
                            const text = `Check out ${program.eventName}! Use my code ${program.referralCode} or this link: ${program.referralLink}`;
                            if (navigator.share) {
                              navigator.share({
                                title: program.eventName,
                                text: text,
                                url: program.referralLink
                              });
                            } else {
                              copyToClipboard(text, 'Share message');
                            }
                          }}
                        >
                          <Share2 className="h-4 w-4 mr-1" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Share Buttons */}
                  <div className="mt-4 pt-4 border-t flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs"
                      onClick={() => {
                        const url = `https://wa.me/?text=${encodeURIComponent(`Check out ${program.eventName}! ${program.referralLink}`)}`;
                        window.open(url, '_blank');
                      }}
                    >
                      WhatsApp
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs"
                      onClick={() => {
                        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(program.referralLink)}`;
                        window.open(url, '_blank');
                      }}
                    >
                      Facebook
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs"
                      onClick={() => {
                        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${program.eventName}`)}&url=${encodeURIComponent(program.referralLink)}`;
                        window.open(url, '_blank');
                      }}
                    >
                      Twitter
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs"
                      onClick={() => {
                        const subject = encodeURIComponent(`Check out ${program.eventName}`);
                        const body = encodeURIComponent(`I thought you might be interested in this event:\n\n${program.eventName}\n${new Date(program.eventDate).toLocaleDateString()}\n${program.eventLocation}\n\nGet tickets here: ${program.referralLink}`);
                        window.location.href = `mailto:?subject=${subject}&body=${body}`;
                      }}
                    >
                      Email
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Commission Payouts</CardTitle>
              <CardDescription>Track your payment history</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/affiliate/commissions">
                <Button className="w-full">
                  <DollarSign className="h-4 w-4 mr-2" />
                  View Commission History
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
              <CardDescription>Learn how to maximize your earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/profile/help">
                <Button variant="outline" className="w-full">
                  View Affiliate Guide
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}