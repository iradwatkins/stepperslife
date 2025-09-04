"use client";

import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CreditCard, Shield, Share2, Lock, Check, X, AlertCircle, Trophy, Star } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface PaymentModelSelectorProps {
  organizerId: string;
  onSelect: (model: "connect_collect" | "premium" | "split") => void;
  selectedModel?: string;
  ticketPrice?: number; // For fee calculation preview
}

export default function PaymentModelSelector({
  organizerId,
  onSelect,
  selectedModel,
  ticketPrice = 50, // Default for preview
}: PaymentModelSelectorProps) {
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  
  // Get available options based on trust level
  const paymentOptions = useQuery(api.trust.trustScoring.getAvailablePaymentOptions, {
    organizerId,
  });

  if (!paymentOptions) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const { trustLevel, trustScore, options, limits, privileges } = paymentOptions;

  // Calculate fees for preview
  const calculateFees = (model: string) => {
    switch (model) {
      case "connect_collect":
        return {
          platformFee: 2.00,
          processingFee: ticketPrice * 0.029,
          total: 2.00 + ticketPrice * 0.029,
          organizerReceives: ticketPrice - 2.00,
        };
      case "premium":
        const serviceFee = ticketPrice * 0.037 + 1.79;
        const processingFee = ticketPrice * 0.029;
        return {
          platformFee: serviceFee,
          processingFee,
          total: serviceFee + processingFee,
          organizerReceives: ticketPrice - serviceFee - processingFee,
        };
      case "split":
        const platformSplit = ticketPrice * 0.1; // 10%
        return {
          platformFee: platformSplit,
          processingFee: ticketPrice * 0.029,
          total: platformSplit + ticketPrice * 0.029,
          organizerReceives: ticketPrice * 0.9,
        };
      default:
        return { platformFee: 0, processingFee: 0, total: 0, organizerReceives: ticketPrice };
    }
  };

  // Trust level badge color
  const getTrustLevelColor = () => {
    switch (trustLevel) {
      case "VIP": return "bg-purple-500";
      case "TRUSTED": return "bg-blue-500";
      case "BASIC": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Trust Level Display */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <CardTitle className="text-lg">Your Trust Level</CardTitle>
              <Badge className={cn("ml-2", getTrustLevelColor())}>
                {trustLevel}
              </Badge>
            </div>
            <div className="text-sm text-gray-600">
              Score: {trustScore}/100
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={trustScore} className="mb-3" />
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Max Event Value:</span>
              <p className="font-semibold">${limits.maxEventValue.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-gray-500">Max Ticket Price:</span>
              <p className="font-semibold">${limits.maxTicketPrice}</p>
            </div>
            <div>
              <span className="text-gray-500">Payout Delay:</span>
              <p className="font-semibold">{limits.holdPeriod} days</p>
            </div>
          </div>
          
          {/* Privileges */}
          {(privileges.instantPayout || privileges.reducedFees || privileges.prioritySupport) && (
            <div className="flex gap-2 mt-4">
              {privileges.instantPayout && (
                <Badge variant="outline" className="text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Instant Payouts
                </Badge>
              )}
              {privileges.reducedFees && (
                <Badge variant="outline" className="text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Reduced Fees
                </Badge>
              )}
              {privileges.prioritySupport && (
                <Badge variant="outline" className="text-xs">
                  <Star className="w-3 h-3 mr-1" />
                  Priority Support
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Options */}
      <div className="grid gap-4 md:grid-cols-3">
        {options.map((option) => {
          const fees = calculateFees(option.id);
          const isSelected = selectedModel === option.id;
          const isHovered = hoveredOption === option.id;

          return (
            <Card
              key={option.id}
              className={cn(
                "relative transition-all cursor-pointer",
                isSelected && "ring-2 ring-blue-500",
                option.locked && "opacity-60",
                !option.locked && "hover:shadow-lg"
              )}
              onMouseEnter={() => setHoveredOption(option.id)}
              onMouseLeave={() => setHoveredOption(null)}
              onClick={() => !option.locked && onSelect(option.id as any)}
            >
              {/* Lock Overlay */}
              {option.locked && (
                <div className="absolute inset-0 bg-gray-900/5 rounded-lg flex items-center justify-center z-10">
                  <Lock className="w-8 h-8 text-gray-400" />
                </div>
              )}

              {/* Selected Badge */}
              {isSelected && (
                <div className="absolute top-2 right-2 z-20">
                  <Badge className="bg-blue-500">Selected</Badge>
                </div>
              )}

              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {option.id === "connect_collect" && <CreditCard className="w-5 h-5 text-blue-500" />}
                    {option.id === "premium" && <Shield className="w-5 h-5 text-purple-500" />}
                    {option.id === "split" && <Share2 className="w-5 h-5 text-green-500" />}
                    <CardTitle className="text-lg">{option.name}</CardTitle>
                  </div>
                </div>
                <CardDescription className="mt-1">
                  {option.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Fee Display */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                  <div className="text-sm font-medium mb-1">Fees per ${ticketPrice} ticket:</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {option.fee}
                  </div>
                  {(isHovered || isSelected) && !option.locked && (
                    <div className="mt-2 space-y-1 text-xs text-gray-600">
                      <div className="flex justify-between">
                        <span>Platform fee:</span>
                        <span>${fees.platformFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Processing:</span>
                        <span>${fees.processingFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold pt-1 border-t">
                        <span>You receive:</span>
                        <span className="text-green-600">
                          ${fees.organizerReceives.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pros and Cons */}
                <div className="space-y-2">
                  <div className="space-y-1">
                    {option.pros.map((pro, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{pro}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1">
                    {option.cons.map((con, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{con}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lock Reason or Requirements */}
                {option.locked && option.lockReason && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-yellow-800 dark:text-yellow-200">
                          {option.lockReason}
                        </p>
                        {option.requirements.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {option.requirements.map((req, i) => (
                              <li key={i} className="text-xs text-yellow-700 dark:text-yellow-300">
                                • {req}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Select Button */}
                {!option.locked && (
                  <Button 
                    className="w-full"
                    variant={isSelected ? "default" : "outline"}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect(option.id as any);
                    }}
                  >
                    {isSelected ? "Selected" : "Select This Option"}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Fee Comparison Table */}
      {ticketPrice && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fee Comparison for ${ticketPrice} Ticket</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Payment Model</th>
                    <th className="text-right py-2">Platform Fee</th>
                    <th className="text-right py-2">Processing</th>
                    <th className="text-right py-2">Total Fees</th>
                    <th className="text-right py-2 font-semibold">You Receive</th>
                  </tr>
                </thead>
                <tbody>
                  {options.map((option) => {
                    const fees = calculateFees(option.id);
                    return (
                      <tr key={option.id} className="border-b">
                        <td className="py-2">
                          {option.name}
                          {option.locked && (
                            <Lock className="inline-block w-3 h-3 ml-1 text-gray-400" />
                          )}
                        </td>
                        <td className="text-right py-2">${fees.platformFee.toFixed(2)}</td>
                        <td className="text-right py-2">${fees.processingFee.toFixed(2)}</td>
                        <td className="text-right py-2">${fees.total.toFixed(2)}</td>
                        <td className="text-right py-2 font-semibold text-green-600">
                          ${fees.organizerReceives.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">How to unlock more payment options:</p>
            <ul className="space-y-1 ml-4">
              <li>• Complete more events to increase your trust score</li>
              <li>• Maintain low chargeback and dispute rates</li>
              <li>• Generate consistent revenue through the platform</li>
              <li>• Keep your account in good standing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}