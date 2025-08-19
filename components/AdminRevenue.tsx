"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, Users, Calendar } from "lucide-react";

export function AdminRevenue() {
  // Get all platform transactions
  const transactions = useQuery(api.platformTransactions.getAllTransactions);
  const metrics = useQuery(api.platformTransactions.getPlatformMetrics);
  
  if (!metrics) {
    return <div>Loading financial data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metrics.totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              All time platform revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Platform Fees (1%)
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metrics.totalPlatformFees.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total fees collected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Payouts
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metrics.pendingPayouts.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting seller payouts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              This Month
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${metrics.monthlyRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.monthlyTransactions} transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Event</th>
                  <th className="text-left py-2">Buyer</th>
                  <th className="text-right py-2">Amount</th>
                  <th className="text-right py-2">Platform Fee</th>
                  <th className="text-right py-2">Seller Payout</th>
                  <th className="text-left py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions?.map((tx) => (
                  <tr key={tx._id} className="border-b">
                    <td className="py-2">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-2">{tx.eventName}</td>
                    <td className="py-2">{tx.buyerEmail}</td>
                    <td className="text-right py-2">
                      ${tx.amount.toFixed(2)}
                    </td>
                    <td className="text-right py-2">
                      ${tx.platformFee.toFixed(2)}
                    </td>
                    <td className="text-right py-2">
                      ${tx.sellerPayout.toFixed(2)}
                    </td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        tx.status === 'completed' ? 'bg-green-100 text-green-800' :
                        tx.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}