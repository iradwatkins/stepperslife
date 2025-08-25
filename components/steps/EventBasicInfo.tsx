"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { EnhancedDateTimePicker } from "@/components/ui/enhanced-date-time-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";

interface EventBasicInfoProps {
  form: any;
}

export default function EventBasicInfo({ form }: EventBasicInfoProps) {
  return (
    <div className="space-y-6">
      {/* Ticket Sales Type */}
      <FormField
        control={form.control}
        name="ticketSalesType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Are you selling tickets for this event?</FormLabel>
            <FormControl>
              <select
                {...field}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="no_tickets">No - Just Posting an Event</option>
                <option value="selling_tickets">Yes - Selling Tickets</option>
                <option value="custom_seating" disabled>Custom Seating (Coming Soon)</option>
              </select>
            </FormControl>
            <FormDescription>
              Choose whether to sell tickets online or just post the event information
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Event Mode for ticketed events */}
      {form.watch("ticketSalesType") === "selling_tickets" && (
        <FormField
          control={form.control}
          name="eventMode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Type</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="single">Single Event</option>
                  <option value="multi_day">Multi-Day Event</option>
                </select>
              </FormControl>
              <FormDescription>
                Multi-day events allow bundling tickets across multiple days
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Save the Date checkbox */}
      {form.watch("ticketSalesType") === "no_tickets" && (
        <FormField
          control={form.control}
          name="isSaveTheDate"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  This is a Save the Date event
                </FormLabel>
                <FormDescription>
                  Save the Date events don't require a specific location yet
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      )}

      {/* Door Price for non-ticketed events */}
      {form.watch("ticketSalesType") === "no_tickets" && (
        <FormField
          control={form.control}
          name="doorPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Door Price</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2">$</span>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    className="pl-6"
                  />
                </div>
              </FormControl>
              <FormDescription>
                Price at the door for walk-in attendees
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Event Name */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Event Name</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter your event name" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Description */}
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea 
                {...field} 
                placeholder="Describe your event..."
                className="min-h-[100px]"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Location */}
      {!form.watch("isSaveTheDate") && (
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input 
                  {...field} 
                  placeholder="Enter event venue or address"
                />
              </FormControl>
              <FormDescription>
                {form.watch("eventMode") === "multi_day" && !form.watch("sameLocation")
                  ? "This will be the location for Day 1. You'll set other locations later."
                  : "Enter the venue name or address"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {/* Same Location checkbox for multi-day events */}
      {form.watch("eventMode") === "multi_day" && (
        <FormField
          control={form.control}
          name="sameLocation"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  All days at the same location?
                </FormLabel>
                <FormDescription>
                  Uncheck if each day will be at a different venue
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
      )}

      {/* Date Selection */}
      {form.watch("eventMode") !== "multi_day" ? (
        <FormField
          control={form.control}
          name="eventDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Date & Time</FormLabel>
              <FormControl>
                <EnhancedDateTimePicker
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select event date and time"
                  minDate={new Date()}
                />
              </FormControl>
              <FormDescription>
                Choose the date and time when your event will take place
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      ) : (
        <FormField
          control={form.control}
          name="eventDateRange"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Date Range</FormLabel>
              <FormControl>
                <DateRangePicker
                  value={field.value as DateRange | undefined}
                  onChange={(range) => {
                    field.onChange(range);
                    // Update eventDate and endDate from range
                    if (range?.from) {
                      form.setValue("eventDate", range.from);
                    }
                    if (range?.to) {
                      form.setValue("endDate", range.to);
                    }
                  }}
                  placeholder="Select event date range"
                  minDate={new Date()}
                  maxDays={30}
                />
              </FormControl>
              <FormDescription>
                Select the start and end dates for your multi-day event (max 30 days)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
}