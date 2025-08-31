"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, XCircle, Clock, Eye, Send, DollarSign, User, Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function AdminPaymentVerification() {
  const { user, isSignedIn } = useAuth();
  const adminUserId = user?.id || "";
  
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [verifyAction, setVerifyAction] = useState<"approve" | "reject" | null>(null);

  const pendingPayments = useQuery(api.zellePayments.getPendingZellePayments);
  const verifyPayment = useMutation(api.zellePayments.verifyZellePayment);

  const handleVerifyPayment = async () => {
    if (!selectedPayment || !verifyAction || !confirmationCode) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter the confirmation code",
      });
      return;
    }

    if (verifyAction === "reject" && !rejectionReason) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a reason for rejection",
      });
      return;
    }

    setIsProcessing(true);
    try {
      await verifyPayment({
        paymentRequestId: selectedPayment._id,
        adminUserId,
        confirmationCode,
        action: verifyAction,
        rejectionReason: verifyAction === "reject" ? rejectionReason : undefined,
      });

      toast({
        title: "Success",
        description: `Payment ${verifyAction === "approve" ? "approved" : "rejected"} successfully`,
      });

      setShowVerifyDialog(false);
      setSelectedPayment(null);
      setConfirmationCode("");
      setRejectionReason("");
      setVerifyAction(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to verify payment",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const openVerifyDialog = (payment: any, action: "approve" | "reject") => {
    setSelectedPayment(payment);
    setVerifyAction(action);
    setShowVerifyDialog(true);
    setConfirmationCode("");
    setRejectionReason("");
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getDaysAgo = (timestamp: number) => {
    const days = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "1 day ago";
    return `${days} days ago`;
  };

  if (!pendingPayments) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading pending payments...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Pending Zelle Payments</span>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {pendingPayments.length} Pending
            </Badge>
          </CardTitle>
          <CardDescription>
            Review and verify manual Zelle payments. Use the verification code to approve or reject payments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingPayments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No pending payments to review</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Proof</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingPayments.map((payment) => (
                  <TableRow key={payment._id}>
                    <TableCell>
                      <code className="font-mono text-sm">{payment.referenceNumber}</code>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{payment.user?.name || "Unknown"}</p>
                        <p className="text-sm text-gray-600">{payment.user?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{payment.event?.name}</p>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">${payment.amount.toFixed(2)}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{getDaysAgo(payment.proofUploadedAt || payment.createdAt)}</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(payment.proofUploadedAt || payment.createdAt)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {payment.instructions.proofText ? (
                        <div>
                          <p className="text-sm font-medium">Confirmation:</p>
                          <code className="text-xs">{payment.instructions.proofText}</code>
                        </div>
                      ) : (
                        <span className="text-gray-500">No proof</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => openVerifyDialog(payment, "approve")}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openVerifyDialog(payment, "reject")}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Verification Dialog */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {verifyAction === "approve" ? "Approve Payment" : "Reject Payment"}
            </DialogTitle>
            <DialogDescription>
              Enter the verification code to {verifyAction} this payment.
              {selectedPayment && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm">
                    <strong>Reference:</strong> {selectedPayment.referenceNumber}
                  </p>
                  <p className="text-sm">
                    <strong>Amount:</strong> ${selectedPayment.amount.toFixed(2)}
                  </p>
                  <p className="text-sm">
                    <strong>User:</strong> {selectedPayment.user?.email}
                  </p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter verification code"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: VERIFY-{selectedPayment?.referenceNumber}
              </p>
            </div>
            
            {verifyAction === "reject" && (
              <div>
                <Label htmlFor="reason">Rejection Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Explain why this payment is being rejected"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="mt-2"
                  rows={3}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowVerifyDialog(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerifyPayment}
              disabled={!confirmationCode || isProcessing || (verifyAction === "reject" && !rejectionReason)}
              variant={verifyAction === "approve" ? "default" : "destructive"}
            >
              {isProcessing ? "Processing..." : `Confirm ${verifyAction === "approve" ? "Approval" : "Rejection"}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}