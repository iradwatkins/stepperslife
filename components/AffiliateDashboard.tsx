'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Copy, DollarSign, TrendingUp, Users, Link, Share2, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export default function AffiliateDashboard() {
  const { user, isSignedIn } = useAuth();
  const userId = user?.id || '';
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Get affiliate programs
  const affiliatePrograms = useQuery(api.affiliates.getUserAffiliatePrograms, { 
    userId 
  });

  // Get overall stats
  const stats = useQuery(api.affiliates.getAffiliateStats, { 
    affiliateUserId: userId 
  });

  const copyToClipboard = (text: string, code: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const shareViaEmail = (program: any) => {
    const subject = encodeURIComponent(`Check out ${program.eventName}!`);
    const body = encodeURIComponent(
      `Hey! I wanted to share this amazing event with you:\n\n` +
      `${program.eventName}\n` +
      `Date: ${new Date(program.eventDate).toLocaleDateString()}\n\n` +
      `Get your tickets here: ${program.referralLink}\n\n` +
      `See you there!`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareViaWhatsApp = (program: any) => {
    const text = encodeURIComponent(
      `🎉 Check out ${program.eventName}!\n` +
      `📅 ${new Date(program.eventDate).toLocaleDateString()}\n\n` +
      `Get tickets: ${program.referralLink}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  if (!affiliatePrograms || !stats) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-48 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Programs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activePrograms}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tickets Sold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTicketsSold}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${stats.totalEarnings.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Avg Commission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.totalTicketsSold > 0 
                ? (stats.totalEarnings / stats.totalTicketsSold).toFixed(2)
                : '0.00'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Affiliate Programs */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Affiliate Programs</h2>
        
        {affiliatePrograms.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No affiliate programs yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Event organizers can invite you to sell tickets and earn commissions
              </p>
            </CardContent>
          </Card>
        ) : (
          affiliatePrograms.map((program) => (
            <Card key={program._id} className={!program.isActive ? 'opacity-60' : ''}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{program.eventName}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(program.eventDate).toLocaleDateString()}
                    </p>
                  </div>
                  {program.isActive ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                      Inactive
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{program.totalSold}</p>
                    <p className="text-xs text-gray-600">Tickets Sold</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      ${program.totalEarned.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-600">Earned</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      ${program.commissionPerTicket.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-600">Per Ticket</p>
                  </div>
                </div>

                {/* Referral Code */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Referral Code</p>
                  <div className="flex items-center justify-between">
                    <code className="text-lg font-mono font-bold">{program.referralCode}</code>
                    <button
                      onClick={() => copyToClipboard(program.referralCode, program.referralCode)}
                      className="p-2 hover:bg-gray-200 rounded transition"
                    >
                      {copiedCode === program.referralCode ? (
                        <span className="text-green-600 text-sm">Copied!</span>
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Referral Link */}
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-gray-600 mb-1">Your Referral Link</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={program.referralLink}
                      readOnly
                      className="flex-1 bg-white px-3 py-2 rounded border text-sm"
                    />
                    <button
                      onClick={() => copyToClipboard(program.referralLink, `link-${program._id}`)}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                    >
                      {copiedCode === `link-${program._id}` ? (
                        <span className="text-xs">Copied!</span>
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Share Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => shareViaEmail(program)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                  >
                    <Mail size={16} />
                    <span className="text-sm">Email</span>
                  </button>
                  <button
                    onClick={() => shareViaWhatsApp(program)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 rounded-lg transition"
                  >
                    <Share2 size={16} />
                    <span className="text-sm">WhatsApp</span>
                  </button>
                  <button
                    onClick={() => copyToClipboard(program.referralLink, `share-${program._id}`)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 rounded-lg transition"
                  >
                    <Link size={16} />
                    <span className="text-sm">
                      {copiedCode === `share-${program._id}` ? 'Copied!' : 'Copy Link'}
                    </span>
                  </button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Earnings Summary */}
      {stats.totalEarnings > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Earnings Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Earnings</span>
                <span className="font-semibold">${stats.totalEarnings.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Available for Payout</span>
                <span className="font-semibold text-green-600">
                  ${stats.totalEarnings.toFixed(2)}
                </span>
              </div>
              <div className="pt-3 border-t">
                <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition">
                  Request Payout
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}