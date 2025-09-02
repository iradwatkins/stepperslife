'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Copy, 
  Link2, 
  Mail, 
  MoreVertical, 
  Ban,
  CheckCircle,
  Trash2,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { useToast } from '@/hooks/use-toast';

interface Affiliate {
  _id: Id<"affiliatePrograms">;
  eventName: string;
  eventId: Id<"events">;
  eventDate: number;
  affiliateName: string;
  affiliateEmail: string;
  referralCode: string;
  commissionPerTicket: number;
  totalSold: number;
  totalEarned: number;
  isActive: boolean;
  createdAt: number;
}

interface AffiliateListProps {
  affiliates: Affiliate[];
  onRefresh?: () => void;
}

export default function AffiliateList({ affiliates, onRefresh }: AffiliateListProps) {
  const { toast } = useToast();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  const updateStatus = useMutation(api.affiliates.updateAffiliateStatus);
  const deleteAffiliate = useMutation(api.affiliates.deleteAffiliate);
  
  const copyToClipboard = (text: string, code: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(code);
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard",
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };
  
  const handleStatusToggle = async (affiliateId: Id<"affiliatePrograms">, currentStatus: boolean) => {
    try {
      await updateStatus({
        affiliateId,
        isActive: !currentStatus,
      });
      
      toast({
        title: currentStatus ? "Affiliate Deactivated" : "Affiliate Activated",
        description: currentStatus 
          ? "The referral code has been deactivated"
          : "The referral code is now active",
      });
      
      onRefresh?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update affiliate status",
        variant: "destructive",
      });
    }
  };
  
  const handleDelete = async (affiliateId: Id<"affiliatePrograms">) => {
    if (!confirm("Are you sure you want to delete this affiliate? This action cannot be undone.")) {
      return;
    }
    
    try {
      await deleteAffiliate({ affiliateId });
      
      toast({
        title: "Affiliate Deleted",
        description: "The affiliate has been removed",
      });
      
      onRefresh?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete affiliate",
        variant: "destructive",
      });
    }
  };
  
  const sendEmailInvite = (affiliate: Affiliate) => {
    const subject = encodeURIComponent(`You're invited to promote ${affiliate.eventName}!`);
    const referralLink = `https://stepperslife.com/event/${affiliate.eventId}?ref=${affiliate.referralCode}`;
    const body = encodeURIComponent(
      `Hi ${affiliate.affiliateName},\n\n` +
      `You've been invited to be an affiliate for ${affiliate.eventName}!\n\n` +
      `Your unique referral code: ${affiliate.referralCode}\n` +
      `Your referral link: ${referralLink}\n\n` +
      `You'll earn $${affiliate.commissionPerTicket.toFixed(2)} for each ticket sold using your code.\n\n` +
      `Start sharing your link to earn commissions!\n\n` +
      `Best regards,\nThe SteppersLife Team`
    );
    
    window.location.href = `mailto:${affiliate.affiliateEmail}?subject=${subject}&body=${body}`;
  };
  
  if (affiliates.length === 0) {
    return null;
  }
  
  // Group affiliates by event
  const affiliatesByEvent = affiliates.reduce((acc, affiliate) => {
    if (!acc[affiliate.eventId]) {
      acc[affiliate.eventId] = {
        eventName: affiliate.eventName,
        eventDate: affiliate.eventDate,
        affiliates: [],
      };
    }
    acc[affiliate.eventId].affiliates.push(affiliate);
    return acc;
  }, {} as Record<string, { eventName: string; eventDate: number; affiliates: Affiliate[] }>);
  
  return (
    <div className="space-y-6">
      {Object.entries(affiliatesByEvent).map(([eventId, group]) => (
        <Card key={eventId}>
          <CardHeader>
            <CardTitle className="text-lg">
              {group.eventName}
              <span className="text-sm font-normal text-gray-500 ml-2">
                {new Date(group.eventDate).toLocaleDateString()}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {group.affiliates.map((affiliate) => (
                <div
                  key={affiliate._id}
                  className={`p-4 border rounded-lg ${
                    !affiliate.isActive ? 'bg-gray-50 opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{affiliate.affiliateName}</h4>
                        <Badge variant={affiliate.isActive ? "default" : "secondary"}>
                          {affiliate.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{affiliate.affiliateEmail}</p>
                      
                      {/* Referral Code */}
                      <div className="flex items-center gap-2 mt-3">
                        <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                          {affiliate.referralCode}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(affiliate.referralCode, affiliate.referralCode)}
                        >
                          {copiedCode === affiliate.referralCode ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      
                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold">{affiliate.totalSold}</p>
                          <p className="text-xs text-gray-600">Tickets Sold</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">
                            ${affiliate.totalEarned.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-600">Earned</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold">
                            ${affiliate.commissionPerTicket.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-600">Per Ticket</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => sendEmailInvite(affiliate)}>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Invite Email
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            const link = `https://stepperslife.com/event/${affiliate.eventId}?ref=${affiliate.referralCode}`;
                            copyToClipboard(link, `link-${affiliate._id}`);
                          }}
                        >
                          <Link2 className="mr-2 h-4 w-4" />
                          Copy Referral Link
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusToggle(affiliate._id, affiliate.isActive)}
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          {affiliate.isActive ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(affiliate._id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}