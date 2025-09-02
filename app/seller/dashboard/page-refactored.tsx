"use client";

import { useState } from "react";
import { withAuth } from "@/lib/auth/withAuth";
import { useDashboard, TimePeriod } from "@/hooks/data/useDashboardData";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { TransactionTable } from "@/components/dashboard/TransactionTable";
import { PayoutSection } from "@/components/dashboard/PayoutSection";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils/cn";

/**
 * Refactored SellerDashboard - reduced from 637 lines to ~80 lines
 * All logic is now extracted into reusable hooks and components
 */
function SellerDashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("month");
  
  // Single hook call gets all dashboard data
  const {
    stats,
    transactions,
    revenueData,
    revenueTotal,
    payoutInfo,
    canRequestPayout,
    isLoading,
  } = useDashboard(selectedPeriod);

  if (isLoading) {
    return <DashboardLoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader 
        title="Seller Dashboard"
        subtitle="Track your sales and performance"
        period={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Quick Actions */}
        <QuickActions />
        
        {/* Stats Overview */}
        <StatsGrid stats={stats} />
        
        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <RevenueChart 
              data={revenueData}
              total={revenueTotal}
              period={selectedPeriod}
            />
            <TransactionTable 
              transactions={transactions.slice(0, 5)}
              showViewAll
            />
          </TabsContent>
          
          <TabsContent value="transactions">
            <TransactionTable 
              transactions={transactions}
              showPagination
            />
          </TabsContent>
          
          <TabsContent value="payouts">
            <PayoutSection 
              payoutInfo={payoutInfo}
              canRequestPayout={canRequestPayout}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/**
 * Loading skeleton component
 */
function DashboardLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 animate-pulse">
      <div className="h-20 bg-gray-200 dark:bg-gray-800" />
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 dark:bg-gray-800 rounded-lg" />
          ))}
        </div>
        <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-lg" />
      </div>
    </div>
  );
}

// Export with authentication HOC
export default withAuth(SellerDashboardPage);