"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface Calendar24Props {
  date: Date | undefined
  time: string
  onDateChange: (date: Date | undefined) => void
  onTimeChange: (time: string) => void
  dateLabel?: string
  timeLabel?: string
  minDate?: Date
  dateError?: string
  timeError?: string
}

export function Calendar24({
  date,
  time,
  onDateChange,
  onTimeChange,
  dateLabel = "Date",
  timeLabel = "Time",
  minDate = new Date(),
  dateError,
  timeError
}: Calendar24Props) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-3">
        <Label htmlFor="date-picker" className="px-1">
          {dateLabel}
        </Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              id="date-picker"
              className={`w-32 justify-between font-normal ${
                dateError ? "border-red-500" : ""
              }`}
            >
              {date ? date.toLocaleDateString() : "Select date"}
              <ChevronDownIcon className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              fromDate={minDate}
              onSelect={(selectedDate) => {
                onDateChange(selectedDate)
                setOpen(false)
              }}
              disabled={(date) => date < minDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {dateError && <p className="text-red-500 text-sm">{dateError}</p>}
      </div>
      <div className="flex flex-col gap-3">
        <Label htmlFor="time-picker" className="px-1">
          {timeLabel}
        </Label>
        <Input
          type="time"
          id="time-picker"
          step="900"
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
          className={`bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none ${
            timeError ? "border-red-500" : ""
          }`}
        />
        {timeError && <p className="text-red-500 text-sm">{timeError}</p>}
      </div>
    </div>
  )
}