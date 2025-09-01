"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  Users, 
  DollarSign, 
  Copy, 
  UserPlus, 
  TrendingUp,
  Mail,
  X,
  Check
} from "lucide-react";

export default function EventAffiliatesPage() {
  const params = useParams();
  const eventId = params.id as Id<"events">;
  const { user } = useAuth();
  const userId = user?.id || "";
  
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: "",
    name: "",
    commission: "",
  });
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Fetch event details
  const event = useQuery(api.events.getById, { eventId });
  
  // Fetch affiliates for this event
  const affiliates = useQuery(api.affiliates.getEventAffiliates, { eventId });
  
  // Mutations
  const createAffiliate = useMutation(api.affiliates.createAffiliateProgram);
  const deactivateAffiliate = useMutation(api.affiliates.deactivateAffiliateProgram);
  const updateCommission = useMutation(api.affiliates.updateCommissionRate);

  // Check if user owns this event
  const isOwner = event?.userId === userId;

  const handleInviteAffiliate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteForm.email || !inviteForm.name || !inviteForm.commission) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await createAffiliate({
        eventId,
        affiliateEmail: inviteForm.email,
        affiliateName: inviteForm.name,
        commissionPerTicket: parseFloat(inviteForm.commission),
        createdBy: userId,
      });

      if (result.success) {
        toast({
          title: "Success",
          description: `Affiliate invited! Referral code: ${result.referralCode}`,
        });
        setInviteForm({ email: "", name: "", commission: "" });
        setShowInviteForm(false);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to create affiliate program",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to invite affiliate",
        variant: "destructive",
      });
    }
  };

  const handleDeactivate = async (affiliateId: Id<"affiliatePrograms">) => {
    try {
      await deactivateAffiliate({
        affiliateProgramId: affiliateId,
        deactivatedBy: userId,
      });
      toast({
        title: "Success",
        description: "Affiliate deactivated",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to deactivate affiliate",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string, code: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (!isOwner) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-600">You don't have permission to manage affiliates for this event.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalCommissionsOwed = affiliates?.reduce((sum, a) => sum + a.totalEarned, 0) || 0;
  const totalTicketsSold = affiliates?.reduce((sum, a) => sum + a.totalSold, 0) || 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Affiliate Management</h1>
        <p className="text-gray-600 mt-2">
          {event?.name || "Loading..."}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Affiliates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {affiliates?.filter(a => a.isActive).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tickets Sold via Affiliates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTicketsSold}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Commissions Owed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalCommissionsOwed.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invite New Affiliate */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Invite Affiliate</CardTitle>
            {!showInviteForm && (
              <Button onClick={() => setShowInviteForm(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite New
              </Button>
            )}
          </div>
        </CardHeader>
        {showInviteForm && (
          <CardContent>
            <form onSubmit={handleInviteAffiliate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="affiliate@example.com"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={inviteForm.name}
                    onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="commission">Commission per Ticket ($)</Label>
                  <Input
                    id="commission"
                    type="number"
                    step="0.01"
                    placeholder="5.00"
                    value={inviteForm.commission}
                    onChange={(e) => setInviteForm({ ...inviteForm, commission: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Send Invitation</Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowInviteForm(false);
                    setInviteForm({ email: "", name: "", commission: "" });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Affiliates List */}
      <Card>
        <CardHeader>
          <CardTitle>Current Affiliates</CardTitle>
        </CardHeader>
        <CardContent>
          {!affiliates || affiliates.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No affiliates yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Invite affiliates to help promote your event
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {affiliates.map((affiliate) => (
                <div
                  key={affiliate._id}
                  className={`border rounded-lg p-4 ${
                    !affiliate.isActive ? "opacity-60 bg-gray-50" : ""
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">{affiliate.affiliateName}</h3>
                      <p className="text-sm text-gray-600">{affiliate.affiliateEmail}</p>
                    </div>
                    {affiliate.isActive ? (
                      <Badge className="bg-green-100 text-green-700">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-600">Tickets Sold</p>
                      <p className="text-lg font-semibold">{affiliate.totalSold}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Total Earned</p>
                      <p className="text-lg font-semibold text-green-600">
                        ${affiliate.totalEarned.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Commission/Ticket</p>
                      <p className="text-lg font-semibold">
                        ${affiliate.commissionPerTicket.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Referral Code</p>
                      <div className="flex items-center gap-1">
                        <code className="text-sm font-mono font-bold">
                          {affiliate.referralCode}
                        </code>
                        <button
                          onClick={() => copyToClipboard(affiliate.referralCode, affiliate._id)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          {copiedCode === affiliate._id ? (
                            <Check className="w-3 h-3 text-green-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {affiliate.isActive && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const link = `https://stepperslife.com/events/${eventId}?ref=${affiliate.referralCode}`;
                          copyToClipboard(link, `link-${affiliate._id}`);
                        }}
                      >
                        {copiedCode === `link-${affiliate._id}` ? (
                          <>
                            <Check className="w-3 h-3 mr-1" />
                            Copied Link
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 mr-1" />
                            Copy Link
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDeactivate(affiliate._id)}
                      >
                        <X className="w-3 h-3 mr-1" />
                        Deactivate
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}