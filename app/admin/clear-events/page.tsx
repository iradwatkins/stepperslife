"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Trash2, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function ClearEventsPage() {
  const [isClearing, setIsClearing] = useState(false);
  const [confirmStep, setConfirmStep] = useState(0);
  const [results, setResults] = useState<any>(null);

  // Mutations
  const clearAllEvents = useMutation(api.adminReset.clearAllEvents);
  const getDataCounts = useMutation(api.adminReset.getDataCounts);

  const handleCheckData = async () => {
    try {
      const counts = await getDataCounts();
      setResults(counts);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get data counts",
      });
    }
  };

  const handleClearEvents = async () => {
    setIsClearing(true);
    try {
      const result = await clearAllEvents({
        confirmReset: "RESET_ALL_DATA",
      });

      toast({
        title: "✅ All Events Cleared",
        description: result.message,
      });

      // Reset state
      setConfirmStep(0);
      setResults(null);
      
      // Refresh data counts
      await handleCheckData();
    } catch (error) {
      console.error("Clear events error:", error);
      toast({
        variant: "destructive",
        title: "Clear Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleConfirmStep = () => {
    if (confirmStep === 0) {
      handleCheckData();
      setConfirmStep(1);
    } else if (confirmStep === 1) {
      setConfirmStep(2);
    } else if (confirmStep === 2) {
      handleClearEvents();
    }
  };

  const resetProcess = () => {
    setConfirmStep(0);
    setResults(null);
  };

  return (
    <div className="container max-w-4xl mx-auto p-8">
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-orange-600" />
            <CardTitle className="text-orange-900">Clear All Events</CardTitle>
          </div>
          <CardDescription className="text-orange-700">
            Remove all events, test data, and mock data from the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Initial warning */}
          {confirmStep === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">⚠️ Warning</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm space-y-2">
                  <p>This action will permanently delete:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>All events (including test and mock events)</li>
                    <li>All tickets and ticket purchases</li>
                    <li>All table configurations</li>
                    <li>All waiting lists</li>
                    <li>All affiliate programs</li>
                    <li>All scan logs and purchase records</li>
                    <li>All event-related transactions</li>
                  </ul>
                  <p className="font-semibold mt-4">This action CANNOT be undone!</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleConfirmStep}
                    variant="destructive"
                    className="flex-1"
                  >
                    <AlertCircle className="mr-2 h-4 w-4" />
                    I Understand, Continue
                  </Button>
                  <Button
                    onClick={() => window.history.back()}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Show current data */}
          {confirmStep === 1 && results && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Data Status</CardTitle>
                <CardDescription>Review what will be deleted</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {results.counts && (
                  <div className="space-y-2">
                    {results.counts.events > 0 && (
                      <div className="p-3 bg-red-100 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Events:</span>
                          <span className="text-red-700 font-bold">{results.counts.events}</span>
                        </div>
                      </div>
                    )}
                    {(results.counts.tickets > 0 || results.counts.simpleTickets > 0) && (
                      <div className="p-3 bg-orange-100 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Tickets:</span>
                          <span className="text-orange-700 font-bold">
                            {results.counts.tickets + results.counts.simpleTickets}
                          </span>
                        </div>
                      </div>
                    )}
                    {(results.counts.purchases > 0 || results.counts.bundlePurchases > 0) && (
                      <div className="p-3 bg-yellow-100 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Purchases:</span>
                          <span className="text-yellow-700 font-bold">
                            {results.counts.purchases + results.counts.bundlePurchases}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="border-t pt-3 mt-3">
                      <div className="flex justify-between items-center text-lg font-bold">
                        <span>Total Records to Delete:</span>
                        <span className="text-red-600">
                          {results.counts.events +
                           results.counts.eventDays +
                           results.counts.tickets +
                           results.counts.simpleTickets +
                           results.counts.dayTicketTypes +
                           results.counts.purchases +
                           results.counts.bundlePurchases +
                           results.counts.tables +
                           results.counts.waitingLists +
                           results.counts.affiliates +
                           results.counts.scanLogs +
                           results.counts.platformTransactions}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {results.counts.events === 0 ? (
                  <div className="p-4 bg-green-100 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-green-700 font-medium">
                        No events found. Database is already clean.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <Button
                      onClick={handleConfirmStep}
                      variant="destructive"
                      className="flex-1"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Continue to Delete
                    </Button>
                    <Button
                      onClick={resetProcess}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Final confirmation */}
          {confirmStep === 2 && (
            <Card className="border-red-400">
              <CardHeader>
                <CardTitle className="text-lg text-red-900">🔥 Final Confirmation</CardTitle>
                <CardDescription className="text-red-700">
                  This is your last chance to cancel
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-red-100 rounded-lg">
                  <p className="text-red-900 font-semibold text-center">
                    Are you absolutely sure you want to delete ALL events and related data?
                  </p>
                  <p className="text-red-700 text-sm text-center mt-2">
                    This action cannot be undone!
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={handleConfirmStep}
                    variant="destructive"
                    size="lg"
                    className="flex-1"
                    disabled={isClearing}
                  >
                    {isClearing ? (
                      "Clearing Events..."
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Yes, Delete Everything
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={resetProcess}
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    disabled={isClearing}
                  >
                    No, Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Success message */}
          {confirmStep === 0 && results && results.counts.events === 0 && (
            <Card className="border-green-400 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-green-900 font-semibold text-lg">
                      Database is Clean
                    </p>
                    <p className="text-green-700 text-sm">
                      No events found. Ready for fresh data.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}