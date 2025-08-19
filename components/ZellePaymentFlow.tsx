"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Copy, CheckCircle, Clock, Send, AlertCircle, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ZellePaymentFlowProps {
  eventId: Id<"events">;
  userId: string;
  waitingListId: Id<"waitingList">;
  amount: number;
  eventName: string;
  onComplete?: () => void;
  onCancel?: () => void;
}

export default function ZellePaymentFlow({
  eventId,
  userId,
  waitingListId,
  amount,
  eventName,
  onComplete,
  onCancel,
}: ZellePaymentFlowProps) {
  const [step, setStep] = useState<"instructions" | "proof" | "complete">("instructions");
  const [proofText, setProofText] = useState("");
  const [paymentRequest, setPaymentRequest] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createPaymentRequest = useMutation(api.zellePayments.createZellePaymentRequest);
  const submitProof = useMutation(api.zellePayments.submitZelleProof);

  const handleCreatePaymentRequest = async () => {
    setIsCreating(true);
    try {
      const result = await createPaymentRequest({
        eventId,
        userId,
        waitingListId,
        amount,
      });
      setPaymentRequest(result);
      setStep("instructions");
    } catch (error) {
      console.error("Failed to create payment request:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create payment request. Please try again.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const handleSubmitProof = async () => {
    if (!proofText.trim() || !paymentRequest) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your Zelle confirmation number",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitProof({
        paymentRequestId: paymentRequest.paymentRequestId,
        proofText: proofText.trim(),
      });
      setStep("complete");
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error("Failed to submit proof:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit proof. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Initialize payment request on mount
  if (!paymentRequest && !isCreating) {
    handleCreatePaymentRequest();
  }

  if (!paymentRequest) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Creating payment request...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const expiresIn = new Date(paymentRequest.expiresAt);
  const daysLeft = Math.ceil((expiresIn.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-4">
      {step === "instructions" && (
        <>
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Zelle Payment Instructions
              </CardTitle>
              <CardDescription>
                Follow these steps to complete your payment via Zelle
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Reference Code */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important Reference Code</AlertTitle>
                <AlertDescription className="mt-2">
                  <div className="flex items-center justify-between">
                    <code className="text-lg font-mono font-bold">
                      {paymentRequest.referenceCode}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleCopyToClipboard(
                          paymentRequest.referenceCode,
                          "Reference code"
                        )
                      }
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                  </div>
                  <p className="text-sm mt-2">
                    Include this code in your Zelle payment memo/notes
                  </p>
                </AlertDescription>
              </Alert>

              {/* Payment Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-600">Send To</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="font-medium">
                        {paymentRequest.paymentInstructions.zelleEmail}
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          handleCopyToClipboard(
                            paymentRequest.paymentInstructions.zelleEmail,
                            "Email"
                          )
                        }
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-gray-600">Amount</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="font-medium text-lg">${amount.toFixed(2)}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          handleCopyToClipboard(amount.toFixed(2), "Amount")
                        }
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-600">Event</Label>
                  <p className="font-medium mt-1">{eventName}</p>
                </div>

                <div>
                  <Label className="text-gray-600">Payment Expires</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <p className="text-sm">
                      {daysLeft} days remaining ({expiresIn.toLocaleDateString()})
                    </p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">How to Pay:</h4>
                <ol className="space-y-2 text-sm text-blue-800">
                  <li>1. Open your Zelle app or banking app with Zelle</li>
                  <li>2. Send ${amount.toFixed(2)} to {paymentRequest.paymentInstructions.zelleEmail}</li>
                  <li>3. Include reference code <strong>{paymentRequest.referenceCode}</strong> in the memo</li>
                  <li>4. Complete the payment and note the confirmation number</li>
                  <li>5. Return here and click "I've Sent Payment" below</li>
                </ol>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setStep("proof")}
                  className="flex-1"
                  size="lg"
                >
                  I've Sent Payment
                </Button>
                {onCancel && (
                  <Button onClick={onCancel} variant="outline" size="lg">
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {step === "proof" && (
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Submit Payment Proof</CardTitle>
            <CardDescription>
              Enter your Zelle confirmation or transaction number
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="proof">Zelle Confirmation Number</Label>
              <Input
                id="proof"
                type="text"
                placeholder="Enter your Zelle confirmation number"
                value={proofText}
                onChange={(e) => setProofText(e.target.value)}
                className="mt-2"
              />
              <p className="text-sm text-gray-600 mt-1">
                This is usually shown after you complete the Zelle transfer
              </p>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your payment will be verified within 1-3 business days. You'll receive an
                email confirmation once your ticket is confirmed.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button
                onClick={handleSubmitProof}
                disabled={!proofText.trim() || isSubmitting}
                className="flex-1"
                size="lg"
              >
                {isSubmitting ? "Submitting..." : "Submit Proof"}
              </Button>
              <Button
                onClick={() => setStep("instructions")}
                variant="outline"
                size="lg"
              >
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === "complete" && (
        <Card className="w-full max-w-2xl">
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <h3 className="text-2xl font-bold">Payment Submitted!</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Your Zelle payment has been submitted for verification. You'll receive
                an email confirmation once your ticket is confirmed (usually within 1-3
                business days).
              </p>
              <div className="bg-gray-50 rounded-lg p-4 max-w-sm mx-auto">
                <p className="text-sm font-medium">Reference Code</p>
                <p className="font-mono text-lg">{paymentRequest.referenceCode}</p>
              </div>
              <Button onClick={onComplete} size="lg">
                Done
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}