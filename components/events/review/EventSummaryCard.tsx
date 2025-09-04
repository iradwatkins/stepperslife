import { Calendar, MapPin } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { EventData } from "@/types/events";

interface EventSummaryCardProps {
  eventData: EventData;
  className?: string;
}

export function EventSummaryCard({ eventData, className }: EventSummaryCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className={cn(
      "bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20",
      "p-6 rounded-lg border border-cyan-200 dark:border-cyan-800",
      className
    )}>
      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        {eventData.name}
      </h3>
      <p className="text-gray-700 dark:text-gray-300 mb-4">
        {eventData.description}
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="flex items-start">
          <Calendar className="w-4 h-4 mr-2 mt-0.5 text-cyan-600 dark:text-cyan-400" />
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {formatDate(eventData.eventDate)}
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              {formatTime(eventData.eventTime)}
              {eventData.endTime && ` - ${formatTime(eventData.endTime)}`}
            </p>
          </div>
        </div>
        
        {!eventData.isSaveTheDate && (
          <div className="flex items-start">
            <MapPin className="w-4 h-4 mr-2 mt-0.5 text-cyan-600 dark:text-cyan-400" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {eventData.location}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {eventData.address}, {eventData.city}, {eventData.state} {eventData.postalCode}
              </p>
            </div>
          </div>
        )}
      </div>

      {eventData.categories.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {eventData.categories.map(cat => (
            <span 
              key={cat} 
              className="px-3 py-1 bg-white dark:bg-gray-800 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
            >
              {cat.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}