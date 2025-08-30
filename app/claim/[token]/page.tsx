'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Calendar, MapPin, Ticket, User, AlertCircle, CheckCircle } from 'lucide-react';

export default function ClaimTicketPage({ params }: { params: { token: string } }) {
  const { user, isSignedIn } = useUser();
  const router = useRouter();
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Get ticket preview info
  const ticketInfo = useQuery(api.tickets.getTicketByClaimToken, { 
    claimToken: params.token 
  });

  const claimTicket = useMutation(api.tickets.claimTicket);

  const handleClaim = async () => {
    if (!user) {
      // Redirect to sign in with callback
      window.location.href = `/sign-in?redirect_url=${encodeURIComponent(`/claim/${params.token}`)}`;;
      return;
    }

    setClaiming(true);
    setError(null);

    try {
      const result = await claimTicket({
        claimToken: params.token,
        userId: session.user.id || session.user.email!,
        userEmail: session.user.email!,
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/tickets');
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to claim ticket');
    } finally {
      setClaiming(false);
    }
  };

  // Auto-claim if signed in and not claimed
  useEffect(() => {
    if (user && ticketInfo && !ticketInfo.isClaimed && ticketInfo.isClaimable) {
      // Don't auto-claim, let user confirm
    }
  }, [session, ticketInfo]);

  if (!ticketInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (ticketInfo.isClaimed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Ticket Already Claimed</h1>
            <p className="text-gray-600">
              This ticket has already been claimed and transferred to another user.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Success!</h1>
            <p className="text-gray-600 mb-4">
              Your ticket has been claimed successfully.
            </p>
            <p className="text-sm text-gray-500">Redirecting to your tickets...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-md w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
          <Ticket className="w-12 h-12 mb-3" />
          <h1 className="text-2xl font-bold">Claim Your Ticket</h1>
          <p className="text-purple-100 mt-1">
            Someone has shared a ticket with you
          </p>
        </div>

        {/* Ticket Details */}
        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h2 className="font-semibold text-lg">{ticketInfo.eventName}</h2>
            
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar size={16} />
              <span className="text-sm">
                {new Date(ticketInfo.eventDate).toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin size={16} />
              <span className="text-sm">{ticketInfo.eventLocation}</span>
            </div>

            {ticketInfo.tableName && (
              <div className="flex items-center gap-2 text-gray-600">
                <Ticket size={16} />
                <span className="text-sm">
                  {ticketInfo.tableName} - {ticketInfo.seatNumber}
                </span>
              </div>
            )}

            {ticketInfo.ticketType && (
              <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                {ticketInfo.ticketType}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          {!isSignedIn ? (
            <div className="space-y-3">
              <p className="text-center text-gray-600">
                Sign in to claim this ticket
              </p>
              <button
                onClick={handleClaim}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 rounded-lg transition"
              >
                Sign In & Claim Ticket
              </button>
            </div>
          ) : isSignedIn ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User size={16} />
                <span>Claiming as: {session.user?.email}</span>
              </div>
              <button
                onClick={handleClaim}
                disabled={claiming}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-lg transition"
              >
                {claiming ? 'Claiming...' : 'Claim Ticket'}
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          )}

          {/* Info */}
          <div className="text-center text-xs text-gray-500 pt-4 border-t">
            <p>This ticket can only be claimed once.</p>
            <p>After claiming, it will be added to your account.</p>
          </div>
        </div>
      </div>
    </div>
  );
}