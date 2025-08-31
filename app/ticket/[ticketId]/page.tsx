"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CalendarDays, MapPin, Ticket, Check, X, Download } from "lucide-react";
import QRCode from "qrcode";

// This page is PUBLIC - no authentication required
export default function PublicTicketPage() {
  const params = useParams();
  const ticketId = params.ticketId as string;
  const ticket = useQuery(api.tickets.getTicketById, { ticketId });
  const qrRef = useRef<HTMLCanvasElement>(null);
  const [qrGenerated, setQrGenerated] = useState(false);

  // Generate QR code
  useEffect(() => {
    if (ticket && qrRef.current && !qrGenerated) {
      QRCode.toCanvas(
        qrRef.current,
        ticket.qrCode,
        {
          width: 200,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        },
        (error) => {
          if (error) console.error(error);
          else setQrGenerated(true);
        }
      );
    }
  }, [ticket, qrGenerated]);

  const downloadTicket = () => {
    if (!ticket) return;
    
    // Create a simple HTML template for the ticket
    const ticketHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${ticket.eventTitle} - Ticket</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 600px;
            margin: 0 auto;
          }
          .ticket {
            border: 2px solid #333;
            border-radius: 10px;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .qr-section {
            background: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            margin: 20px 0;
          }
          .qr-section img {
            max-width: 200px;
          }
          .code {
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 2px;
            color: #333;
          }
          .details {
            margin-top: 20px;
          }
          .detail-row {
            margin: 10px 0;
            padding: 10px 0;
            border-bottom: 1px solid rgba(255,255,255,0.3);
          }
        </style>
      </head>
      <body>
        <div class="ticket">
          <h1>${ticket.eventTitle}</h1>
          <div class="qr-section">
            <canvas id="qr"></canvas>
            <div class="code">${ticket.ticketCode}</div>
          </div>
          <div class="details">
            <div class="detail-row">📅 ${ticket.eventDate} at ${ticket.eventTime}</div>
            <div class="detail-row">📍 ${ticket.eventVenue}</div>
            <div class="detail-row">🎫 ${ticket.tableName} - ${ticket.seatLabel || "General Admission"}</div>
            <div class="detail-row">Ticket ID: ${ticket.ticketId}</div>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Create a blob and download
    const blob = new Blob([ticketHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ticket-${ticket.ticketId}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ticket...</p>
        </div>
      </div>
    );
  }

  const isUsed = ticket.status === "used" || ticket.scanned;
  const isCancelled = ticket.status === "cancelled";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Ticket Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className={`p-6 text-white ${
            isUsed ? "bg-gray-500" : 
            isCancelled ? "bg-red-500" : 
            "bg-gradient-to-r from-blue-600 to-purple-600"
          }`}>
            <div className="flex items-center justify-between mb-4">
              <Ticket className="w-8 h-8" />
              <span className="text-sm font-semibold uppercase tracking-wide">
                {isUsed ? "USED" : isCancelled ? "CANCELLED" : "VALID"}
              </span>
            </div>
            <h1 className="text-2xl font-bold mb-2">{ticket.eventTitle}</h1>
            <div className="space-y-2 text-blue-50">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                <span className="text-sm">
                  {ticket.eventDate} at {ticket.eventTime}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{ticket.eventVenue}</span>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="p-6 bg-gray-50">
            <div className="text-center">
              {isUsed && (
                <div className="mb-4 p-3 bg-gray-100 rounded-lg">
                  <Check className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-600 font-semibold">This ticket has been scanned</p>
                </div>
              )}
              {isCancelled && (
                <div className="mb-4 p-3 bg-red-100 rounded-lg">
                  <X className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="text-red-600 font-semibold">This ticket has been cancelled</p>
                </div>
              )}
              
              <canvas 
                ref={qrRef} 
                className={`mx-auto ${isUsed || isCancelled ? "opacity-50" : ""}`}
              />
              
              <div className="mt-4 p-4 bg-white rounded-lg border-2 border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Entry Code</p>
                <p className="text-2xl font-bold tracking-widest">{ticket.ticketCode}</p>
              </div>
            </div>
          </div>

          {/* Ticket Details */}
          <div className="p-6 border-t border-gray-200">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Table / Seat</p>
                <p className="font-semibold">{ticket.tableName}</p>
                {ticket.seatLabel && (
                  <p className="text-sm text-gray-600">{ticket.seatLabel}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Ticket ID</p>
                <p className="font-mono text-sm">{ticket.ticketId}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          {!isUsed && !isCancelled && (
            <div className="p-6 bg-gray-50 border-t border-gray-200">
              <button
                onClick={downloadTicket}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-5 h-5" />
                Download Ticket
              </button>
              <p className="text-xs text-gray-500 text-center mt-3">
                Show this QR code or entry code at the event entrance
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Powered by SteppersLife</p>
          <p className="mt-1">
            Need help? Contact{" "}
            <a href="mailto:support@stepperslife.com" className="text-blue-600 hover:underline">
              support@stepperslife.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}