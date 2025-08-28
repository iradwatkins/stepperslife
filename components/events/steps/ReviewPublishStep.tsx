"use client";

import { useState } from "react";
import { Calendar, MapPin, DollarSign, Users, Ticket, Check, ChevronLeft, AlertTriangle } from "lucide-react";
import type { EventData } from "../SingleEventFlow";
import type { TicketType, TableConfig } from "@/types/events";

interface ReviewPublishStepProps {
  eventData: EventData;
  ticketTypes: TicketType[];
  tables: TableConfig[];
  onPublish: () => void;
  onBack: () => void;
}

export default function ReviewPublishStep({
  eventData,
  ticketTypes,
  tables,
  onPublish,
  onBack,
}: ReviewPublishStepProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handlePublish = async () => {
    if (!agreedToTerms) return;
    
    setIsPublishing(true);
    // The actual publish will be handled by the parent component
    onPublish();
  };

  // Calculate totals
  const totalCapacity = eventData.totalCapacity || 0;
  const totalTableSeats = tables.reduce((sum, table) => sum + table.seatCount, 0);
  const totalPublicTickets = eventData.isTicketed 
    ? ticketTypes.reduce((sum, ticket) => sum + ticket.quantity, 0) - totalTableSeats
    : 0;

  // Revenue projections
  const publicTicketRevenue = ticketTypes.reduce((sum, ticket) => {
    const availableQuantity = ticket.quantity - 
      tables.filter(t => t.sourceTicketTypeId === ticket.id)
        .reduce((seats, table) => seats + table.seatCount, 0);
    return sum + (availableQuantity * ticket.price);
  }, 0);

  const tableRevenue = tables.reduce((sum, table) => sum + table.price, 0);
  const totalPotentialRevenue = publicTicketRevenue + tableRevenue;

  // Format date and time
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Review & Publish</h2>
        <p className="text-gray-600">Review your event details before publishing</p>
      </div>

      {/* Event Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-4">{eventData.name}</h3>
        <p className="text-gray-700 mb-4">{eventData.description}</p>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-start">
            <Calendar className="w-4 h-4 mr-2 mt-0.5 text-blue-600" />
            <div>
              <p className="font-medium">{formatDate(eventData.eventDate)}</p>
              <p className="text-gray-600">
                {formatTime(eventData.eventTime)}
                {eventData.endTime && ` - ${formatTime(eventData.endTime)}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <MapPin className="w-4 h-4 mr-2 mt-0.5 text-blue-600" />
            <div>
              <p className="font-medium">{eventData.location}</p>
              <p className="text-gray-600">
                {eventData.address}, {eventData.city}, {eventData.state} {eventData.postalCode}
              </p>
            </div>
          </div>
        </div>

        {eventData.categories.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {eventData.categories.map(cat => (
              <span key={cat} className="px-2 py-1 bg-white rounded-full text-xs">
                {cat.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Ticketing Summary */}
      {eventData.isTicketed ? (
        <>
          {/* Capacity Overview */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Capacity & Allocation
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="font-medium">Total Venue Capacity</span>
                <span className="font-bold text-lg">{totalCapacity}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Public Tickets Available</span>
                <span className="text-green-600">{totalPublicTickets}</span>
              </div>
              {totalTableSeats > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span>Reserved for Tables</span>
                  <span className="text-orange-600">{totalTableSeats}</span>
                </div>
              )}
            </div>
          </div>

          {/* Ticket Types */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center">
              <Ticket className="w-5 h-5 mr-2" />
              Ticket Types
            </h3>
            <div className="space-y-3">
              {ticketTypes.map(ticket => {
                const tablesUsingType = tables.filter(t => t.sourceTicketTypeId === ticket.id);
                const seatsToTables = tablesUsingType.reduce((sum, t) => sum + t.seatCount, 0);
                const publicAvailable = ticket.quantity - seatsToTables;

                return (
                  <div key={ticket.id} className="border-b pb-3 last:border-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{ticket.name}</p>
                        <p className="text-sm text-gray-600">
                          {publicAvailable} available for public sale
                          {seatsToTables > 0 && (
                            <span className="text-orange-600">
                              {' '}({seatsToTables} allocated to tables)
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${ticket.price}</p>
                        {ticket.hasEarlyBird && (
                          <p className="text-sm text-green-600">
                            Early: ${ticket.earlyBirdPrice}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tables (if any) */}
          {tables.length > 0 && (
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Private Table Sales
              </h3>
              <div className="space-y-3">
                {tables.map(table => (
                  <div key={table.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{table.name}</p>
                      <p className="text-sm text-gray-600">
                        {table.seatCount} seats from {table.sourceTicketTypeName}
                      </p>
                    </div>
                    <p className="font-medium">${table.price}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-3 bg-amber-50 rounded text-sm text-amber-800">
                <AlertTriangle className="inline w-4 h-4 mr-1" />
                Tables are for private sales only and won't appear on the public event page
              </div>
            </div>
          )}

          {/* Revenue Projection */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold mb-3 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Revenue Projection
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Public Ticket Sales</span>
                <span>${publicTicketRevenue.toFixed(2)}</span>
              </div>
              {tableRevenue > 0 && (
                <div className="flex justify-between">
                  <span>Private Table Sales</span>
                  <span>${tableRevenue.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-2 border-t">
                <span>Total Potential Revenue</span>
                <span className="text-green-600">${totalPotentialRevenue.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Door Price Only</h3>
          <p className="text-2xl font-bold text-green-600">
            ${eventData.doorPrice?.toFixed(2) || "0.00"}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Customers will pay at the venue. No online ticket sales.
          </p>
        </div>
      )}

      {/* Terms & Conditions */}
      <div className="bg-gray-50 border rounded-lg p-4">
        <label className="flex items-start">
          <input
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="mt-1 mr-3"
          />
          <div className="text-sm">
            <p className="font-medium mb-1">I agree to the terms and conditions</p>
            <p className="text-gray-600">
              By publishing this event, you agree to our event hosting terms, payment processing 
              agreement, and confirm that all information provided is accurate. Platform fees will 
              apply to all ticket sales.
            </p>
          </div>
        </label>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-6 border-t">
        <button
          onClick={onBack}
          className="flex items-center px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to {tables.length > 0 ? "Tables" : "Tickets"}
        </button>
        <button
          onClick={handlePublish}
          disabled={!agreedToTerms || isPublishing}
          className={`flex items-center px-6 py-3 rounded-lg font-medium ${
            agreedToTerms && !isPublishing
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isPublishing ? (
            <>Publishing...</>
          ) : (
            <>
              <Check className="w-5 h-5 mr-2" />
              Publish Event
            </>
          )}
        </button>
      </div>
    </div>
  );
}