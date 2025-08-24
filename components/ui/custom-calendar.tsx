"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function CustomCalendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}

// Enhanced calendar with better styling for date ranges
export function EnhancedRangeCalendar({
  className,
  selected,
  onSelect,
  ...props
}: {
  className?: string;
  selected?: DateRange;
  onSelect?: (range: DateRange | undefined) => void;
  [key: string]: any;
}) {
  return (
    <div className={cn("p-3", className)}>
      <style jsx global>{`
        /* Fix day header alignment */
        .rdp-head_cell {
          width: 40px !important;
          text-align: center !important;
          padding: 0 !important;
          font-weight: 500 !important;
        }
        
        .rdp-cell {
          width: 40px !important;
          height: 40px !important;
          text-align: center !important;
          padding: 0 !important;
        }
        
        .rdp-day {
          width: 40px !important;
          height: 40px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          margin: 0 !important;
        }
        
        /* Highlight selected range */
        .rdp-day_selected {
          background-color: hsl(var(--primary)) !important;
          color: white !important;
          font-weight: 600 !important;
        }
        
        .rdp-day_selected:hover {
          background-color: hsl(var(--primary)) !important;
          opacity: 0.9;
        }
        
        /* Range middle styling */
        .rdp-day_range_middle {
          background-color: hsl(var(--primary) / 0.1) !important;
          color: hsl(var(--foreground)) !important;
          border-radius: 0 !important;
        }
        
        /* Range start */
        .rdp-day_range_start {
          background-color: hsl(var(--primary)) !important;
          color: white !important;
          border-radius: 50% !important;
          font-weight: 600 !important;
        }
        
        /* Range end */
        .rdp-day_range_end {
          background-color: hsl(var(--primary)) !important;
          color: white !important;
          border-radius: 50% !important;
          font-weight: 600 !important;
        }
        
        /* Today indicator */
        .rdp-day_today {
          font-weight: 700 !important;
          text-decoration: underline !important;
        }
        
        /* Fix table spacing */
        .rdp-table {
          width: 100% !important;
          border-spacing: 2px !important;
        }
        
        .rdp-tbody {
          display: table-row-group !important;
        }
        
        .rdp-head {
          display: table-header-group !important;
        }
        
        .rdp-head_row, .rdp-row {
          display: table-row !important;
        }
        
        .rdp-months {
          display: flex !important;
          gap: 2rem !important;
        }
      `}</style>
      
      <DayPicker
        mode="range"
        selected={selected}
        onSelect={onSelect}
        showOutsideDays={false}
        numberOfMonths={2}
        className="rdp-custom"
        classNames={{
          months: "rdp-months",
          month: "rdp-month",
          caption: "rdp-caption flex justify-center py-2 relative items-center",
          caption_label: "text-sm font-medium",
          nav: "rdp-nav space-x-1 flex items-center",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "rdp-table w-full border-collapse",
          head: "rdp-head",
          head_row: "rdp-head_row",
          head_cell: "rdp-head_cell text-muted-foreground text-sm",
          body: "rdp-tbody",
          row: "rdp-row",
          cell: "rdp-cell text-center",
          day: "rdp-day inline-flex items-center justify-center rounded-md text-sm transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer",
          day_selected: "rdp-day_selected",
          day_today: "rdp-day_today",
          day_outside: "rdp-day_outside text-muted-foreground opacity-50",
          day_disabled: "text-muted-foreground opacity-50 cursor-not-allowed",
          day_range_start: "rdp-day_range_start",
          day_range_middle: "rdp-day_range_middle",
          day_range_end: "rdp-day_range_end",
          day_hidden: "invisible",
        }}
        components={{
          IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
          IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
        }}
        {...props}
      />
    </div>
  );
}

export { CustomCalendar as Calendar };