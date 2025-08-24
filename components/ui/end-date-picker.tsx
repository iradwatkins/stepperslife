"use client";

import React, { useState, useRef, useEffect } from 'react';
import { format, addDays, getDaysInMonth, startOfMonth, getDay, isSameDay, isAfter, isBefore } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EndDatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  startDate: Date;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function EndDatePicker({
  value,
  onChange,
  startDate,
  placeholder = "Select end date",
  disabled = false,
  className
}: EndDatePickerProps) {
  const [showDatepicker, setShowDatepicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(startDate.getMonth());
  const [currentYear, setCurrentYear] = useState(startDate.getFullYear());
  const pickerRef = useRef<HTMLDivElement>(null);

  // Set default to day after start date if no value
  useEffect(() => {
    if (!value && startDate) {
      const defaultEndDate = addDays(startDate, 1);
      onChange(defaultEndDate);
    }
  }, [startDate]);

  // Close picker when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowDatepicker(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysInCurrentMonth = () => {
    return getDaysInMonth(new Date(currentYear, currentMonth));
  };

  const getBlankDays = () => {
    const firstDayOfMonth = startOfMonth(new Date(currentYear, currentMonth));
    const dayOfWeek = getDay(firstDayOfMonth);
    return Array.from({ length: dayOfWeek }, (_, i) => i);
  };

  const getDaysArray = () => {
    const daysInMonth = getDaysInCurrentMonth();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const isToday = (day: number) => {
    const today = new Date();
    const dateToCheck = new Date(currentYear, currentMonth, day);
    return isSameDay(today, dateToCheck);
  };

  const isSelected = (day: number) => {
    if (!value) return false;
    const dateToCheck = new Date(currentYear, currentMonth, day);
    return isSameDay(value, dateToCheck);
  };

  const isDisabledDate = (day: number) => {
    const dateToCheck = new Date(currentYear, currentMonth, day);
    // End date must be after start date
    return !isAfter(dateToCheck, startDate);
  };

  const handleDateSelect = (day: number) => {
    const selectedDate = new Date(currentYear, currentMonth, day);
    if (!isDisabledDate(day)) {
      onChange(selectedDate);
      setShowDatepicker(false);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
  };

  const formatDisplayDate = () => {
    if (!value) return '';
    return format(value, 'EEE, MMM d, yyyy');
  };

  return (
    <div className={cn("relative", className)} ref={pickerRef}>
      <div className="relative">
        <input
          type="text"
          readOnly
          value={formatDisplayDate()}
          onClick={() => !disabled && setShowDatepicker(!showDatepicker)}
          disabled={disabled}
          className={cn(
            "w-full pl-4 pr-10 py-3 leading-none rounded-lg shadow-sm",
            "focus:outline-none focus:shadow-outline text-gray-600 font-medium",
            "cursor-pointer bg-white border border-gray-200",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          placeholder={placeholder}
        />
        
        <div className="absolute top-0 right-0 flex items-center h-full pr-3">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="mr-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <Calendar className="h-5 w-5 text-gray-400" />
        </div>
      </div>

      {showDatepicker && (
        <div 
          className="absolute z-50 bg-white mt-2 rounded-lg shadow-lg p-4 border border-gray-200"
          style={{ width: '17rem', top: '100%', left: 0 }}
        >
          <div className="flex justify-between items-center mb-2">
            <div>
              <span className="text-lg font-bold text-gray-800">
                {MONTH_NAMES[currentMonth]}
              </span>
              <span className="ml-1 text-lg text-gray-600 font-normal">
                {currentYear}
              </span>
            </div>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="transition ease-in-out duration-100 inline-flex cursor-pointer hover:bg-gray-200 p-1 rounded-full"
              >
                <ChevronLeft className="h-6 w-6 text-gray-500" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="transition ease-in-out duration-100 inline-flex cursor-pointer hover:bg-gray-200 p-1 rounded-full"
              >
                <ChevronRight className="h-6 w-6 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap mb-3 -mx-1">
            {DAYS.map((day) => (
              <div key={day} style={{ width: '14.26%' }} className="px-1">
                <div className="text-gray-800 font-medium text-center text-xs">
                  {day}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap -mx-1">
            {getBlankDays().map((_, index) => (
              <div
                key={`blank-${index}`}
                style={{ width: '14.28%' }}
                className="text-center border p-1 border-transparent text-sm"
              />
            ))}
            
            {getDaysArray().map((day) => {
              const disabled = isDisabledDate(day);
              const selected = isSelected(day);
              const today = isToday(day);
              
              return (
                <div key={day} style={{ width: '14.28%' }} className="px-1 mb-1">
                  <div
                    onClick={() => !disabled && handleDateSelect(day)}
                    className={cn(
                      "cursor-pointer text-center text-sm leading-none rounded-full",
                      "leading-loose transition ease-in-out duration-100 py-1",
                      disabled && "opacity-25 cursor-not-allowed text-gray-400",
                      !disabled && !selected && !today && "text-gray-700 hover:bg-blue-200",
                      today && !selected && "bg-blue-100 text-blue-600",
                      selected && "bg-blue-500 text-white hover:bg-blue-600"
                    )}
                  >
                    {day}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 text-xs text-gray-500 text-center">
            End date must be after {format(startDate, 'MMM d, yyyy')}
          </div>
        </div>
      )}
    </div>
  );
}