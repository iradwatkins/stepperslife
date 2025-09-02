"use client";

import { useState, useEffect } from "react";
import { Calendar, MapPin, DollarSign, Users, Ticket, Check, ChevronLeft } from "lucide-react";
import { cn, getButtonClass } from "@/lib/utils/cn";
import { FormSection } from "@/components/forms/FormField";
import { Checkbox } from "@/components/forms/Select";
import { EventSummaryCard } from "@/components/events/review/EventSummaryCard";
import { CapacityOverview } from "@/components/events/review/CapacityOverview";
import { TicketTypeSummary } from "@/components/events/review/TicketTypeSummary";
import { TableSummary } from "@/components/events/review/TableSummary";
import { RevenueProjection } from "@/components/events/review/RevenueProjection";
import type { EventData, TicketType, TableConfig } from "@/types/events";

interface ReviewPublishStepProps {
  eventData: EventData;
  ticketTypes: TicketType[];
  tables: TableConfig[];
  onPublish: () => void;
  onBack: () => void;
}

/**
 * Refactored ReviewPublishStep - reduced from 320 lines to ~150 lines
 * Extracted components for each review section
 * Improved separation of concerns
 */
export default function ReviewPublishStepRefactored({
  eventData,
  ticketTypes,
  tables,
  onPublish,
  onBack,
}: ReviewPublishStepProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [publishTimeout, setPublishTimeout] = useState<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (publishTimeout) clearTimeout(publishTimeout);
    };
  }, [publishTimeout]);

  const handlePublish = async () => {
    if (!agreedToTerms) return;
    
    setIsPublishing(true);
    
    // Set timeout for long-running publish
    const timeout = setTimeout(() => {
      setIsPublishing(false);
      alert("Publishing is taking longer than expected. Please check your connection and try again.");
    }, 30000);
    
    setPublishTimeout(timeout);
    onPublish();
  };

  // Calculate revenue
  const { publicTicketRevenue, tableRevenue, totalRevenue } = calculateRevenue(
    ticketTypes,
    tables
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <FormSection
        title="Review & Publish"
        description="Review your event details before publishing"
      />

      {/* Event Summary */}
      <EventSummaryCard eventData={eventData} />

      {/* Ticketing Summary */}
      {eventData.isTicketed ? (
        <>
          <CapacityOverview
            totalCapacity={eventData.totalCapacity || 0}
            ticketTypes={ticketTypes}
            tables={tables}
          />

          <TicketTypeSummary
            ticketTypes={ticketTypes}
            tables={tables}
          />

          {tables.length > 0 && (
            <TableSummary tables={tables} />
          )}

          <RevenueProjection
            publicTicketRevenue={publicTicketRevenue}
            tableRevenue={tableRevenue}
            totalRevenue={totalRevenue}
          />
        </>
      ) : (
        <DoorPriceSummary doorPrice={eventData.doorPrice || 0} />
      )}

      {/* Terms & Conditions */}
      <TermsAndConditions
        agreed={agreedToTerms}
        onChange={setAgreedToTerms}
      />

      {/* Actions */}
      <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onBack}
          className={cn(getButtonClass("ghost"), "flex items-center")}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to {tables.length > 0 ? "Tables" : "Tickets"}
        </button>
        
        <PublishButton
          isPublishing={isPublishing}
          disabled={!agreedToTerms}
          onClick={handlePublish}
        />
      </div>
    </div>
  );
}

// Helper Components
function DoorPriceSummary({ doorPrice }: { doorPrice: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
        Door Price Only
      </h3>
      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
        ${doorPrice.toFixed(2)}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
        Customers will pay at the venue. No online ticket sales.
      </p>
    </div>
  );
}

function TermsAndConditions({ 
  agreed, 
  onChange 
}: { 
  agreed: boolean; 
  onChange: (agreed: boolean) => void; 
}) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
      <label className="flex items-start cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 mr-3 w-4 h-4 text-purple-600 bg-white border-gray-300 rounded focus:ring-purple-500"
        />
        <div className="text-sm">
          <p className="font-medium mb-1 text-gray-900 dark:text-white">
            I agree to the terms and conditions
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            By publishing this event, you agree to our event hosting terms, payment processing 
            agreement, and confirm that all information provided is accurate. Platform fees will 
            apply to all ticket sales.
          </p>
        </div>
      </label>
    </div>
  );
}

function PublishButton({ 
  isPublishing, 
  disabled, 
  onClick 
}: { 
  isPublishing: boolean; 
  disabled: boolean; 
  onClick: () => void; 
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isPublishing}
      className={cn(
        "flex items-center px-6 py-3 rounded-lg font-medium transition-colors",
        !disabled && !isPublishing
          ? "bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
          : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
      )}
    >
      {isPublishing ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
          Publishing Event...
        </div>
      ) : (
        <>
          <Check className="w-5 h-5 mr-2" />
          Publish Event
        </>
      )}
    </button>
  );
}

// Utility Functions
function calculateRevenue(ticketTypes: TicketType[], tables: TableConfig[]) {
  const publicTicketRevenue = ticketTypes.reduce((sum, ticket) => {
    const tablesUsingSeat = tables
      .filter(t => t.sourceTicketTypeId === ticket.id)
      .reduce((seats, table) => seats + table.seatCount, 0);
    const availableQuantity = ticket.quantity - tablesUsingSeat;
    return sum + (availableQuantity * ticket.price);
  }, 0);

  const tableRevenue = tables.reduce((sum, table) => sum + table.price, 0);
  const totalRevenue = publicTicketRevenue + tableRevenue;

  return { publicTicketRevenue, tableRevenue, totalRevenue };
}