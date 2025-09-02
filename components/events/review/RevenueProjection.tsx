import { DollarSign } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface RevenueProjectionProps {
  publicTicketRevenue: number;
  tableRevenue: number;
  totalRevenue: number;
  className?: string;
}

export function RevenueProjection({ 
  publicTicketRevenue, 
  tableRevenue, 
  totalRevenue,
  className 
}: RevenueProjectionProps) {
  return (
    <div className={cn(
      "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
      "border border-green-200 dark:border-green-800 rounded-lg p-4",
      className
    )}>
      <h3 className="font-semibold mb-3 flex items-center text-gray-900 dark:text-white">
        <DollarSign className="w-5 h-5 mr-2" />
        Revenue Projection
      </h3>
      <div className="space-y-2 text-sm">
        <RevenueRow 
          label="Public Ticket Sales" 
          amount={publicTicketRevenue} 
        />
        {tableRevenue > 0 && (
          <RevenueRow 
            label="Private Table Sales" 
            amount={tableRevenue} 
          />
        )}
        <div className="flex justify-between font-bold text-base pt-2 border-t border-green-200 dark:border-green-700">
          <span className="text-gray-900 dark:text-white">Total Potential Revenue</span>
          <span className="text-green-600 dark:text-green-400">
            ${totalRevenue.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}

function RevenueRow({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex justify-between text-gray-700 dark:text-gray-300">
      <span>{label}</span>
      <span className="font-medium">${amount.toFixed(2)}</span>
    </div>
  );
}