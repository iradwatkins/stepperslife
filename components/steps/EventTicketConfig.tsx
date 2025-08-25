"use client";

import React from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import TicketConfigurationPanel, { TicketType } from "@/components/TicketConfigurationPanel";

interface EventTicketConfigProps {
  form: any;
}

export default function EventTicketConfig({ form }: EventTicketConfigProps) {
  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Configure Your Tickets</h3>
        <p className="text-sm text-gray-600">
          Set up different ticket types, pricing, and quantities for your event.
          You can create individual tickets or table/group packages.
        </p>
      </div>

      <FormField
        control={form.control}
        name="tickets"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <TicketConfigurationPanel
                value={field.value as TicketType[]}
                onChange={field.onChange}
                eventMode={form.watch("eventMode")}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}