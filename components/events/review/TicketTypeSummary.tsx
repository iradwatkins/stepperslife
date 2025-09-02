import { Ticket } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { TicketType, TableConfig } from "@/types/events";

interface TicketTypeSummaryProps {
  ticketTypes: TicketType[];
  tables: TableConfig[];
  className?: string;
}

export function TicketTypeSummary({ 
  ticketTypes, 
  tables,
  className 
}: TicketTypeSummaryProps) {
  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4",
      className
    )}>
      <h3 className="font-semibold mb-3 flex items-center text-gray-900 dark:text-white">
        <Ticket className="w-5 h-5 mr-2" />
        Ticket Types
      </h3>
      <div className="space-y-3">
        {ticketTypes.map(ticket => {
          const tablesUsingType = tables.filter(t => t.sourceTicketTypeId === ticket.id);
          const seatsToTables = tablesUsingType.reduce((sum, t) => sum + t.seatCount, 0);
          const publicAvailable = ticket.quantity - seatsToTables;

          return (
            <TicketTypeRow
              key={ticket.id}
              ticket={ticket}
              publicAvailable={publicAvailable}
              seatsToTables={seatsToTables}
            />
          );
        })}
      </div>
    </div>
  );
}

function TicketTypeRow({ 
  ticket, 
  publicAvailable, 
  seatsToTables 
}: { 
  ticket: TicketType; 
  publicAvailable: number; 
  seatsToTables: number;
}) {
  return (
    <div className="border-b border-gray-100 dark:border-gray-700 pb-3 last:border-0">
      <div className="flex justify-between items-start">
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{ticket.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {publicAvailable} available for public sale
            {seatsToTables > 0 && (
              <span className="text-orange-600 dark:text-orange-400">
                {' '}({seatsToTables} allocated to tables)
              </span>
            )}
          </p>
        </div>
        <div className="text-right">
          <p className="font-medium text-gray-900 dark:text-white">
            ${ticket.price.toFixed(2)}
          </p>
          {ticket.hasEarlyBird && (
            <p className="text-sm text-green-600 dark:text-green-400">
              Early: ${ticket.earlyBirdPrice?.toFixed(2)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}