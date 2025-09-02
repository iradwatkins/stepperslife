import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUserData } from "./useUserData";

export type TimePeriod = "week" | "month" | "year" | "all";

/**
 * Hook for fetching dashboard statistics
 * Encapsulates common dashboard data fetching patterns
 */
export function useDashboardStats(period: TimePeriod = "month") {
  const { userId, isAuthenticated } = useUserData();
  
  const stats = useQuery(
    api.sellers.getDashboardStats,
    isAuthenticated ? { sellerId: userId, period } : "skip"
  );
  
  // Provide default values for loading state
  const defaultStats = {
    totalRevenue: 0,
    totalTicketsSold: 0,
    activeEvents: 0,
    upcomingEvents: 0,
    averageTicketPrice: 0,
    conversionRate: 0,
    revenueGrowth: 0,
    ticketGrowth: 0,
  };
  
  return {
    stats: stats || defaultStats,
    isLoading: stats === undefined && isAuthenticated,
    error: null,
  };
}

/**
 * Hook for fetching recent transactions
 */
export function useRecentTransactions(limit = 10) {
  const { userId, isAuthenticated } = useUserData();
  
  const transactions = useQuery(
    api.sellers.getRecentTransactions,
    isAuthenticated ? { sellerId: userId, limit } : "skip"
  );
  
  return {
    transactions: transactions || [],
    isLoading: transactions === undefined && isAuthenticated,
    isEmpty: transactions?.length === 0,
  };
}

/**
 * Hook for fetching revenue data for charts
 */
export function useRevenueData(period: TimePeriod = "month") {
  const { userId, isAuthenticated } = useUserData();
  
  const revenueData = useQuery(
    api.sellers.getRevenueData,
    isAuthenticated ? { sellerId: userId, period } : "skip"
  );
  
  return {
    data: revenueData || [],
    isLoading: revenueData === undefined && isAuthenticated,
    total: revenueData?.reduce((sum, item) => sum + (item.revenue || 0), 0) || 0,
  };
}

/**
 * Hook for fetching payout information
 */
export function usePayoutInfo() {
  const { userId, isAuthenticated } = useUserData();
  
  const payoutInfo = useQuery(
    api.sellers.getPayoutInfo,
    isAuthenticated ? { sellerId: userId } : "skip"
  );
  
  const defaultPayoutInfo = {
    availableBalance: 0,
    pendingBalance: 0,
    nextPayoutDate: null,
    payoutMethod: null,
    minimumPayout: 50,
  };
  
  return {
    payoutInfo: payoutInfo || defaultPayoutInfo,
    isLoading: payoutInfo === undefined && isAuthenticated,
    canRequestPayout: (payoutInfo?.availableBalance || 0) >= (payoutInfo?.minimumPayout || 50),
  };
}

/**
 * Combined hook for all dashboard data
 * Use this when you need multiple dashboard data points
 */
export function useDashboard(period: TimePeriod = "month") {
  const stats = useDashboardStats(period);
  const transactions = useRecentTransactions();
  const revenue = useRevenueData(period);
  const payout = usePayoutInfo();
  
  const isLoading = stats.isLoading || transactions.isLoading || revenue.isLoading || payout.isLoading;
  
  return {
    stats: stats.stats,
    transactions: transactions.transactions,
    revenueData: revenue.data,
    revenueTotal: revenue.total,
    payoutInfo: payout.payoutInfo,
    canRequestPayout: payout.canRequestPayout,
    isLoading,
  };
}