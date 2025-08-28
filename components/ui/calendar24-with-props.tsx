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

interface Calendar24WithPropsProps {
  date: string
  time: string
  onDateChange: (date: string) => void
  onTimeChange: (time: string) => void
  dateError?: string
  timeError?: string
  minDate?: string
}

export function Calendar24WithProps({
  date,
  time,
  onDateChange,
  onTimeChange,
  dateError,
  timeError,
  minDate
}: Calendar24WithPropsProps) {
  console.log("🎯 Calendar24WithProps is rendering!")
  const [open, setOpen] = React.useState(false)
  
  // Convert string date to Date object
  const selectedDate = date ? new Date(date) : undefined
  const minDateObj = minDate ? new Date(minDate) : new Date()

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-3">
        <Label htmlFor="date-picker" className="px-1">
          Event Date *
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
              {selectedDate ? selectedDate.toLocaleDateString() : "Select date"}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              captionLayout="dropdown"
              onSelect={(date) => {
                if (date) {
                  onDateChange(date.toISOString().split('T')[0])
                }
                setOpen(false)
              }}
              disabled={(date) => date < minDateObj}
            />
          </PopoverContent>
        </Popover>
        {dateError && <p className="text-red-500 text-xs mt-1">{dateError}</p>}
      </div>
      <div className="flex flex-col gap-3">
        <Label htmlFor="time-picker" className="px-1">
          Start Time *
        </Label>
        <Input
          type="time"
          id="time-picker"
          step="1"
          value={time || "19:00:00"}
          onChange={(e) => onTimeChange(e.target.value)}
          className={`bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none ${
            timeError ? "border-red-500" : ""
          }`}
        />
        {timeError && <p className="text-red-500 text-xs mt-1">{timeError}</p>}
      </div>
    </div>
  )
}