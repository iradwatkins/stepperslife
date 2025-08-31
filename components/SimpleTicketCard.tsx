"use client";

import { CalendarDays, MapPin, Ticket, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";

interface SimpleTicketCardProps {
  ticket: {
    ticketId: string;
    ticketNumber: string;
    ticketCode: string;
    eventTitle: string;
    eventDate: string;
    eventTime: string;
    eventVenue: string;
    status: string;
    shareUrl: string;
    ticketType?: string;
    tableName?: string;
    seatLabel?: string;
    event?: {
      name: string;
      date: number;
      location: string;
      image?: string;
    };
  };
}

export default function SimpleTicketCard({ ticket }: SimpleTicketCardProps) {
  const isValid = ticket.status === "valid";
  const isUsed = ticket.status === "used";
  
  return (
    <Card className={`overflow-hidden transition-all hover:shadow-lg ${
      isUsed ? "opacity-75" : ""
    }`}>
      {ticket.event?.image && (
        <div className="h-32 overflow-hidden bg-gray-100">
          <img 
            src={ticket.event.image} 
            alt={ticket.eventTitle}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg line-clamp-1">
              {ticket.eventTitle}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Ticket #{ticket.ticketNumber}
            </p>
          </div>
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            isValid ? "bg-green-100 text-green-800" :
            isUsed ? "bg-gray-100 text-gray-800" :
            "bg-red-100 text-red-800"
          }`}>
            {ticket.status.toUpperCase()}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <CalendarDays className="w-4 h-4" />
            <span>{ticket.eventDate} at {ticket.eventTime}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4" />
            <span className="line-clamp-1">{ticket.eventVenue}</span>
          </div>
          {(ticket.tableName || ticket.seatLabel) && (
            <div className="flex items-center gap-2 text-gray-600">
              <Ticket className="w-4 h-4" />
              <span>{ticket.tableName || ticket.ticketType || "General"}</span>
            </div>
          )}
        </div>
        
        <div className="border-t pt-3">
          <div className="bg-gray-50 rounded p-2 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Entry Code
            </p>
            <p className="font-mono font-bold text-lg tracking-widest">
              {ticket.ticketCode}
            </p>
          </div>
        </div>
        
        <Link 
          href={`/ticket/${ticket.ticketId}`}
          className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <span>View Ticket</span>
          <ExternalLink className="w-4 h-4" />
        </Link>
      </CardContent>
    </Card>
  );
}