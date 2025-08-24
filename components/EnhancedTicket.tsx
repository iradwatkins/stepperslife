'use client';

import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { Calendar, MapPin, Clock, User, Ticket as TicketIcon, Shield, Smartphone } from 'lucide-react';
import { Id } from '@/convex/_generated/dataModel';

interface EnhancedTicketProps {
  ticket: {
    _id: Id<"tickets">;
    eventId: Id<"events">;
    userId: string;
    purchasedAt: number;
    quantity: number;
    totalAmount: number;
    event: {
      _id: Id<"events">;
      name: string;
      description: string;
      location: string;
      eventDate: number;
      imageUrl: string;
      price: number;
      is_cancelled: boolean;
      ticketType?: 'VIP' | 'GA' | 'EARLY_BIRD' | 'STAFF';
    };
    backupCode?: string;
    checkedInAt?: number;
    checkedInBy?: string;
  };
}

// Generate backup code if not provided
function generateBackupCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 7; i++) {
    if (i === 3) code += '-'; // Format: XXX-XXX
    else code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default function EnhancedTicket({ ticket }: EnhancedTicketProps) {
  const [brightness, setBrightness] = useState(false);
  const [showMobileOptimized, setShowMobileOptimized] = useState(false);
  const backupCode = ticket.backupCode || generateBackupCode();

  // Detect mobile device
  useEffect(() => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    setShowMobileOptimized(isMobile);
  }, []);

  // Auto-brighten screen when showing ticket
  useEffect(() => {
    if (brightness && 'screen' in window && 'orientation' in window.screen) {
      // Note: Screen brightness API is not widely supported
      // This is a placeholder for future implementation
      document.body.style.filter = 'brightness(1.2)';
      return () => {
        document.body.style.filter = '';
      };
    }
  }, [brightness]);

  // Determine ticket color based on type
  const getTicketColor = () => {
    if (ticket.event.is_cancelled) return 'border-red-500 bg-red-50';
    switch (ticket.event.ticketType) {
      case 'VIP': return 'border-red-500 bg-gradient-to-r from-red-50 to-pink-50';
      case 'EARLY_BIRD': return 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50';
      case 'STAFF': return 'border-yellow-500 bg-gradient-to-r from-yellow-50 to-amber-50';
      default: return 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50';
    }
  };

  // Enhanced QR data with validation info
  const qrData = JSON.stringify({
    id: ticket._id,
    eventId: ticket.eventId,
    userId: ticket.userId,
    timestamp: ticket.purchasedAt,
    backup: backupCode.replace('-', ''),
    type: ticket.event.ticketType || 'GA'
  });

  // Mobile-optimized view
  if (showMobileOptimized) {
    return (
      <div className={`relative bg-white rounded-2xl shadow-2xl overflow-hidden border-2 ${getTicketColor()}`}>
        {/* Event Header with Image Background */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src={ticket.event.imageUrl} 
            alt={ticket.event.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h2 className="text-2xl font-bold mb-1">{ticket.event.name}</h2>
            <p className="text-sm opacity-90">{new Date(ticket.event.eventDate).toLocaleDateString()}</p>
          </div>
          {ticket.event.ticketType && (
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full">
              <span className="text-sm font-bold text-gray-900">{ticket.event.ticketType}</span>
            </div>
          )}
        </div>

        {/* QR Code Section - Large and Centered */}
        <div className="p-6 bg-white">
          <div className="flex flex-col items-center">
            <button
              onClick={() => setBrightness(!brightness)}
              className="mb-4 flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700"
            >
              <Smartphone size={16} />
              {brightness ? 'Normal Brightness' : 'Max Brightness for Scanning'}
            </button>
            
            <div className={`p-6 bg-white rounded-xl shadow-inner ${brightness ? 'ring-4 ring-purple-400' : ''}`}>
              <QRCode 
                value={qrData} 
                size={250}
                level="L"
                bgColor="#FFFFFF"
                fgColor="#000000"
              />
            </div>
            
            {/* Backup Code - Large and Clear */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Backup Code</p>
              <p className="text-2xl font-mono font-bold text-gray-900">{backupCode}</p>
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="px-6 pb-6 space-y-3">
          <div className="flex items-center gap-3 text-gray-700">
            <Calendar size={18} />
            <span className="text-sm">{new Date(ticket.event.eventDate).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <MapPin size={18} />
            <span className="text-sm">{ticket.event.location}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-700">
            <User size={18} />
            <span className="text-sm">Qty: {ticket.quantity} | ${ticket.totalAmount}</span>
          </div>
        </div>

        {/* Status Bar */}
        <div className={`px-6 py-3 ${ticket.checkedInAt ? 'bg-green-100' : 'bg-gray-100'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield size={16} className={ticket.checkedInAt ? 'text-green-600' : 'text-gray-600'} />
              <span className={`text-sm font-medium ${ticket.checkedInAt ? 'text-green-600' : 'text-gray-600'}`}>
                {ticket.checkedInAt ? 'Checked In' : 'Valid Ticket'}
              </span>
            </div>
            {ticket.checkedInAt && (
              <span className="text-xs text-gray-500">
                {new Date(ticket.checkedInAt).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Desktop/Print View - Concert Ticket Style
  return (
    <div className={`relative bg-white rounded-lg shadow-2xl overflow-hidden border-2 ${getTicketColor()} print:break-inside-avoid`}>
      <div className="flex">
        {/* Main Ticket Section */}
        <div className="flex-1 p-8">
          {/* Event Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{ticket.event.name}</h1>
              <p className="text-gray-600">{ticket.event.description}</p>
            </div>
            {ticket.event.ticketType && (
              <div className={`px-4 py-2 rounded-full font-bold text-white ${
                ticket.event.ticketType === 'VIP' ? 'bg-red-500' :
                ticket.event.ticketType === 'EARLY_BIRD' ? 'bg-green-500' :
                ticket.event.ticketType === 'STAFF' ? 'bg-yellow-500' :
                'bg-blue-500'
              }`}>
                {ticket.event.ticketType}
              </div>
            )}
          </div>

          {/* Event Details Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Calendar className="text-purple-600" size={20} />
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="font-semibold">{new Date(ticket.event.eventDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="text-purple-600" size={20} />
              <div>
                <p className="text-xs text-gray-500">Time</p>
                <p className="font-semibold">{new Date(ticket.event.eventDate).toLocaleTimeString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="text-purple-600" size={20} />
              <div>
                <p className="text-xs text-gray-500">Venue</p>
                <p className="font-semibold">{ticket.event.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TicketIcon className="text-purple-600" size={20} />
              <div>
                <p className="text-xs text-gray-500">Ticket Info</p>
                <p className="font-semibold">Qty: {ticket.quantity} | ${ticket.totalAmount}</p>
              </div>
            </div>
          </div>

          {/* Purchase Info */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Purchased: {new Date(ticket.purchasedAt).toLocaleString()} | ID: {ticket._id}
            </p>
          </div>
        </div>

        {/* Perforated Line */}
        <div className="relative">
          <div className="absolute inset-y-0 left-1/2 w-px border-l-2 border-dashed border-gray-300" />
        </div>

        {/* QR Code Section - Tear-off Style */}
        <div className="w-72 p-8 bg-gradient-to-br from-gray-50 to-white flex flex-col items-center justify-center">
          <div className="text-center mb-4">
            <h3 className="font-bold text-lg mb-1">SCAN FOR ENTRY</h3>
            <p className="text-xs text-gray-500">Present this code at the door</p>
          </div>
          
          <div className="p-4 bg-white rounded-lg shadow-lg">
            <QRCode 
              value={qrData} 
              size={200}
              level="L"
              bgColor="#FFFFFF"
              fgColor="#000000"
            />
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Backup Code</p>
            <p className="text-xl font-mono font-bold text-gray-900">{backupCode}</p>
          </div>

          {/* Check-in Status */}
          {ticket.checkedInAt ? (
            <div className="mt-4 px-3 py-1 bg-green-100 rounded-full">
              <span className="text-xs font-medium text-green-800">
                ✓ Checked In at {new Date(ticket.checkedInAt).toLocaleTimeString()}
              </span>
            </div>
          ) : (
            <div className="mt-4 px-3 py-1 bg-blue-100 rounded-full">
              <span className="text-xs font-medium text-blue-800">
                Ready for Check-in
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}