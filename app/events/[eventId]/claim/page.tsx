"use client";

import { useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, MapPin, Users, CheckCircle, AlertCircle } from "lucide-react";

export default function ClaimEventPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  
  const eventId = params.eventId as Id<"events">;
  const tokenFromUrl = searchParams.get("token");
  
  const [claimToken, setClaimToken] = useState(tokenFromUrl || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Fetch event details
  const event = useQuery(api.events.getById, { eventId });
  const claimStatus = useQuery(api.adminEvents.getClaimStatus, { eventId });
  const claimEvent = useMutation(api.adminEvents.claimEvent);
  const deleteAdminEvent = useMutation(api.adminEvents.deleteAdminEvent);
  
  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user) {
      setError("Please sign in to claim this event");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await claimEvent({
        eventId,
        claimToken,
        userId: session.user.id || session.user.email || "",
        userEmail: session.user.email || "",
      });
      
      setSuccess(true);
      
      // Redirect to create new event page after 2 seconds
      setTimeout(() => {
        router.push("/events/create-new");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to claim event");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDeleteAndCreate = async () => {
    if (!session?.user?.email) {
      setError("Please sign in to proceed");
      return;
    }
    
    // Check if user is admin
    const ADMIN_EMAILS = ["admin@stepperslife.com", "irawatkins@gmail.com"];
    if (!ADMIN_EMAILS.includes(session.user.email)) {
      setError("Only admins can delete events");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await deleteAdminEvent({
        eventId,
        adminEmail: session.user.email,
      });
      
      // Redirect to create new event
      router.push("/events/create-new");
    } catch (err: any) {
      setError(err.message || "Failed to delete event");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!event || !claimStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  if (!claimStatus.postedByAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Not Claimable</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This event was not posted by an admin and cannot be claimed.</p>
            <Button 
              className="mt-4 w-full" 
              onClick={() => router.push("/")}
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (claimStatus.claimedBy) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-amber-600">Already Claimed</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This event has already been claimed by another organizer.</p>
            <p className="text-sm text-gray-500 mt-2">
              Claimed on: {new Date(claimStatus.claimedAt!).toLocaleDateString()}
            </p>
            <Button 
              className="mt-4 w-full" 
              onClick={() => router.push("/")}
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle>Claim Event</CardTitle>
            <CardDescription>
              This event was posted by an admin. Enter the claim token to take ownership and create your own tickets.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Event Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">{event.name}</h3>
              <p className="text-gray-600 mb-3">{event.description}</p>
              
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  {event.location}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(event.eventDate).toLocaleDateString()} at{" "}
                  {new Date(event.eventDate).toLocaleTimeString()}
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Capacity: {event.totalCapacity || event.totalTickets}
                </div>
              </div>
              
              <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
                <p className="text-xs text-blue-700 font-medium">
                  📝 Posted by Admin • Ready to be claimed
                </p>
              </div>
            </div>
            
            {/* Success Message */}
            {success && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">
                  Event claimed successfully! Redirecting to create your event...
                </AlertDescription>
              </Alert>
            )}
            
            {/* Error Message */}
            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            {/* Claim Form */}
            {!success && (
              <form onSubmit={handleClaim} className="space-y-4">
                <div>
                  <Label htmlFor="claimToken">Claim Token</Label>
                  <Input
                    id="claimToken"
                    type="text"
                    value={claimToken}
                    onChange={(e) => setClaimToken(e.target.value)}
                    placeholder="Enter the claim token provided by admin"
                    required
                    disabled={isSubmitting}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    The claim token was provided when the admin posted this event
                  </p>
                </div>
                
                {!session?.user && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please <a href="/auth/signin" className="underline font-medium">sign in</a> to claim this event
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="flex gap-3">
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={!session?.user || isSubmitting || !claimToken}
                  >
                    {isSubmitting ? "Claiming..." : "Claim Event & Create Tickets"}
                  </Button>
                  
                  {/* Admin-only delete option */}
                  {session?.user?.email && 
                   ["admin@stepperslife.com", "irawatkins@gmail.com"].includes(session.user.email) && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={handleDeleteAndCreate}
                      disabled={isSubmitting}
                    >
                      Delete & Create New
                    </Button>
                  )}
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}