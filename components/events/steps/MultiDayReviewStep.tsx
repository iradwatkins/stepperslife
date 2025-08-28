"use client";

import { Calendar, MapPin, Ticket, Package, Users, DollarSign, AlertCircle } from "lucide-react";
import type { MultiDayEventData, DayConfiguration, Bundle } from "../MultiDayEventFlow";

interface MultiDayReviewStepProps {
  eventData: MultiDayEventData;
  days: DayConfiguration[];
  bundles: Bundle[];
  tables: any[];
  onPublish: () => void;
  onBack: () => void;
}

export default function MultiDayReviewStep({
  eventData,
  days,
  bundles,
  tables,
  onPublish,
  onBack,
}: MultiDayReviewStepProps) {
  // Calculate total tickets across all days
  const totalTickets = days.reduce((sum, day) => 
    sum + day.ticketTypes.reduce((daySum, ticket) => daySum + ticket.quantity, 0), 
  0);

  // Calculate revenue estimates
  const calculateRevenue = () => {
    // Regular ticket revenue
    const ticketRevenue = days.reduce((sum, day) => 
      sum + day.ticketTypes.reduce((daySum, ticket) => {
        const price = ticket.hasEarlyBird && ticket.earlyBirdPrice ? 
          (ticket.earlyBirdPrice + ticket.price) / 2 : // Average of early bird and regular
          ticket.price;
        return daySum + (price * ticket.quantity);
      }, 0), 
    0);

    // Bundle revenue (estimate 20% of available bundles will sell)
    const bundleRevenue = bundles.reduce((sum, bundle) => {
      const estimatedSales = bundle.maxQuantity ? bundle.maxQuantity * 0.2 : 10;
      return sum + (bundle.bundlePrice * estimatedSales);
    }, 0);

    // Table revenue
    const tableRevenue = tables.reduce((sum, table) => 
      sum + (table.price * table.quantity), 
    0);

    return {
      tickets: ticketRevenue,
      bundles: bundleRevenue,
      tables: tableRevenue,
      total: ticketRevenue + bundleRevenue + tableRevenue
    };
  };

  const revenue = calculateRevenue();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-1">Review Your Multi-Day Event</h2>
        <p className="text-gray-600">Please review all details before publishing</p>
      </div>

      {/* Warning Box */}
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
        <div className="text-sm text-yellow-800">
          <p className="font-semibold mb-1">Before you publish:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Once published, ticket prices cannot be increased</li>
            <li>Event dates and times cannot be changed</li>
            <li>You can still add more tickets or modify quantities</li>
          </ul>
        </div>
      </div>

      {/* Basic Event Info */}
      <div className="border rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-lg">Event Details</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Event Name</p>
            <p className="font-medium">{eventData.name}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600">Duration</p>
            <p className="font-medium flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              {days.length} days ({new Date(eventData.startDate).toLocaleDateString()} - {new Date(eventData.endDate).toLocaleDateString()})
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-1">Description</p>
          <p className="text-gray-700">{eventData.description}</p>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-1">Categories</p>
          <div className="flex flex-wrap gap-2">
            {eventData.categories.map(cat => (
              <span key={cat} className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                {cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            ))}
          </div>
        </div>

        {eventData.sameLocation && (
          <div>
            <p className="text-sm text-gray-600 mb-1 flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              Location (all days)
            </p>
            <p className="font-medium">{eventData.location}</p>
            <p className="text-sm text-gray-600">
              {eventData.address}, {eventData.city}, {eventData.state} {eventData.postalCode}
            </p>
          </div>
        )}
      </div>

      {/* Day Configuration Summary */}
      {eventData.isTicketed && (
        <div className="border rounded-lg p-6 space-y-4">
          <h3 className="font-semibold text-lg flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Daily Schedule & Tickets
          </h3>
          
          <div className="space-y-3">
            {days.map((day) => (
              <div key={day.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium">{day.dayLabel}</h4>
                    <p className="text-sm text-gray-600">
                      {day.startTime} - {day.endTime || "Late"}
                    </p>
                    {!eventData.sameLocation && day.location && (
                      <p className="text-sm text-gray-600 mt-1">
                        <MapPin className="inline w-3 h-3 mr-1" />
                        {day.location}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {day.ticketTypes.map((ticket) => (
                    <div key={ticket.id} className="text-sm">
                      <span className="font-medium">{ticket.name}</span>
                      <span className="text-gray-600"> - ${ticket.price} ({ticket.quantity} available)</span>
                      {ticket.hasEarlyBird && (
                        <span className="text-green-600 block text-xs">
                          Early bird: ${ticket.earlyBirdPrice} until {new Date(ticket.earlyBirdEndDate!).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bundles Summary */}
      {bundles.length > 0 && (
        <div className="border rounded-lg p-6 space-y-4">
          <h3 className="font-semibold text-lg flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Ticket Bundles ({bundles.length})
          </h3>
          
          <div className="space-y-3">
            {bundles.map((bundle) => (
              <div key={bundle.id} className="p-3 bg-gray-50 rounded">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium">{bundle.name}</h5>
                    {bundle.description && (
                      <p className="text-sm text-gray-600">{bundle.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Includes: {bundle.selectedTickets.map(t => `${t.dayLabel} - ${t.ticketName}`).join(", ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${bundle.bundlePrice}</p>
                    {bundle.maxQuantity && (
                      <p className="text-xs text-gray-500">Max: {bundle.maxQuantity}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tables Summary */}
      {tables.length > 0 && (
        <div className="border rounded-lg p-6 space-y-4">
          <h3 className="font-semibold text-lg flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Private Tables ({tables.length})
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            {tables.map((table, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded">
                <p className="font-medium">{table.name}</p>
                <p className="text-sm text-gray-600">
                  {table.seatCount} seats - ${table.price}
                  {table.quantity > 1 && ` (${table.quantity} available)`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revenue Estimate */}
      {eventData.isTicketed && (
        <div className="border rounded-lg p-6 bg-green-50 border-green-200">
          <h3 className="font-semibold text-lg flex items-center mb-4">
            <DollarSign className="w-5 h-5 mr-2" />
            Potential Revenue
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Tickets Available</p>
              <p className="text-2xl font-bold">{totalTickets.toLocaleString()}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">Estimated Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                ${revenue.total.toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="mt-4 space-y-1 text-sm">
            <p className="flex justify-between">
              <span className="text-gray-600">Individual Tickets:</span>
              <span>${revenue.tickets.toLocaleString()}</span>
            </p>
            {revenue.bundles > 0 && (
              <p className="flex justify-between">
                <span className="text-gray-600">Bundle Sales (est.):</span>
                <span>${revenue.bundles.toLocaleString()}</span>
              </p>
            )}
            {revenue.tables > 0 && (
              <p className="flex justify-between">
                <span className="text-gray-600">Table Sales:</span>
                <span>${revenue.tables.toLocaleString()}</span>
              </p>
            )}
          </div>
          
          <p className="text-xs text-gray-500 mt-3">
            * Revenue estimates assume 100% ticket sales. Bundle estimates based on 20% conversion.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-6 border-t">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Back to Edit
        </button>
        <button
          onClick={onPublish}
          className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
        >
          Publish Event
        </button>
      </div>
    </div>
  );
}