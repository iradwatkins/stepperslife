import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface SaveTheDateToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

/**
 * Save the Date toggle component
 * Allows events to be announced without venue details
 */
export function SaveTheDateToggle({ 
  checked, 
  onChange, 
  className 
}: SaveTheDateToggleProps) {
  return (
    <div className={cn(
      "p-4 rounded-lg border transition-colors",
      checked 
        ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700"
        : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700",
      className
    )}>
      <label className="flex items-start cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 mr-3 w-4 h-4 text-yellow-600 bg-white border-gray-300 rounded focus:ring-yellow-500 dark:focus:ring-yellow-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          suppressHydrationWarning
        />
        <div className="flex-1">
          <div className="flex items-center font-medium text-gray-900 dark:text-white">
            <CalendarIcon className="w-4 h-4 mr-2 text-yellow-600 dark:text-yellow-400" />
            Save the Date
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Check this if you're announcing the event but don't have a venue yet. 
            The location fields will be hidden and you can update them later.
          </p>
          {checked && (
            <div className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded text-xs text-yellow-800 dark:text-yellow-300">
              ✨ Perfect for early announcements! You can add venue details anytime before the event.
            </div>
          )}
        </div>
      </label>
    </div>
  );
}