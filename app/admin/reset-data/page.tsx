"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Trash2, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function AdminResetPage() {
  const [confirmText, setConfirmText] = useState("");
  const [doubleConfirmText, setDoubleConfirmText] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Mutations
  const resetToProduction = useMutation(api.adminReset.resetToProduction);
  const getDataCounts = useMutation(api.adminReset.getDataCounts);
  const clearAllEvents = useMutation(api.adminReset.clearAllEvents);
  const clearAllTickets = useMutation(api.adminReset.clearAllTickets);
  const clearAllPurchases = useMutation(api.adminReset.clearAllPurchases);
  const clearAllTables = useMutation(api.adminReset.clearAllTables);
  const clearAllTransactions = useMutation(api.adminReset.clearAllTransactions);

  const handleCheckData = async () => {
    try {
      const counts = await getDataCounts();
      setResults(counts);
      toast({
        title: "Data Count Retrieved",
        description: `Total records: ${counts.total}`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get data counts",
      });
    }
  };

  const handleResetAll = async () => {
    if (confirmText !== "RESET_ALL_DATA" || doubleConfirmText !== "YES_DELETE_EVERYTHING") {
      toast({
        variant: "destructive",
        title: "Invalid Confirmation",
        description: "Please type the exact confirmation phrases",
      });
      return;
    }

    setIsResetting(true);
    try {
      const result = await resetToProduction({
        confirmReset: confirmText,
        confirmDoubleCheck: doubleConfirmText,
      });

      setResults(result);
      toast({
        title: "✅ Reset Complete",
        description: result.message,
      });

      // Clear the confirmation inputs
      setConfirmText("");
      setDoubleConfirmText("");
    } catch (error) {
      console.error("Reset error:", error);
      toast({
        variant: "destructive",
        title: "Reset Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handlePartialReset = async (type: string) => {
    if (confirmText !== "RESET_ALL_DATA") {
      toast({
        variant: "destructive",
        title: "Invalid Confirmation",
        description: "Please type RESET_ALL_DATA to confirm",
      });
      return;
    }

    setIsResetting(true);
    try {
      let result;
      switch (type) {
        case "events":
          result = await clearAllEvents({ confirmReset: confirmText });
          break;
        case "tickets":
          result = await clearAllTickets({ confirmReset: confirmText });
          break;
        case "purchases":
          result = await clearAllPurchases({ confirmReset: confirmText });
          break;
        case "tables":
          result = await clearAllTables({ confirmReset: confirmText });
          break;
        case "transactions":
          result = await clearAllTransactions({ confirmReset: confirmText });
          break;
        default:
          throw new Error("Invalid reset type");
      }

      toast({
        title: "✅ Partial Reset Complete",
        description: result.message,
      });

      // Refresh data counts
      await handleCheckData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Reset Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-8">
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <CardTitle className="text-red-900">⚠️ Admin Data Reset</CardTitle>
          </div>
          <CardDescription className="text-red-700">
            This will permanently delete all production data. Use with extreme caution!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Data Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Data Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={handleCheckData} variant="outline" className="mb-4">
                Check Data Counts
              </Button>
              
              {results?.counts && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  {Object.entries(results.counts).map(([key, value]) => (
                    <div key={key} className="flex justify-between p-2 bg-gray-50 rounded">
                      <span className="font-medium">{key}:</span>
                      <span>{value as number}</span>
                    </div>
                  ))}
                  <div className="col-span-full border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total Records:</span>
                      <span>{results.total}</span>
                    </div>
                    {results.isEmpty && (
                      <div className="flex items-center gap-2 mt-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Database is empty (ready for fresh start)</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Partial Reset Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Partial Reset Options</CardTitle>
              <CardDescription>Clear specific data types</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="mb-4">
                <label className="text-sm font-medium">
                  Type "RESET_ALL_DATA" to enable partial resets:
                </label>
                <Input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="RESET_ALL_DATA"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <Button
                  onClick={() => handlePartialReset("events")}
                  variant="destructive"
                  size="sm"
                  disabled={isResetting || confirmText !== "RESET_ALL_DATA"}
                >
                  Clear Events
                </Button>
                <Button
                  onClick={() => handlePartialReset("tickets")}
                  variant="destructive"
                  size="sm"
                  disabled={isResetting || confirmText !== "RESET_ALL_DATA"}
                >
                  Clear Tickets
                </Button>
                <Button
                  onClick={() => handlePartialReset("purchases")}
                  variant="destructive"
                  size="sm"
                  disabled={isResetting || confirmText !== "RESET_ALL_DATA"}
                >
                  Clear Purchases
                </Button>
                <Button
                  onClick={() => handlePartialReset("tables")}
                  variant="destructive"
                  size="sm"
                  disabled={isResetting || confirmText !== "RESET_ALL_DATA"}
                >
                  Clear Tables
                </Button>
                <Button
                  onClick={() => handlePartialReset("transactions")}
                  variant="destructive"
                  size="sm"
                  disabled={isResetting || confirmText !== "RESET_ALL_DATA"}
                >
                  Clear Transactions
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Complete Reset */}
          <Card className="border-red-400">
            <CardHeader>
              <CardTitle className="text-lg text-red-900">🔥 Complete Production Reset</CardTitle>
              <CardDescription className="text-red-700">
                This will delete ALL data except admin users
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  1. Type "RESET_ALL_DATA":
                </label>
                <Input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="RESET_ALL_DATA"
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  2. Type "YES_DELETE_EVERYTHING":
                </label>
                <Input
                  type="text"
                  value={doubleConfirmText}
                  onChange={(e) => setDoubleConfirmText(e.target.value)}
                  placeholder="YES_DELETE_EVERYTHING"
                  className="mt-1"
                />
              </div>

              <Button
                onClick={handleResetAll}
                variant="destructive"
                size="lg"
                className="w-full"
                disabled={
                  isResetting ||
                  confirmText !== "RESET_ALL_DATA" ||
                  doubleConfirmText !== "YES_DELETE_EVERYTHING"
                }
              >
                {isResetting ? (
                  "Resetting..."
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Execute Complete Reset
                  </>
                )}
              </Button>

              {results?.deletedCounts && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Reset Results:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(results.deletedCounts).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span>{key}:</span>
                        <span className="font-medium">{value as number} deleted</span>
                      </div>
                    ))}
                    <div className="col-span-full border-t pt-2 mt-2">
                      <div className="flex justify-between font-bold text-green-900">
                        <span>Total Deleted:</span>
                        <span>{results.totalDeleted}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}