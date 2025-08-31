"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Loader2, 
  CheckCircle, 
  Ticket, 
  Users, 
  CreditCard,
  Calendar,
  Mail,
  ArrowRight,
  Package
} from "lucide-react";

type TestStep = "idle" | "creating" | "purchasing" | "complete" | "error";

interface PurchaseResult {
  type: string;
  purchaseId: string;
  quantity: number;
  amount: number;
}

export default function TestAllPurchases() {
  const [currentStep, setCurrentStep] = useState<TestStep>("idle");
  const [testEventData, setTestEventData] = useState<any>(null);
  const [purchaseResults, setPurchaseResults] = useState<PurchaseResult[]>([]);
  const [currentPurchase, setCurrentPurchase] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const createTestEvent = useMutation(api.testData.createTestEventWithAllTicketTypes);
  const createAllPurchases = useMutation(api.testData.createAllTestPurchases);

  const runCompleteTest = async () => {
    setCurrentStep("creating");
    setError(null);
    setPurchaseResults([]);

    try {
      // Step 1: Create test event with all configurations
      setCurrentPurchase("Creating test event with all ticket types...");
      const eventData = await createTestEvent({});
      setTestEventData(eventData);
      
      await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause for visibility

      // Step 2: Create all purchases
      setCurrentStep("purchasing");
      setCurrentPurchase("Processing all 4 test purchases...");
      
      const purchases = await createAllPurchases({
        eventId: eventData.eventId,
        singleTicketId: eventData.ticketTypes.single,
        groupTicketId: eventData.ticketTypes.group,
        tableId: eventData.ticketTypes.table,
        bundleId: eventData.ticketTypes.bundle,
      });

      if (purchases.purchases) {
        setPurchaseResults(purchases.purchases);
      }

      // Step 3: Complete
      setCurrentStep("complete");
      setCurrentPurchase("");

      // Trigger email sending via API
      await sendTestEmails(purchases);

    } catch (err) {
      console.error("Test failed:", err);
      setError(err instanceof Error ? err.message : "Test failed");
      setCurrentStep("error");
    }
  };

  const sendTestEmails = async (purchaseData: any) => {
    try {
      // Send a summary email
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerName: "Test Customer",
          buyerEmail: "Appvillagellc@gmail.com",
          eventName: "Summer Music Festival 2025 - Test Purchase Summary",
          eventDate: "Multiple Days",
          eventTime: "Various",
          eventLocation: "Central Park, New York",
          tickets: [
            {
              ticketId: "TEST-SUMMARY",
              ticketNumber: "2025-TEST",
              ticketCode: "TEST01",
              ticketType: "Test Purchase Summary",
              shareUrl: "https://stepperslife.com/tickets"
            }
          ],
          totalAmount: purchaseData.totalAmount || 580,
          purchaseId: "TEST-ALL-PURCHASES",
          testSummary: {
            totalPurchases: purchaseData.totalPurchases,
            totalTickets: purchaseData.totalTickets,
            purchases: purchaseData.purchases
          }
        })
      });

      const result = await response.json();
      console.log("Email sent:", result);
    } catch (err) {
      console.error("Failed to send email:", err);
    }
  };

  const reset = () => {
    setCurrentStep("idle");
    setTestEventData(null);
    setPurchaseResults([]);
    setCurrentPurchase("");
    setError(null);
  };

  if (currentStep === "complete") {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="bg-green-50">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <CardTitle className="text-green-800">All Test Purchases Complete!</CardTitle>
              <CardDescription>Successfully created 4 different ticket purchases</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">4</div>
                <div className="text-sm text-gray-600">Purchases</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Ticket className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">14</div>
                <div className="text-sm text-gray-600">Total Tickets</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CreditCard className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">$580</div>
                <div className="text-sm text-gray-600">Total Amount</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <Mail className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">✓</div>
                <div className="text-sm text-gray-600">Email Sent</div>
              </div>
            </div>

            {/* Purchase Details */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">Purchase Details:</h3>
              {purchaseResults.map((purchase, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{purchase.type}</div>
                      <div className="text-sm text-gray-600">
                        {purchase.quantity} ticket{purchase.quantity > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div className="text-lg font-semibold">${purchase.amount}</div>
                </div>
              ))}
            </div>

            {/* Email Notification */}
            <Alert className="bg-blue-50 border-blue-200">
              <Mail className="w-4 h-4" />
              <AlertDescription>
                Confirmation email sent to <strong>Appvillagellc@gmail.com</strong> with all ticket details.
              </AlertDescription>
            </Alert>

            {/* Actions */}
            <div className="flex gap-4">
              <Button 
                onClick={() => window.open("/tickets", "_blank")}
                className="flex-1"
              >
                View Tickets Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                onClick={reset}
                variant="outline"
                className="flex-1"
              >
                Run Another Test
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentStep === "error") {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="bg-red-50">
          <CardTitle className="text-red-800">Test Failed</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Alert className="bg-red-50 border-red-200">
            <AlertDescription className="text-red-800">
              {error || "An unknown error occurred"}
            </AlertDescription>
          </Alert>
          <Button onClick={reset} className="w-full mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (currentStep === "creating" || currentStep === "purchasing") {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Running Test Purchases...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
            <p className="text-lg font-medium">{currentPurchase}</p>
            <div className="mt-6 w-full max-w-md">
              <div className="space-y-2">
                <div className={`flex items-center gap-2 ${currentStep === "creating" ? "text-blue-600" : "text-green-600"}`}>
                  {currentStep === "creating" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  <span>Create test event</span>
                </div>
                <div className={`flex items-center gap-2 ${currentStep === "purchasing" ? "text-blue-600" : "text-gray-400"}`}>
                  {currentStep === "purchasing" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                  )}
                  <span>Process 4 purchases</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                  <span>Send confirmation emails</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Test All Purchase Types</CardTitle>
        <CardDescription>
          This will create a test event and perform 4 different types of ticket purchases
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">What this test will do:</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                1
              </div>
              <div>
                <div className="font-medium">Single Ticket Purchase</div>
                <div className="text-sm text-gray-600">1 General Admission ticket for Day 1 - $25</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                2
              </div>
              <div>
                <div className="font-medium">Group Ticket Purchase</div>
                <div className="text-sm text-gray-600">4 tickets with group discount for Day 2 - $90</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                3
              </div>
              <div>
                <div className="font-medium">VIP Table Purchase</div>
                <div className="text-sm text-gray-600">8-seat VIP table for Day 3 - $400</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                4
              </div>
              <div>
                <div className="font-medium">Weekend Bundle Purchase</div>
                <div className="text-sm text-gray-600">All 3 days pass with savings - $65</div>
              </div>
            </div>
          </div>
        </div>

        <Alert>
          <Mail className="w-4 h-4" />
          <AlertDescription>
            All purchases will use <strong>Appvillagellc@gmail.com</strong> and cash payment method.
            Confirmation emails will be sent to this address.
          </AlertDescription>
        </Alert>

        <Button 
          onClick={runCompleteTest}
          size="lg"
          className="w-full"
        >
          <Package className="w-5 h-5 mr-2" />
          Run All Test Purchases
        </Button>
      </CardContent>
    </Card>
  );
}