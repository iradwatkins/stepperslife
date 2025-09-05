"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  ArrowLeft,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

export default function AffiliateCommissions() {
  const { user } = useUser();
  
  // Get affiliate programs to get payout data
  const affiliatePrograms = useQuery(
    api.affiliates.getUserAffiliatePrograms,
    user?.id ? { userId: user.id } : "skip"
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate totals from affiliate programs
  const totalEarned = affiliatePrograms?.reduce((sum, p) => sum + p.totalEarned, 0) || 0;
  const totalPaidOut = affiliatePrograms?.reduce((sum, p) => sum + (p.totalPaidOut || 0), 0) || 0;
  const totalOutstanding = totalEarned - totalPaidOut;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        {/* Header with Back Button */}
        <div className="mb-8">
          <Link href="/affiliate">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Commission History
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your earnings and payment history
          </p>
        </div>

        {/* Commission Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalEarned)}
                </span>
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Lifetime commissions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Paid Out
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">
                  {formatCurrency(totalPaidOut)}
                </span>
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Already received
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Outstanding Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-orange-600">
                  {formatCurrency(totalOutstanding)}
                </span>
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Pending payment
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Commission by Event */}
        <Card>
          <CardHeader>
            <CardTitle>Commission Breakdown by Event</CardTitle>
            <CardDescription>
              Detailed earnings for each affiliate program
            </CardDescription>
          </CardHeader>
          <CardContent>
            {affiliatePrograms && affiliatePrograms.length > 0 ? (
              <div className="space-y-4">
                {affiliatePrograms.map((program) => {
                  const outstanding = program.totalEarned - (program.totalPaidOut || 0);
                  return (
                    <div
                      key={program._id}
                      className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold">{program.eventName}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="inline h-3 w-3 mr-1" />
                            {formatDate(program.eventDate)}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge variant="secondary">
                              {program.totalSold} tickets sold
                            </Badge>
                            <span className="text-sm text-gray-500">
                              @ {formatCurrency(program.commissionPerTicket)}/ticket
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Total Earned</p>
                            <p className="text-xl font-bold text-green-600">
                              {formatCurrency(program.totalEarned)}
                            </p>
                          </div>
                          {program.totalPaidOut && program.totalPaidOut > 0 && (
                            <div className="text-right">
                              <p className="text-sm text-gray-500">Paid Out</p>
                              <p className="font-semibold">
                                {formatCurrency(program.totalPaidOut)}
                              </p>
                            </div>
                          )}
                          {outstanding > 0 && (
                            <Badge variant="outline" className="bg-orange-50">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatCurrency(outstanding)} pending
                            </Badge>
                          )}
                          {program.lastPayoutDate && (
                            <p className="text-xs text-gray-500">
                              Last payout: {formatDate(program.lastPayoutDate)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">
                  No commission history yet
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Start sharing your affiliate links to earn commissions
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Information */}
        {totalOutstanding > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                You have <strong>{formatCurrency(totalOutstanding)}</strong> in outstanding commissions. 
                Event organizers will contact you directly to arrange payment for your commissions.
              </p>
              <p className="text-sm text-gray-500">
                Payment methods vary by organizer and may include:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-500 mt-2 space-y-1">
                <li>Cash payment at events</li>
                <li>Zelle, Venmo, or PayPal transfers</li>
                <li>Bank transfers or checks</li>
              </ul>
              <p className="text-sm text-gray-500 mt-4">
                Contact the event organizer if you have questions about your pending payments.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}