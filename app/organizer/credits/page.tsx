"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { 
  Package, 
  TrendingUp, 
  ShoppingCart, 
  History,
  CreditCard,
  AlertCircle,
  Plus,
  RefreshCw,
  Download,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

export default function CreditsDashboard() {
  const { user } = useUser();
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<typeof creditPackages extends Array<infer T> ? T | null : null>(null);
  
  // Queries
  const creditBalance = useQuery(api.creditManager.getBalance, { 
    organizerId: user?.id || "" 
  });
  
  const transactionHistory = useQuery(api.creditManager.getTransactionHistory, {
    organizerId: user?.id || "",
    limit: 10,
  });
  
  const creditPackages = useQuery(api.creditManager.getCreditPackages);
  
  // Mutations
  const purchaseCredits = useMutation(api.creditManager.purchaseCredits);
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Please sign in to view your credits</p>
      </div>
    );
  }
  
  const handlePurchaseCredits = async (packageId: string, quantity: number) => {
    try {
      // In production, this would redirect to Stripe checkout
      console.log("Purchasing credits:", packageId, quantity);
      
      // Simulate purchase for demo
      await purchaseCredits({
        organizerId: user.id,
        packageId,
        quantity,
        paymentReference: `demo_${Date.now()}`,
        paymentMethod: "stripe",
      });
      
      setShowPurchaseModal(false);
      setSelectedPackage(null);
    } catch (error) {
      console.error("Error purchasing credits:", error);
      alert("Failed to purchase credits. Please try again.");
    }
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "purchase":
        return <Plus className="w-4 h-4 text-green-600" />;
      case "deduction":
        return <ShoppingCart className="w-4 h-4 text-blue-600" />;
      case "refund":
        return <RefreshCw className="w-4 h-4 text-orange-600" />;
      default:
        return <History className="w-4 h-4 text-gray-600" />;
    }
  };
  
  const getTransactionColor = (type: string) => {
    switch (type) {
      case "purchase":
        return "text-green-600";
      case "deduction":
        return "text-red-600";
      case "refund":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Credit Management</h1>
              <p className="text-gray-600 mt-1">Manage your ticket credits and purchase history</p>
            </div>
            <button
              onClick={() => setShowPurchaseModal(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 flex items-center gap-2"
            >
              <Package className="w-5 h-5" />
              Purchase Credits
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Available Credits */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              {creditBalance && creditBalance.availableCredits < 10 && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  Low Balance
                </span>
              )}
            </div>
            <h3 className="text-sm font-medium text-gray-600">Available Credits</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {creditBalance?.availableCredits || 0}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              ${((creditBalance?.availableCredits || 0) * 0.79).toFixed(2)} value
            </p>
          </div>
          
          {/* Reserved Credits */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-teal-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-teal-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Reserved</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {creditBalance?.reservedCredits || 0}
            </p>
            <p className="text-sm text-gray-500 mt-2">In active checkouts</p>
          </div>
          
          {/* Lifetime Stats */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Lifetime Used</h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {creditBalance?.lifetimeUsed || 0}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {creditBalance?.lifetimePurchased || 0} total purchased
            </p>
          </div>
        </div>
        
        {/* Low Balance Alert */}
        {creditBalance && creditBalance.availableCredits < 10 && creditBalance.availableCredits > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-yellow-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-yellow-900">Low Credit Balance</p>
                <p className="text-sm text-yellow-800 mt-1">
                  You have only {creditBalance.availableCredits} credits remaining. 
                  Consider purchasing more credits to avoid interruptions.
                </p>
              </div>
              <button
                onClick={() => setShowPurchaseModal(true)}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-semibold hover:bg-yellow-700"
              >
                Buy Now
              </button>
            </div>
          </div>
        )}
        
        {/* No Credits Alert */}
        {creditBalance && creditBalance.availableCredits === 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-red-900">No Credits Available</p>
                <p className="text-sm text-red-800 mt-1">
                  You need credits to sell tickets. Purchase credits now to start selling.
                </p>
              </div>
              <button
                onClick={() => setShowPurchaseModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700"
              >
                Purchase Credits
              </button>
            </div>
          </div>
        )}
        
        {/* Transaction History */}
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Transaction History</h2>
              <button className="text-sm text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1">
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
          
          <div className="divide-y">
            {transactionHistory?.transactions && transactionHistory.transactions.length > 0 ? (
              transactionHistory.transactions.map((transaction) => (
                <div key={transaction._id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {getTransactionIcon(transaction.transactionType)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${getTransactionColor(transaction.transactionType)}`}>
                        {transaction.creditsAmount > 0 ? "+" : ""}{transaction.creditsAmount} credits
                      </p>
                      <p className="text-sm text-gray-600">
                        Balance: {transaction.balanceAfter}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <History className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-semibold">No transactions yet</p>
                <p className="text-sm mt-1">Your credit transactions will appear here</p>
              </div>
            )}
          </div>
          
          {transactionHistory?.hasMore && (
            <div className="p-4 border-t">
              <button className="w-full text-center text-purple-600 hover:text-purple-700 font-semibold text-sm">
                Load More Transactions
              </button>
            </div>
          )}
        </div>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Link 
            href="/organizer/events/create"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Create Event</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Start using your credits for a new event
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Link>
          
          <Link 
            href="/organizer/payment-settings"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Payment Settings</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Configure auto-reload and payment methods
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Link>
        </div>
      </div>
      
      {/* Purchase Modal */}
      {showPurchaseModal && creditPackages && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">Purchase Credits</h2>
              <p className="text-gray-600 mt-1">Select a credit package to continue</p>
            </div>
            
            <div className="p-6">
              <div className="grid gap-4">
                {creditPackages.map((pkg) => (
                  <div
                    key={pkg._id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPackage?._id === pkg._id
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 hover:border-purple-300"
                    }`}
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold">{pkg.name}</h4>
                          {pkg.popularBadge && (
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-semibold">
                              MOST POPULAR
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
                        <p className="text-sm mt-2">
                          <span className="font-semibold">{pkg.credits} credits</span> for{" "}
                          <span className="font-semibold">${pkg.price}</span>
                        </p>
                        {pkg.savingsPercent > 0 && (
                          <p className="text-sm text-green-600 font-semibold">
                            Save {pkg.savingsPercent}%
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">${pkg.price}</p>
                        <p className="text-sm text-gray-600">
                          ${(pkg.price / pkg.credits).toFixed(3)}/credit
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between mt-6 pt-6 border-t">
                <button
                  onClick={() => {
                    setShowPurchaseModal(false);
                    setSelectedPackage(null);
                  }}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={() => selectedPackage && handlePurchaseCredits(selectedPackage._id, 1)}
                  disabled={!selectedPackage}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Purchase {selectedPackage?.credits || 0} Credits
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}