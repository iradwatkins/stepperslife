"use client"

import * as React from "react"
import { CalendarIcon, PlusIcon, XIcon } from "lucide-react"
import { addDays } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface EventDay {
  date: Date
  time: string
  location?: string
}

interface MultiDayCalendar24Props {
  eventDays: EventDay[]
  onDaysChange: (days: EventDay[]) => void
  sameLocation?: boolean
  defaultLocation?: string
  minDate?: Date
  maxDays?: number
}

export function MultiDayCalendar24({
  eventDays,
  onDaysChange,
  sameLocation = true,
  defaultLocation = "",
  minDate = new Date(),
  maxDays = 30
}: MultiDayCalendar24Props) {
  const [selectedDates, setSelectedDates] = React.useState<Date[]>(
    eventDays.map(d => d.date)
  )

  const minDateString = minDate ? minDate.toISOString().split('T')[0] : undefined
  const maxDateString = addDays(minDate, maxDays).toISOString().split('T')[0]

  const addDay = () => {
    const newDate = selectedDates.length > 0 
      ? addDays(selectedDates[selectedDates.length - 1], 1)
      : minDate
    
    const newDay: EventDay = {
      date: newDate,
      time: "19:00",
      location: sameLocation ? defaultLocation : ""
    }
    
    const updatedDays = [...eventDays, newDay]
    onDaysChange(updatedDays)
    setSelectedDates([...selectedDates, newDate])
  }

  const removeDay = (index: number) => {
    const updatedDays = eventDays.filter((_, i) => i !== index)
    const updatedDates = selectedDates.filter((_, i) => i !== index)
    onDaysChange(updatedDays)
    setSelectedDates(updatedDates)
  }

  const updateDay = (index: number, field: keyof EventDay, value: any) => {
    const updatedDays = [...eventDays]
    updatedDays[index] = { ...updatedDays[index], [field]: value }
    onDaysChange(updatedDays)
    
    if (field === 'date') {
      const updatedDates = [...selectedDates]
      updatedDates[index] = value
      setSelectedDates(updatedDates)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Event Days</Label>
        {eventDays.length < maxDays && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addDay}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Day
          </Button>
        )}
      </div>

      {eventDays.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <CalendarIcon className="w-12 h-12 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">No days added yet</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={addDay}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add First Day
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {eventDays.map((day, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary" className="text-sm">
                Day {index + 1}
              </Badge>
              {eventDays.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeDay(index)}
                >
                  <XIcon className="w-4 h-4 text-red-500" />
                </Button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor={`date-${index}`} className="text-sm">
                  Date
                </Label>
                <Input
                  type="date"
                  id={`date-${index}`}
                  value={day.date ? day.date.toISOString().split('T')[0] : ""}
                  min={minDateString}
                  max={maxDateString}
                  onChange={(e) => {
                    const newDate = e.target.value ? new Date(e.target.value + 'T00:00:00') : new Date()
                    updateDay(index, 'date', newDate)
                  }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor={`time-${index}`} className="text-sm">
                  Time
                </Label>
                <Input
                  type="time"
                  id={`time-${index}`}
                  step="1800"
                  value={day.time}
                  onChange={(e) => updateDay(index, 'time', e.target.value)}
                  className="bg-background"
                />
              </div>
            </div>

            {!sameLocation && (
              <div className="flex flex-col gap-2">
                <Label htmlFor={`location-${index}`} className="text-sm">
                  Location for Day {index + 1}
                </Label>
                <Input
                  id={`location-${index}`}
                  placeholder="Enter venue name or address"
                  value={day.location || ""}
                  onChange={(e) => updateDay(index, 'location', e.target.value)}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {eventDays.length > 0 && eventDays.length < maxDays && (
        <p className="text-xs text-gray-500 text-center">
          You can add up to {maxDays} days for your event. Currently have {eventDays.length} day(s).
        </p>
      )}
    </div>
  )
}