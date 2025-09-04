"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Calendar24Props {
  date: Date | undefined
  time: string
  onDateChange: (date: Date | undefined) => void
  onTimeChange: (time: string) => void
  dateLabel?: string
  timeLabel?: string
  minDate?: Date
}

export function Calendar24({
  date,
  time,
  onDateChange,
  onTimeChange,
  dateLabel = "Date",
  timeLabel = "Time",
  minDate = new Date()
}: Calendar24Props) {
  // Format date for input field (YYYY-MM-DD in local time)
  const formatDateForInput = (date: Date | undefined) => {
    if (!date) return ""
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const dateString = formatDateForInput(date)
  const minDateString = formatDateForInput(minDate)

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-3">
        <Label htmlFor="date-picker" className="px-1">
          {dateLabel}
        </Label>
        <Input
          type="date"
          id="date-picker"
          value={dateString}
          min={minDateString}
          onChange={(e) => {
            if (!e.target.value) {
              onDateChange(undefined)
              return
            }
            // Parse the date string and create a date in local time
            const [year, month, day] = e.target.value.split('-').map(Number)
            // Ensure we create date in local timezone, not UTC
            const newDate = new Date(year, month - 1, day, 12, 0, 0, 0) // Set to noon to avoid date shift issues
            onDateChange(newDate)
          }}
          className="w-40"
        />
      </div>
      <div className="flex flex-col gap-3">
        <Label htmlFor="time-picker" className="px-1">
          {timeLabel}
        </Label>
        <Input
          type="time"
          id="time-picker"
          step="1800"
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
          className="w-32 bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
        />
      </div>
    </div>
  )
}