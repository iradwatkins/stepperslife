"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Clock, CreditCard } from "lucide-react";
import { useState } from "react";

export default function SellerEarningsPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id || session?.user?.email || "";
  
  const balance = useQuery(api.platformTransactions.getSellerBalance, { userId });
  const transactions = useQuery(api.platformTransactions.getSellerTransactions, { 
    sellerId: userId 
  });
  
  const [showPayoutForm, setShowPayoutForm] = useState(false);

  if (!balance) {
    return <div>Loading earnings data...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Your Earnings</h1>
        <p className="text-gray-600 mt-2">
          Track your ticket sales and request payouts
        </p>
      </div>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Balance
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${balance.availableBalance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready for payout
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Balance
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${balance.pendingBalance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Processing payouts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Earnings
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${balance.totalEarnings.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              All time earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Payouts
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${balance.totalPayouts.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Withdrawn to bank
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Request Payout Button */}
      <div className="mb-8">
        <Button 
          onClick={() => setShowPayoutForm(true)}
          disabled={balance.availableBalance < 10}
          className="bg-green-600 hover:bg-green-700"
        >
          Request Payout (Min $10)
        </Button>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Event</th>
                  <th className="text-left py-2">Buyer</th>
                  <th className="text-right py-2">Sale Amount</th>
                  <th className="text-right py-2">Platform Fee (1%)</th>
                  <th className="text-right py-2">Your Earnings</th>
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
                    <td className="text-right py-2 text-red-600">
                      -${tx.platformFee.toFixed(2)}
                    </td>
                    <td className="text-right py-2 text-green-600">
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
          {(!transactions || transactions.length === 0) && (
            <p className="text-center text-gray-500 py-8">
              No transactions yet. Start selling tickets to see your earnings!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Payout Form Modal */}
      {showPayoutForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Request Payout</h2>
            <p className="text-gray-600 mb-4">
              Available balance: ${balance.availableBalance.toFixed(2)}
            </p>
            <form>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Amount to withdraw
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="10"
                    max={balance.availableBalance}
                    className="w-full p-2 border rounded"
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Bank Account Name
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Sort Code
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    placeholder="00-00-00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Account Number
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded"
                    placeholder="12345678"
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPayoutForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Request Payout
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}