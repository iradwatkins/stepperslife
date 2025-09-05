"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { 
  CreditCard, 
  Package, 
  Check, 
  AlertCircle, 
  ArrowRight,
  Shield,
  Zap,
  TrendingUp
} from "lucide-react";

interface PaymentSetupModalProps {
  eventId: Id<"events">;
  organizerId: string;
  expectedTickets: number;
  averageTicketPrice: number;
  onComplete: (paymentModel: string) => void;
  onClose: () => void;
}

export default function PaymentSetupModal({
  eventId,
  organizerId,
  expectedTickets,
  averageTicketPrice,
  onComplete,
  onClose,
}: PaymentSetupModalProps) {
  const [step, setStep] = useState<"choose" | "setup-credits" | "setup-premium">("choose");
  const [selectedModel, setSelectedModel] = useState<"credits" | "premium" | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<Id<"creditPackages"> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Queries
  const paymentOptions = useQuery(api.decisionEngine.getAvailablePaymentOptions, { 
    organizerId 
  });
  
  const optimalModel = useQuery(api.decisionEngine.calculateOptimalModel, {
    eventId,
    organizerId,
    expectedTickets,
    averageTicketPrice,
  });
  
  const creditPackages = useQuery(api.creditManager.getCreditPackages);
  const creditBalance = useQuery(api.creditManager.getBalance, { organizerId });
  
  // Mutations
  const initializeConfig = useMutation(api.decisionEngine.initializePaymentConfig);
  const purchaseCredits = useMutation(api.creditManager.purchaseCredits);
  const updateEventStatus = useMutation(api.events.updateEventStatus);
  
  // Calculate fees for display
  const creditsFee = expectedTickets * 0.79;
  const premiumFee = (averageTicketPrice * expectedTickets * 0.064) + (expectedTickets * 0.99);
  const savings = premiumFee - creditsFee;
  const savingsPercent = ((savings / premiumFee) * 100).toFixed(1);
  
  const handleModelSelection = (model: "credits" | "premium") => {
    setSelectedModel(model);
    setStep(model === "credits" ? "setup-credits" : "setup-premium");
  };
  
  const handleCreditsPurchase = async () => {
    if (!selectedPackage) {
      alert("Please select a credit package");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Initialize payment config
      await initializeConfig({
        eventId,
        organizerId,
        paymentModel: "credits",
      });
      
      // In production, this would redirect to Stripe checkout
      // For now, we'll simulate the purchase
      console.log("Redirecting to purchase credits:", selectedPackage);
      
      // Simulate successful purchase
      await purchaseCredits({
        organizationId: organizerId,
        packageId: selectedPackage,
        quantity: 1,
        paymentReference: `sim_${Date.now()}`,
        paymentMethod: "stripe",
      });
      
      // Update event status to published
      await updateEventStatus({
        eventId,
        status: "published",
        paymentModel: "connect_collect",
      });
      
      onComplete("credits");
    } catch (error) {
      console.error("Error setting up credits:", error);
      alert("Failed to setup payment method. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handlePremiumSetup = async () => {
    setIsProcessing(true);
    
    try {
      // Initialize payment config
      await initializeConfig({
        eventId,
        organizerId,
        paymentModel: "premium",
      });
      
      // In production, would collect bank details
      console.log("Setting up premium processing");
      
      // Update event status to published
      await updateEventStatus({
        eventId,
        status: "published",
        paymentModel: "premium",
      });
      
      onComplete("premium");
    } catch (error) {
      console.error("Error setting up premium:", error);
      alert("Failed to setup payment method. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (!paymentOptions || !optimalModel || !creditPackages) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-pulse">Loading payment options...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={(e) => e.stopPropagation()}>
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="border-b p-6">
          <h2 className="text-2xl font-bold">Choose Your Payment Model</h2>
          <p className="text-gray-600 mt-2">
            Select how you want to handle ticket payments for this event
          </p>
          <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800 font-medium">
              ⚠️ Payment setup is required before your event can go live
            </p>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {step === "choose" && (
            <div className="space-y-6">
              {/* Recommendation Banner */}
              {optimalModel.recommendation && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="text-blue-600 mt-1" />
                    <div>
                      <p className="font-semibold text-blue-900">
                        Recommended: {optimalModel.recommendation === "credits" ? "Prepaid Credits" : "Full Processing"}
                      </p>
                      <ul className="text-sm text-blue-800 mt-1 space-y-1">
                        {optimalModel.reasons.map((reason, idx) => (
                          <li key={idx}>• {reason}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Payment Model Options */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Credits Option */}
                <div 
                  className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                    selectedModel === "credits" 
                      ? "border-purple-600 bg-purple-50" 
                      : "border-gray-200 hover:border-purple-300"
                  }`}
                  onClick={() => setSelectedModel("credits")}
                >
                  <div className="flex items-start justify-between mb-4">
                    <Package className="text-purple-600 w-8 h-8" />
                    {optimalModel.recommendation === "credits" && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                        BEST VALUE
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">Prepaid Credits</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Buy credits upfront at $0.79 each, connect your own processor
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="text-green-600 w-4 h-4" />
                      <span>Lowest fees - just $0.79 per ticket</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="text-green-600 w-4 h-4" />
                      <span>Instant access to funds</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="text-green-600 w-4 h-4" />
                      <span>Use Stripe, Square, or PayPal</span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold">For this event:</p>
                    <p className="text-2xl font-bold text-purple-600">
                      ${creditsFee.toFixed(2)} total fees
                    </p>
                    <p className="text-sm text-gray-600">
                      {expectedTickets} tickets × $0.79
                    </p>
                    {savings > 0 && (
                      <p className="text-sm text-green-600 font-semibold mt-1">
                        Save ${savings.toFixed(2)} ({savingsPercent}%)
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Premium Option */}
                <div 
                  className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                    selectedModel === "premium" 
                      ? "border-teal-600 bg-teal-50" 
                      : "border-gray-200 hover:border-teal-300"
                  }`}
                  onClick={() => setSelectedModel("premium")}
                >
                  <div className="flex items-start justify-between mb-4">
                    <Shield className="text-teal-600 w-8 h-8" />
                    {optimalModel.recommendation === "premium" && (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                        RECOMMENDED
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">Full Processing</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    We handle everything - payments, disputes, support
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="text-green-600 w-4 h-4" />
                      <span>No upfront costs</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="text-green-600 w-4 h-4" />
                      <span>Chargeback protection</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="text-green-600 w-4 h-4" />
                      <span>24/7 customer support</span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold">For this event:</p>
                    <p className="text-2xl font-bold text-teal-600">
                      ${premiumFee.toFixed(2)} total fees
                    </p>
                    <p className="text-sm text-gray-600">
                      3.5% + $0.99 per ticket
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Payout 5 days after event
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Continue Button */}
              <div className="flex justify-between items-center pt-4 border-t">
                <button
                  onClick={() => {
                    if (confirm("Your event won't be visible to customers until you select a payment method. Save as draft?")) {
                      onClose();
                    }
                  }}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800"
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => handleModelSelection(selectedModel!)}
                  disabled={!selectedModel}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          
          {step === "setup-credits" && (
            <div className="space-y-6">
              {/* Current Balance */}
              {creditBalance && creditBalance.availableCredits > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800">
                    You have <span className="font-bold">{creditBalance.availableCredits} credits</span> available.
                    {creditBalance.availableCredits >= expectedTickets ? (
                      <span> That&apos;s enough for this event!</span>
                    ) : (
                      <span> You need {expectedTickets - creditBalance.availableCredits} more credits.</span>
                    )}
                  </p>
                </div>
              )}
              
              {/* Credit Packages */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Select Credit Package</h3>
                <div className="grid gap-4">
                  {creditPackages.map((pkg) => (
                    <div
                      key={pkg._id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedPackage === pkg._id
                          ? "border-purple-600 bg-purple-50"
                          : "border-gray-200 hover:border-purple-300"
                      }`}
                      onClick={() => setSelectedPackage(pkg._id)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold">{pkg.name}</h4>
                            {pkg.popularBadge && (
                              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-semibold">
                                MOST POPULAR
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{pkg.description}</p>
                          <p className="text-sm mt-2">
                            <span className="font-semibold">{pkg.credits} credits</span> for{" "}
                            <span className="font-semibold">${pkg.price}</span>
                          </p>
                          {pkg.savingsPercent > 0 && (
                            <p className="text-sm text-green-600 font-semibold">
                              Save {pkg.savingsPercent}%
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">${pkg.price}</p>
                          <p className="text-sm text-gray-600">
                            ${(pkg.price / pkg.credits).toFixed(3)}/credit
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Next Step: Connect Processor */}
              <div className="border-t pt-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-yellow-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-yellow-900">Next: Connect Your Payment Processor</p>
                      <p className="text-yellow-800">
                        After purchasing credits, you&apos;ll need to connect your Stripe, Square, or PayPal account
                        to receive payments directly from customers.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={() => setStep("choose")}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCreditsPurchase}
                    disabled={!selectedPackage || isProcessing}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? "Processing..." : "Purchase Credits & Continue"}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {step === "setup-premium" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Full Service Processing Setup</h3>
                <p className="text-gray-600 mb-6">
                  We&apos;ll handle all payment processing for this event. You&apos;ll receive payouts 5 days after your event.
                </p>
                
                {/* Fee Breakdown */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold mb-3">Fee Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Service Fee (3.5%)</span>
                      <span>${((averageTicketPrice * expectedTickets * 0.035)).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fixed Fee ($0.99 × {expectedTickets} tickets)</span>
                      <span>${(expectedTickets * 0.99).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Processing Fee (2.9%)</span>
                      <span>${((averageTicketPrice * expectedTickets * 0.029)).toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Total Fees</span>
                      <span>${premiumFee.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Benefits */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Shield className="text-teal-600 mt-0.5" />
                    <div>
                      <p className="font-semibold">Chargeback Protection</p>
                      <p className="text-sm text-gray-600">We handle all disputes and chargebacks</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Zap className="text-teal-600 mt-0.5" />
                    <div>
                      <p className="font-semibold">No Setup Required</p>
                      <p className="text-sm text-gray-600">Start selling tickets immediately</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CreditCard className="text-teal-600 mt-0.5" />
                    <div>
                      <p className="font-semibold">All Payment Methods</p>
                      <p className="text-sm text-gray-600">Accept cards, digital wallets, and more</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <button
                    onClick={() => setStep("choose")}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Back
                  </button>
                  <button
                    onClick={handlePremiumSetup}
                    disabled={isProcessing}
                    className="px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? "Setting up..." : "Continue with Full Processing"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}