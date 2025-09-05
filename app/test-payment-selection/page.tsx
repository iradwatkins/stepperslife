"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import PaymentSetupModal from "@/components/payments/PaymentSetupModal";
import { 
  CreditCard, 
  Package, 
  Shield, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from "lucide-react";

export default function TestPaymentSelection() {
  const { user } = useUser();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [testEventId, setTestEventId] = useState<Id<"events"> | null>(null);
  const [eventDetails, setEventDetails] = useState({
    expectedTickets: 250,
    averageTicketPrice: 45,
  });
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  interface TestResult {
    test: string;
    success: boolean;
    message: string;
    timestamp: string;
  }
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  
  // Mutations
  const initPackages = useMutation(api.creditPackages.initializeDefaultPackages);
  const createTestEvent = useMutation(api.events.create);
  
  // Queries
  const creditPackages = useQuery(api.creditPackages.getActivePackages);
  const creditBalance = useQuery(api.creditManager.getBalance, { 
    organizerId: user?.id || "" 
  });
  const optimalModel = useQuery(api.decisionEngine.calculateOptimalModel, {
    eventId: testEventId,
    organizerId: user?.id || "",
    expectedTickets: eventDetails.expectedTickets,
    averageTicketPrice: eventDetails.averageTicketPrice,
  });
  const paymentOptions = useQuery(api.decisionEngine.getAvailablePaymentOptions, {
    organizerId: user?.id || "",
  });
  
  // Initialize credit packages on mount
  useEffect(() => {
    const init = async () => {
      if (creditPackages && creditPackages.length === 0) {
        await initializePackages();
      }
    };
    init();
  }, [creditPackages]); // eslint-disable-line react-hooks/exhaustive-deps
  
  const initializePackages = async () => {
    try {
      const result = await initPackages({});
      addTestResult("Package Initialization", true, result.message);
    } catch (error) {
      addTestResult("Package Initialization", false, error instanceof Error ? error.message : 'Unknown error');
    }
  };
  
  const createMockEvent = async () => {
    if (!user) return;
    
    try {
      const eventId = await createTestEvent({
        name: "Test Payment Selection Event",
        description: "Testing payment model selection",
        location: "123 Test St, New York, NY",
        eventDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
        price: eventDetails.averageTicketPrice,
        totalTickets: eventDetails.expectedTickets,
        userId: user.id,
        isTicketed: true,
        eventType: "other",
      });
      
      setTestEventId(eventId);
      addTestResult("Event Creation", true, `Created event ID: ${eventId}`);
      return eventId;
    } catch (error) {
      addTestResult("Event Creation", false, error instanceof Error ? error.message : 'Unknown error');
      return null;
    }
  };
  
  const testPaymentSelection = async () => {
    const eventId = testEventId || await createMockEvent();
    if (eventId) {
      setTestEventId(eventId);
      setShowPaymentModal(true);
    }
  };
  
  const handlePaymentComplete = (model: string) => {
    setSelectedModel(model);
    setShowPaymentModal(false);
    addTestResult("Payment Model Selection", true, `Selected: ${model}`);
  };
  
  const testCreditPurchase = async () => {
    if (!user || !creditPackages || creditPackages.length === 0) {
      addTestResult("Credit Purchase", false, "No packages available");
      return;
    }
    
    try {
      const firstPackage = creditPackages[0];
      addTestResult("Credit Purchase", true, 
        `Would purchase ${firstPackage.credits} credits for $${firstPackage.price}`
      );
    } catch (error) {
      addTestResult("Credit Purchase", false, error instanceof Error ? error.message : 'Unknown error');
    }
  };
  
  const addTestResult = (test: string, success: boolean, message: string) => {
    setTestResults(prev => [...prev, {
      test,
      success,
      message,
      timestamp: new Date().toISOString(),
    }]);
  };
  
  const clearResults = () => {
    setTestResults([]);
    setTestEventId(null);
    setSelectedModel(null);
  };
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <p className="text-xl">Please sign in to test payment selection</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Payment Model Testing Dashboard</h1>
            <p className="text-gray-600">Test and validate the dual payment system implementation</p>
          </div>
          
          {/* Test Configuration */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Test Configuration</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Tickets
                </label>
                <input
                  type="number"
                  value={eventDetails.expectedTickets}
                  onChange={(e) => setEventDetails(prev => ({
                    ...prev,
                    expectedTickets: parseInt(e.target.value) || 0
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Average Ticket Price ($)
                </label>
                <input
                  type="number"
                  value={eventDetails.averageTicketPrice}
                  onChange={(e) => setEventDetails(prev => ({
                    ...prev,
                    averageTicketPrice: parseFloat(e.target.value) || 0
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>
          
          {/* Current State */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold">Credit Balance</h3>
              </div>
              <p className="text-2xl font-bold">{creditBalance?.availableCredits || 0}</p>
              <p className="text-sm text-gray-600">credits available</p>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-5 h-5 text-teal-600" />
                <h3 className="font-semibold">Credit Packages</h3>
              </div>
              <p className="text-2xl font-bold">{creditPackages?.length || 0}</p>
              <p className="text-sm text-gray-600">packages available</p>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold">Selected Model</h3>
              </div>
              <p className="text-lg font-bold">{selectedModel || "None"}</p>
              {testEventId && (
                <p className="text-sm text-gray-600">Event: {testEventId.slice(0, 8)}...</p>
              )}
            </div>
          </div>
          
          {/* Recommendation Display */}
          {optimalModel && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <div className="flex items-start gap-3">
                <TrendingUp className="text-blue-600 mt-1" />
                <div className="flex-1">
                  <p className="font-semibold text-blue-900">
                    Recommendation: {optimalModel.recommendation === "credits" ? "Prepaid Credits" : "Premium Processing"}
                  </p>
                  <ul className="text-sm text-blue-800 mt-2 space-y-1">
                    {optimalModel.reasons.map((reason, idx) => (
                      <li key={idx}>• {reason}</li>
                    ))}
                  </ul>
                  {optimalModel.comparison && (
                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-semibold">Credits Model:</span>
                        <span className="ml-2">${optimalModel.comparison.credits.totalFees.toFixed(2)} total fees</span>
                      </div>
                      <div>
                        <span className="font-semibold">Premium Model:</span>
                        <span className="ml-2">${optimalModel.comparison.premium.totalFees.toFixed(2)} total fees</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Test Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={testPaymentSelection}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 flex items-center gap-2"
              >
                <CreditCard className="w-5 h-5" />
                Test Payment Selection
              </button>
              
              <button
                onClick={testCreditPurchase}
                className="px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 flex items-center gap-2"
              >
                <Package className="w-5 h-5" />
                Test Credit Purchase
              </button>
              
              <button
                onClick={initializePackages}
                disabled={creditPackages && creditPackages.length > 0}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 flex items-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Initialize Packages
              </button>
              
              <button
                onClick={clearResults}
                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 flex items-center gap-2"
              >
                Clear Results
              </button>
            </div>
          </div>
          
          {/* Test Results */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="border rounded-lg divide-y">
              {testResults.length > 0 ? (
                testResults.map((result, idx) => (
                  <div key={idx} className="p-4 flex items-center gap-4">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold">{result.test}</p>
                      <p className="text-sm text-gray-600">{result.message}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <p>No test results yet. Run a test to see results here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* API Status */}
        <div className="mt-8 grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Available Payment Options</h3>
            {paymentOptions ? (
              <div className="space-y-3">
                {paymentOptions.options.map((option, idx) => (
                  <div key={idx} className="border rounded-lg p-3">
                    <p className="font-semibold">{option.name}</p>
                    <p className="text-sm text-gray-600">{option.description}</p>
                    <p className="text-sm mt-1">
                      <span className="font-medium">Fee:</span> {option.fee}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Loading payment options...</p>
            )}
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Organizer Profile</h3>
            {paymentOptions?.organizerProfile ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Trust Level:</span>
                  <span className="font-semibold">{paymentOptions.organizerProfile.trustLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Events Completed:</span>
                  <span className="font-semibold">{paymentOptions.organizerProfile.eventsCompleted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trust Score:</span>
                  <span className="font-semibold">{paymentOptions.organizerProfile.trustScore}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Has Credits:</span>
                  <span className="font-semibold">{paymentOptions.organizerProfile.hasCredits ? "Yes" : "No"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Credits Available:</span>
                  <span className="font-semibold">{paymentOptions.organizerProfile.creditsAvailable}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Loading profile...</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Payment Setup Modal */}
      {showPaymentModal && testEventId && (
        <PaymentSetupModal
          eventId={testEventId}
          organizerId={user.id}
          expectedTickets={eventDetails.expectedTickets}
          averageTicketPrice={eventDetails.averageTicketPrice}
          onComplete={handlePaymentComplete}
          onClose={() => setShowPaymentModal(false)}
        />
      )}
    </div>
  );
}