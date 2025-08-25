"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FixedCalendar } from "@/components/ui/fixed-calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EnhancedDateTimePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minDate?: Date;
}

export function EnhancedDateTimePicker({
  value,
  onChange,
  placeholder = "Pick a date and time",
  disabled = false,
  className,
  minDate = new Date(),
}: EnhancedDateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>(
    value ? format(value, "HH:mm") : "09:00"
  );
  
  // Handle client-side only initialization
  React.useEffect(() => {
    setMounted(true);
    if (!value) {
      const defaultDate = new Date();
      defaultDate.setHours(9, 0, 0, 0);
      onChange(defaultDate);
    }
  }, []);

  // Generate time slots (every 30 minutes) in 12-hour format
  const timeSlots = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      const period = hour < 12 ? "AM" : "PM";
      const time24 = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      const time12 = `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
      timeSlots.push({ value: time24, label: time12 });
    }
  }

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      newDate.setHours(hours, minutes, 0, 0);
      onChange(newDate);
    } else {
      onChange(undefined);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (value) {
      const [hours, minutes] = time.split(":").map(Number);
      const newDate = new Date(value);
      newDate.setHours(hours, minutes, 0, 0);
      onChange(newDate);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? (
            format(value, "PPP 'at' h:mm a")
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          <FixedCalendar
            mode="single"
            selected={value}
            onSelect={handleDateSelect}
            disabled={(date) =>
              minDate ? date < new Date(minDate.setHours(0, 0, 0, 0)) : false
            }
            initialFocus
            className="rounded-l-md"
          />
          <div className="border-l">
            <div className="flex items-center justify-center p-3 border-b">
              <Clock className="mr-2 h-4 w-4" />
              <span className="text-sm font-medium">Time</span>
            </div>
            <ScrollArea className="h-72 w-40">
              <div className="p-2">
                {timeSlots.map((slot) => (
                  <Button
                    key={slot.value}
                    variant={selectedTime === slot.value ? "default" : "ghost"}
                    size="sm"
                    className="w-full mb-1 justify-center text-xs"
                    onClick={() => handleTimeSelect(slot.value)}
                  >
                    {slot.label}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}