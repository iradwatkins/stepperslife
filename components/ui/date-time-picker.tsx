"use client"

import * as React from "react"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"

interface DateTimePickerProps {
  value?: Date
  onChange: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Select date and time",
  className,
  disabled = false,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [time, setTime] = React.useState("")

  // Initialize time from existing value
  React.useEffect(() => {
    if (value) {
      const hours = value.getHours().toString().padStart(2, "0")
      const minutes = value.getMinutes().toString().padStart(2, "0")
      setTime(`${hours}:${minutes}`)
    }
  }, [value])

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // If we have a time, apply it to the selected date
      if (time) {
        const [hours, minutes] = time.split(":").map(Number)
        selectedDate.setHours(hours, minutes, 0, 0)
      } else {
        // Default to current time if no time is set
        const now = new Date()
        selectedDate.setHours(now.getHours(), now.getMinutes(), 0, 0)
        const defaultTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
        setTime(defaultTime)
      }
      onChange(selectedDate)
    } else {
      onChange(undefined)
      setTime("")
    }
  }

  const handleTimeChange = (newTime: string) => {
    setTime(newTime)
    if (value && newTime) {
      const [hours, minutes] = newTime.split(":").map(Number)
      if (!isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        const newDate = new Date(value)
        newDate.setHours(hours, minutes, 0, 0)
        onChange(newDate)
      }
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onChange(undefined)
    setTime("")
    setOpen(false)
  }

  return (
    <div className={cn("flex gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "flex-1 justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? (
              format(value, "MMM dd, yyyy 'at' h:mm a")
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleDateSelect}
            disabled={(date) =>
              date < new Date(new Date().setHours(0, 0, 0, 0))
            }
            initialFocus
          />
          <div className="border-t p-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Time:</label>
              <Input
                type="time"
                value={time}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-32"
              />
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                onClick={() => setOpen(false)}
                className="flex-1"
              >
                Done
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      {value && (
        <Button
          variant="outline"
          size="icon"
          onClick={handleClear}
          className="shrink-0 h-10 w-10"
          disabled={disabled}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear date and time</span>
        </Button>
      )}
    </div>
  )
}