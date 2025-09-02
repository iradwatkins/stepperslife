import { Users, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { TableConfig } from "@/types/events";

interface TableSummaryProps {
  tables: TableConfig[];
  className?: string;
}

export function TableSummary({ tables, className }: TableSummaryProps) {
  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4",
      className
    )}>
      <h3 className="font-semibold mb-3 flex items-center text-gray-900 dark:text-white">
        <Users className="w-5 h-5 mr-2" />
        Private Table Sales
      </h3>
      <div className="space-y-3">
        {tables.map(table => (
          <TableRow key={table.id} table={table} />
        ))}
      </div>
      <PrivateTableNotice />
    </div>
  );
}

function TableRow({ table }: { table: TableConfig }) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <p className="font-medium text-gray-900 dark:text-white">
          {table.name}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {table.seatCount} seats from {table.sourceTicketTypeName}
        </p>
      </div>
      <p className="font-medium text-gray-900 dark:text-white">
        ${table.price.toFixed(2)}
      </p>
    </div>
  );
}

function PrivateTableNotice() {
  return (
    <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded text-sm">
      <div className="flex items-start">
        <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <p className="text-amber-800 dark:text-amber-300">
          Tables are for private sales only and won't appear on the public event page
        </p>
      </div>
    </div>
  );
}