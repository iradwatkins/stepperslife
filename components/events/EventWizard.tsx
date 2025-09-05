"use client";

import { Calendar, CalendarDays } from "lucide-react";

interface EventWizardProps {
  onSelect: (duration: "single" | "multi") => void;
}

export default function EventWizard({ onSelect }: EventWizardProps) {
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-gray-900 dark:text-white">
          Create New Event
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          How many days will your event run?
        </p>
      </div>

      {/* Simple 2-card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* Single Day Event */}
        <button
          onClick={() => onSelect("single")}
          className="group relative p-8 sm:p-12 border-2 border-gray-200 dark:border-gray-700 rounded-xl 
                     hover:border-cyan-500 dark:hover:border-cyan-400 hover:shadow-lg
                     transition-all duration-200 cursor-pointer bg-white dark:bg-gray-800
                     hover:bg-cyan-50 dark:hover:bg-cyan-900/10"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 rounded-full bg-cyan-100 dark:bg-cyan-900/30 
                          group-hover:bg-cyan-200 dark:group-hover:bg-cyan-800/40 transition-colors">
              <Calendar className="w-12 h-12 text-cyan-600 dark:text-cyan-400" />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Single-Day Event
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your event happens on one day
              </p>
            </div>
          </div>
        </button>

        {/* Multi-Day Event */}
        <button
          onClick={() => onSelect("multi")}
          className="group relative p-8 sm:p-12 border-2 border-gray-200 dark:border-gray-700 rounded-xl 
                     hover:border-purple-500 dark:hover:border-purple-400 hover:shadow-lg
                     transition-all duration-200 cursor-pointer bg-white dark:bg-gray-800
                     hover:bg-purple-50 dark:hover:bg-purple-900/10"
        >
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 rounded-full bg-purple-100 dark:bg-purple-900/30 
                          group-hover:bg-purple-200 dark:group-hover:bg-purple-800/40 transition-colors">
              <CalendarDays className="w-12 h-12 text-purple-600 dark:text-purple-400" />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Multi-Day Event
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your event spans multiple days
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* Helper text */}
      <div className="mt-12 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Don't worry, you can configure all the details in the next step
        </p>
      </div>
    </div>
  );
}