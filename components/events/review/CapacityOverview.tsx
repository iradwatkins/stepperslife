import { Users } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { TicketType, TableConfig } from "@/types/events";

interface CapacityOverviewProps {
  totalCapacity: number;
  ticketTypes: TicketType[];
  tables: TableConfig[];
  className?: string;
}

export function CapacityOverview({ 
  totalCapacity, 
  ticketTypes, 
  tables,
  className 
}: CapacityOverviewProps) {
  const totalTableSeats = tables.reduce((sum, table) => sum + table.seatCount, 0);
  const totalPublicTickets = ticketTypes.reduce((sum, ticket) => sum + ticket.quantity, 0) - totalTableSeats;

  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4",
      className
    )}>
      <h3 className="font-semibold mb-3 flex items-center text-gray-900 dark:text-white">
        <Users className="w-5 h-5 mr-2" />
        Capacity & Allocation
      </h3>
      <div className="space-y-2">
        <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
          <span className="font-medium text-gray-700 dark:text-gray-300">Total Venue Capacity</span>
          <span className="font-bold text-lg text-gray-900 dark:text-white">{totalCapacity}</span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">Public Tickets Available</span>
          <span className="text-green-600 dark:text-green-400 font-medium">{totalPublicTickets}</span>
        </div>
        {totalTableSeats > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">Reserved for Tables</span>
            <span className="text-orange-600 dark:text-orange-400 font-medium">{totalTableSeats}</span>
          </div>
        )}
      </div>
    </div>
  );
}