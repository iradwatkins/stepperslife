"use client";

import { Calendar, CalendarDays, MapPin, Ticket, DollarSign, Bookmark } from "lucide-react";

interface EventWizardProps {
  onSelect: (option: {
    flow: "single" | "multi";
    isSaveTheDate: boolean;
    isTicketed: boolean;
  }) => void;
}

export default function EventWizard({ onSelect }: EventWizardProps) {
  const options = [
    // Save the Date Options
    {
      id: "save_date_single",
      title: "Save the Date",
      subtitle: "Single Day",
      description: "Announce a date for people to save",
      icon: Bookmark,
      color: "yellow",
      features: ["Basic info only", "City/State location", "No tickets"],
      action: () => onSelect({ flow: "single", isSaveTheDate: true, isTicketed: false }),
    },
    {
      id: "save_date_multi",
      title: "Save the Date",
      subtitle: "Multi-Day",
      description: "Announce dates for a multi-day event",
      icon: Bookmark,
      color: "yellow",
      features: ["Date range", "City/State location", "No tickets"],
      action: () => onSelect({ flow: "multi", isSaveTheDate: true, isTicketed: false }),
    },
    
    // Post Event Options (No Tickets)
    {
      id: "post_single",
      title: "Post Event",
      subtitle: "Single Day - No Tickets",
      description: "Full event details without online sales",
      icon: MapPin,
      color: "blue",
      features: ["Complete details", "Full address", "Door price only"],
      action: () => onSelect({ flow: "single", isSaveTheDate: false, isTicketed: false }),
    },
    {
      id: "post_multi",
      title: "Post Event", 
      subtitle: "Multi-Day - No Tickets",
      description: "Multi-day event without online sales",
      icon: CalendarDays,
      color: "blue",
      features: ["Multiple venues", "Full details", "Door prices"],
      action: () => onSelect({ flow: "multi", isSaveTheDate: false, isTicketed: false }),
    },
    
    // Ticketed Event Options
    {
      id: "ticketed_single",
      title: "Sell Tickets",
      subtitle: "Single Day Event",
      description: "Full event with online ticket sales",
      icon: Ticket,
      color: "green",
      features: ["Online sales", "Affiliates included", "Table sales"],
      action: () => onSelect({ flow: "single", isSaveTheDate: false, isTicketed: true }),
    },
    {
      id: "ticketed_multi",
      title: "Sell Tickets",
      subtitle: "Multi-Day Event",
      description: "Multi-day event with ticket sales",
      icon: DollarSign,
      color: "green",
      features: ["Bundle options", "Affiliates included", "Table sales"],
      action: () => onSelect({ flow: "multi", isSaveTheDate: false, isTicketed: true }),
    },
  ];

  const colorClasses = {
    yellow: "border-yellow-200 dark:border-yellow-800 hover:border-yellow-400 dark:hover:border-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20",
    blue: "border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20",
    green: "border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20",
  };

  const iconColorClasses = {
    yellow: "text-yellow-600 dark:text-yellow-400",
    blue: "text-blue-600 dark:text-blue-400",
    green: "text-green-600 dark:text-green-400",
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-gray-900 dark:text-white">Create New Event</h1>
        <p className="text-gray-600 dark:text-gray-400">Choose the type of event you want to create</p>
      </div>

      {/* Mobile-optimized grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.id}
              onClick={option.action}
              className={`
                p-4 sm:p-6 border-2 rounded-lg transition-all cursor-pointer
                text-left min-h-[180px] sm:min-h-[200px]
                ${colorClasses[option.color]}
              `}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg text-gray-900 dark:text-white">{option.title}</h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-0.5">{option.subtitle}</p>
                  </div>
                  <Icon className={`w-6 h-6 sm:w-8 sm:h-8 ${iconColorClasses[option.color]}`} />
                </div>
                
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3">{option.description}</p>
                
                <div className="mt-auto">
                  <ul className="space-y-1">
                    {option.features.map((feature, idx) => (
                      <li key={idx} className="text-xs text-gray-500 dark:text-gray-500 flex items-center">
                        <span className="mr-1">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Mobile-friendly info boxes */}
      <div className="mt-8 space-y-4">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4 rounded-lg">
          <h4 className="font-semibold text-yellow-900 dark:text-yellow-300 text-sm mb-1">📅 Save the Date</h4>
          <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-400">
            Start with basic info. Upgrade to full event later when you have all details.
          </p>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 dark:text-blue-300 text-sm mb-1">📍 Posted Events</h4>
          <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-400">
            Share complete event details. Attendees pay at the door. Can upgrade to online sales later.
          </p>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
          <h4 className="font-semibold text-green-900 dark:text-green-300 text-sm mb-1">🎫 Ticketed Events</h4>
          <p className="text-xs sm:text-sm text-green-800 dark:text-green-400">
            Full online ticket sales with affiliate program, bundles, and table sales automatically included.
          </p>
        </div>
      </div>
    </div>
  );
}