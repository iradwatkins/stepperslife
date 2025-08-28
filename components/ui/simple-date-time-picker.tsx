"use client"

import * as React from "react"
import { Calendar, Clock } from "lucide-react"

interface SimpleDateTimePickerProps {
  date: string
  time: string
  onDateChange: (date: string) => void
  onTimeChange: (time: string) => void
  dateLabel?: string
  timeLabel?: string
  minDate?: string
  dateError?: string
  timeError?: string
}

export function SimpleDateTimePicker({
  date,
  time,
  onDateChange,
  onTimeChange,
  dateLabel = "Date",
  timeLabel = "Time",
  minDate = new Date().toISOString().split("T")[0],
  dateError,
  timeError
}: SimpleDateTimePickerProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Date Picker */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          <Calendar className="inline w-4 h-4 mr-1" />
          {dateLabel}
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          min={minDate}
          className={`
            w-full px-4 py-2.5 
            border rounded-lg 
            bg-white
            text-gray-900
            placeholder-gray-400
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            transition-all duration-200
            ${dateError ? "border-red-500" : "border-gray-300"}
            cursor-pointer
            [&::-webkit-calendar-picker-indicator]:cursor-pointer
            [&::-webkit-calendar-picker-indicator]:filter-none
            [&::-webkit-calendar-picker-indicator]:opacity-100
          `}
          style={{
            colorScheme: 'light',
          }}
        />
        {dateError && <p className="text-red-500 text-xs mt-1">{dateError}</p>}
      </div>

      {/* Time Picker */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          <Clock className="inline w-4 h-4 mr-1" />
          {timeLabel}
        </label>
        <input
          type="time"
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
          className={`
            w-full px-4 py-2.5 
            border rounded-lg 
            bg-white
            text-gray-900
            placeholder-gray-400
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            transition-all duration-200
            ${timeError ? "border-red-500" : "border-gray-300"}
            cursor-pointer
            [&::-webkit-calendar-picker-indicator]:cursor-pointer
            [&::-webkit-calendar-picker-indicator]:filter-none
            [&::-webkit-calendar-picker-indicator]:opacity-100
          `}
          style={{
            colorScheme: 'light',
          }}
          step="900" // 15 minute intervals
        />
        {timeError && <p className="text-red-500 text-xs mt-1">{timeError}</p>}
      </div>
    </div>
  )
}