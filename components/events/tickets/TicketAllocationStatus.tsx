import { cn } from "@/lib/utils/cn";
import { Info, CheckCircle, AlertCircle } from "lucide-react";

interface TicketAllocationStatusProps {
  totalCapacity: number;
  totalAllocated: number;
  onAutoBalance?: () => void;
  className?: string;
}

export function TicketAllocationStatus({
  totalCapacity,
  totalAllocated,
  onAutoBalance,
  className,
}: TicketAllocationStatusProps) {
  const capacityRemaining = totalCapacity - totalAllocated;
  const isValidAllocation = capacityRemaining === 0;
  const isOverAllocated = capacityRemaining < 0;
  const isUnderAllocated = capacityRemaining > 0;

  const getStatusConfig = () => {
    if (isValidAllocation) {
      return {
        bgColor: "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
        icon: <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />,
        title: "Perfect allocation!",
        textColor: "text-green-800 dark:text-green-200",
      };
    }
    
    if (isUnderAllocated) {
      return {
        bgColor: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
        icon: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
        title: `${capacityRemaining} tickets unallocated (optional)`,
        textColor: "text-blue-800 dark:text-blue-200",
      };
    }
    
    return {
      bgColor: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
      icon: <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />,
      title: `Over capacity by ${Math.abs(capacityRemaining)} tickets`,
      textColor: "text-red-800 dark:text-red-200",
    };
  };

  const config = getStatusConfig();

  return (
    <div className={cn("p-4 rounded-lg border", config.bgColor, className)}>
      <div className="flex justify-between items-center">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
          <div>
            <p className={cn("font-semibold", config.textColor)}>
              {config.title}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Total: {totalAllocated} / {totalCapacity} tickets
            </p>
            {isUnderAllocated && (
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                You can proceed with unallocated tickets or click Auto-Balance to distribute evenly
              </p>
            )}
            {isOverAllocated && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                Please reduce ticket quantities to match venue capacity
              </p>
            )}
          </div>
        </div>
        
        {!isValidAllocation && onAutoBalance && (
          <button
            type="button"
            onClick={onAutoBalance}
            className={cn(
              "px-4 py-2 text-sm bg-white dark:bg-gray-800",
              "border border-gray-300 dark:border-gray-600",
              "rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700",
              "transition-colors flex-shrink-0"
            )}
          >
            Auto-Balance
          </button>
        )}
      </div>
    </div>
  );
}