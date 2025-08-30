'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Users, Send, Copy, CheckCircle, Clock, Mail, Share2, Link as LinkIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface TableGroup {
  groupId: string;
  tableName: string;
  tickets: any[];
  totalSeats: number;
  claimedSeats: number;
}

export default function TableDistributionDashboard() {
  const { user } = useUser();
  const userId = user?.id || '';
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Get table tickets
  const tableGroups = useQuery(api.tableSales.getTableTickets, { 
    userId 
  }) as TableGroup[] | undefined;

  const copyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const shareViaEmail = (ticket: any) => {
    const subject = encodeURIComponent(`Your ticket for ${ticket.eventName}`);
    const body = encodeURIComponent(
      `Hi!\n\n` +
      `Here's your ticket for ${ticket.eventName}.\n\n` +
      `Event Date: ${new Date(ticket.eventDate).toLocaleDateString()}\n` +
      `${ticket.tableName} - ${ticket.seatNumber}\n\n` +
      `Click this link to claim your ticket:\n${ticket.claimLink}\n\n` +
      `You'll need to sign in or create an account to claim it.\n\n` +
      `See you there!`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareViaWhatsApp = (ticket: any) => {
    const text = encodeURIComponent(
      `🎫 Your ticket for ${ticket.eventName}!\n` +
      `📅 ${new Date(ticket.eventDate).toLocaleDateString()}\n` +
      `🪑 ${ticket.tableName} - ${ticket.seatNumber}\n\n` +
      `Claim your ticket: ${ticket.claimLink}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  if (!tableGroups) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-48 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (tableGroups.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Tables Purchased</h3>
          <p className="text-gray-600">
            When you purchase a table for an event, you can distribute the tickets here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Table Distribution</h2>
        <p className="text-gray-600">
          Share tickets from your table purchases with friends and colleagues
        </p>
      </div>

      {/* Table Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tableGroups.map((group) => (
          <Card
            key={group.groupId}
            className={`cursor-pointer transition ${
              selectedTable === group.groupId 
                ? 'ring-2 ring-purple-600' 
                : 'hover:shadow-lg'
            }`}
            onClick={() => setSelectedTable(group.groupId)}
          >
            <CardHeader>
              <CardTitle className="text-lg">{group.tableName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Seats</span>
                  <span className="font-semibold">{group.totalSeats}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Distributed</span>
                  <span className="font-semibold text-green-600">
                    {group.claimedSeats}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Available</span>
                  <span className="font-semibold text-blue-600">
                    {group.totalSeats - group.claimedSeats}
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="pt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${(group.claimedSeats / group.totalSeats) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ticket Distribution */}
      {selectedTable && (
        <Card>
          <CardHeader>
            <CardTitle>
              Distribute Tickets - {tableGroups.find(g => g.groupId === selectedTable)?.tableName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tableGroups
                .find(g => g.groupId === selectedTable)
                ?.tickets.map((ticket) => (
                  <div
                    key={ticket._id}
                    className={`border rounded-lg p-4 ${
                      ticket.isClaimed ? 'bg-gray-50' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            ticket.isClaimed 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {ticket.isClaimed ? (
                            <CheckCircle size={20} />
                          ) : (
                            <Clock size={20} />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{ticket.seatNumber}</p>
                          <p className="text-sm text-gray-600">
                            {ticket.isClaimed ? (
                              <span className="text-green-600">
                                Claimed by {ticket.transferredTo || 'someone'}
                              </span>
                            ) : (
                              <span>Available to share</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {!ticket.isClaimed && ticket.claimLink && (
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyLink(ticket.claimLink, ticket._id);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                            title="Copy link"
                          >
                            {copiedLink === ticket._id ? (
                              <CheckCircle size={18} className="text-green-600" />
                            ) : (
                              <Copy size={18} />
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              shareViaEmail(ticket);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                            title="Send via email"
                          >
                            <Mail size={18} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              shareViaWhatsApp(ticket);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                            title="Share on WhatsApp"
                          >
                            <Share2 size={18} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Claim Link Display */}
                    {!ticket.isClaimed && ticket.claimLink && (
                      <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                        <p className="text-xs text-gray-600 mb-1">Share this link:</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={ticket.claimLink}
                            readOnly
                            className="flex-1 text-xs bg-white px-2 py-1 rounded border"
                            onClick={(e) => e.currentTarget.select()}
                          />
                          <button
                            onClick={() => copyLink(ticket.claimLink, `full-${ticket._id}`)}
                            className="text-xs px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded transition"
                          >
                            {copiedLink === `full-${ticket._id}` ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">How to Share Tickets</h4>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Click the copy button to get the claim link</li>
                <li>2. Send the link via email, text, or any messaging app</li>
                <li>3. Recipients click the link and sign in to claim</li>
                <li>4. The ticket is automatically transferred to their account</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}