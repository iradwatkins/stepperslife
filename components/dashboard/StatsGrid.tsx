import { DollarSign, TrendingUp, Calendar, Users } from "lucide-react";
import StatsCard from "./StatsCard";
import { cn } from "@/lib/utils/cn";

interface StatsGridProps {
  stats: {
    totalRevenue: number;
    totalTicketsSold: number;
    activeEvents: number;
    upcomingEvents: number;
    revenueGrowth?: number;
    ticketGrowth?: number;
  };
  className?: string;
}

export function StatsGrid({ stats, className }: StatsGridProps) {
  const statsCards = [
    {
      title: "Total Revenue",
      value: stats.totalRevenue,
      icon: <DollarSign className="w-5 h-5" />,
      gradient: "bg-gradient-to-br from-cyan-500 to-cyan-600",
      prefix: "$",
      decimals: 2,
      change: stats.revenueGrowth ? {
        value: Math.abs(stats.revenueGrowth),
        type: stats.revenueGrowth > 0 ? "increase" : "decrease" as const,
      } : undefined,
    },
    {
      title: "Tickets Sold",
      value: stats.totalTicketsSold,
      icon: <TrendingUp className="w-5 h-5" />,
      gradient: "bg-gradient-to-br from-blue-500 to-blue-600",
      change: stats.ticketGrowth ? {
        value: Math.abs(stats.ticketGrowth),
        type: stats.ticketGrowth > 0 ? "increase" : "decrease" as const,
      } : undefined,
    },
    {
      title: "Active Events",
      value: stats.activeEvents,
      icon: <Calendar className="w-5 h-5" />,
      gradient: "bg-gradient-to-br from-green-500 to-green-600",
    },
    {
      title: "Upcoming Events",
      value: stats.upcomingEvents,
      icon: <Users className="w-5 h-5" />,
      gradient: "bg-gradient-to-br from-orange-500 to-orange-600",
    },
  ];

  return (
    <div className={cn(
      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",
      className
    )}>
      {statsCards.map((card, index) => (
        <StatsCard
          key={index}
          title={card.title}
          value={card.value}
          icon={card.icon}
          gradient={card.gradient}
          prefix={card.prefix}
          decimals={card.decimals}
          change={card.change}
        />
      ))}
    </div>
  );
}