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
  const dateString = date ? date.toISOString().split('T')[0] : ""
  const minDateString = minDate ? minDate.toISOString().split('T')[0] : undefined

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
            const newDate = e.target.value ? new Date(e.target.value + 'T00:00:00') : undefined
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