"use client";

import { Calendar, CalendarDays, Bookmark } from "lucide-react";

interface EventTypeSelectorProps {
  onSelect: (type: "single" | "multi_day") => void;
}

export default function EventTypeSelector({ onSelect }: EventTypeSelectorProps) {
  const eventTypes = [
    {
      id: "single",
      title: "Single Event",
      description: "One-time event with a specific date, time, and location",
      icon: Calendar,
      examples: "Workshop, Party, Class, Competition",
      color: "blue",
    },
    {
      id: "multi_day",
      title: "Multi-Day Event",
      description: "Festival or series spanning multiple days with bundle options",
      icon: CalendarDays,
      examples: "Weekend Festival, Conference, Retreat",
      color: "purple",
    },
  ] as const;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Event</h1>
        <p className="text-gray-600">Choose the type of event you want to create</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {eventTypes.map((type) => {
          const Icon = type.icon;
          const colorClasses = {
            blue: "hover:border-blue-500 hover:bg-blue-50",
            purple: "hover:border-purple-500 hover:bg-purple-50",
          };

          return (
            <button
              key={type.id}
              onClick={() => onSelect(type.id as any)}
              className={`p-6 border-2 border-gray-200 rounded-lg transition-all cursor-pointer ${
                colorClasses[type.color]
              }`}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <Icon className="w-12 h-12 text-gray-600" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">{type.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                  <p className="text-xs text-gray-500 italic">{type.examples}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}