import { useState } from "react";
import { cn, getButtonClass, getCardClass } from "@/lib/utils/cn";
import { DollarSign, Wallet, Send, AlertCircle, Clock } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface PayoutInfo {
  availableBalance: number;
  pendingBalance: number;
  nextPayoutDate: string | null;
  payoutMethod: string | null;
  minimumPayout: number;
}

interface PayoutSectionProps {
  payoutInfo: PayoutInfo;
  canRequestPayout: boolean;
  className?: string;
}

export function PayoutSection({ payoutInfo, canRequestPayout, className }: PayoutSectionProps) {
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestPayout = async () => {
    setIsRequesting(true);
    try {
      // TODO: Implement actual payout request
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      toast({
        title: "Payout Requested",
        description: "Your payout request has been submitted and will be processed within 2-3 business days.",
      });
    } catch (error) {
      toast({
        title: "Request Failed",
        description: "Failed to request payout. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsRequesting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={getCardClass("default")}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Available Balance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatCurrency(payoutInfo.availableBalance)}
              </p>
              <p className="text-xs text-gray-500 mt-2">Ready for payout</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Wallet className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className={getCardClass("default")}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Balance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatCurrency(payoutInfo.pendingBalance)}
              </p>
              <p className="text-xs text-gray-500 mt-2">Processing</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className={getCardClass("default")}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Next Payout</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                {payoutInfo.nextPayoutDate
                  ? new Date(payoutInfo.nextPayoutDate).toLocaleDateString()
                  : "Not scheduled"}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {payoutInfo.payoutMethod || "No method set"}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Send className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Payout Request Section */}
      <div className={getCardClass("default")}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Request Payout
        </h3>

        {!payoutInfo.payoutMethod && (
          <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Payment Method Required
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Please set up your payment method before requesting a payout.
              </p>
              <button className="mt-2 text-sm font-medium text-yellow-600 hover:text-yellow-700 underline">
                Set up payment method →
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                Minimum payout amount
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                You need at least {formatCurrency(payoutInfo.minimumPayout)} to request a payout
              </p>
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {formatCurrency(payoutInfo.minimumPayout)}
            </p>
          </div>

          <button
            onClick={handleRequestPayout}
            disabled={!canRequestPayout || !payoutInfo.payoutMethod || isRequesting}
            className={cn(
              getButtonClass("primary"),
              "w-full py-3 flex items-center justify-center",
              (!canRequestPayout || !payoutInfo.payoutMethod) && "opacity-50 cursor-not-allowed"
            )}
          >
            {isRequesting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Processing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Request Payout ({formatCurrency(payoutInfo.availableBalance)})
              </>
            )}
          </button>

          {!canRequestPayout && payoutInfo.payoutMethod && (
            <p className="text-sm text-center text-gray-600 dark:text-gray-400">
              You need {formatCurrency(payoutInfo.minimumPayout - payoutInfo.availableBalance)} more to request a payout
            </p>
          )}
        </div>
      </div>

      {/* Payout History */}
      <div className={getCardClass("default")}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recent Payouts
        </h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No payout history available
        </div>
      </div>
    </div>
  );
}