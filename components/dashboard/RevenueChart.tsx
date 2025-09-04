import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils/cn";
import { TimePeriod } from "@/hooks/data/useDashboardData";

interface RevenueChartProps {
  data: Array<{
    date: string;
    revenue: number;
    tickets?: number;
  }>;
  total: number;
  period: TimePeriod;
  className?: string;
}

export function RevenueChart({ data, total, period, className }: RevenueChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    switch (period) {
      case "week":
        return date.toLocaleDateString("en-US", { weekday: "short" });
      case "month":
        return date.toLocaleDateString("en-US", { day: "numeric", month: "short" });
      case "year":
        return date.toLocaleDateString("en-US", { month: "short" });
      default:
        return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {formatDate(label)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Revenue: {formatCurrency(payload[0].value)}
          </p>
          {payload[0].payload.tickets && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Tickets: {payload[0].payload.tickets}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-lg shadow p-6", className)}>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Revenue Overview
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Track your earnings over time
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(total)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Revenue
            </p>
          </div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              className="text-xs"
              stroke="#9CA3AF"
            />
            <YAxis
              tickFormatter={(value) => `$${value}`}
              className="text-xs"
              stroke="#9CA3AF"
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#00c7fc"
              strokeWidth={2}
              dot={{ fill: "#00c7fc", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}