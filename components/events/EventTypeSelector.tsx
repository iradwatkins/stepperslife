"use client";

import { MapPin, Bookmark, Ticket } from "lucide-react";

export type EventType = 'standard' | 'savedate' | 'ticketed';

interface EventTypeSelectorProps {
  value: EventType;
  onChange: (type: EventType) => void;
  className?: string;
}

export default function EventTypeSelector({ value, onChange, className = "" }: EventTypeSelectorProps) {
  const options = [
    {
      id: 'standard',
      title: 'Post Event',
      subtitle: 'Standard Event',
      description: 'Share full event details with door price',
      icon: MapPin,
      color: 'blue',
    },
    {
      id: 'savedate',
      title: 'Save the Date',
      subtitle: 'Announcement Only',
      description: 'Basic announcement - details coming later',
      icon: Bookmark,
      color: 'yellow',
    },
    {
      id: 'ticketed',
      title: 'Sell Tickets Online',
      subtitle: 'Ticketed Event',
      description: 'Enable online ticket sales & affiliates',
      icon: Ticket,
      color: 'green',
    },
  ];

  const getColorClasses = (color: string, isSelected: boolean) => {
    if (isSelected) {
      switch (color) {
        case 'blue':
          return 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 dark:border-cyan-400';
        case 'yellow':
          return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-400';
        case 'green':
          return 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-400';
        default:
          return '';
      }
    }
    return 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600';
  };

  const getIconColorClasses = (color: string, isSelected: boolean) => {
    if (!isSelected) return 'text-gray-400 dark:text-gray-500';
    
    switch (color) {
      case 'blue':
        return 'text-cyan-600 dark:text-cyan-400';
      case 'yellow':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'green':
        return 'text-green-600 dark:text-green-400';
      default:
        return '';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          What type of event would you like to create?
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Choose how you want to share your event
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.id;
          
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id as EventType)}
              className={`
                relative p-4 border-2 rounded-lg transition-all cursor-pointer text-left
                ${getColorClasses(option.color, isSelected)}
                ${isSelected ? 'ring-2 ring-offset-2 ring-cyan-500 dark:ring-offset-gray-900' : ''}
              `}
              aria-pressed={isSelected}
            >
              {/* Radio indicator */}
              <div className="absolute top-4 right-4">
                <div className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${isSelected 
                    ? 'border-cyan-600 dark:border-cyan-400' 
                    : 'border-gray-300 dark:border-gray-600'}
                `}>
                  {isSelected && (
                    <div className="w-3 h-3 rounded-full bg-cyan-600 dark:bg-cyan-400" />
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 pr-8">
                <Icon className={`w-6 h-6 mt-0.5 ${getIconColorClasses(option.color, isSelected)}`} />
                <div className="flex-1">
                  <h4 className={`font-semibold ${
                    isSelected 
                      ? 'text-gray-900 dark:text-white' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {option.title}
                  </h4>
                  <p className={`text-xs mt-0.5 ${
                    isSelected
                      ? 'text-gray-700 dark:text-gray-300'
                      : 'text-gray-500 dark:text-gray-500'
                  }`}>
                    {option.subtitle}
                  </p>
                  <p className={`text-sm mt-2 ${
                    isSelected
                      ? 'text-gray-600 dark:text-gray-400'
                      : 'text-gray-500 dark:text-gray-500'
                  }`}>
                    {option.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Helper text based on selection */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {value === 'standard' && (
            <>
              <span className="font-semibold">Standard Event:</span> Perfect for sharing complete event details. 
              Attendees will see the door price and all information.
            </>
          )}
          {value === 'savedate' && (
            <>
              <span className="font-semibold">Save the Date:</span> Great for announcements when you don't have all details yet. 
              You can upgrade to a full event later.
            </>
          )}
          {value === 'ticketed' && (
            <>
              <span className="font-semibold">Ticketed Event:</span> Full online sales with payment processing. 
              Includes affiliate program and table sales automatically.
            </>
          )}
        </p>
      </div>
    </div>
  );
}