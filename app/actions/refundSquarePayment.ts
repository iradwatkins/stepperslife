"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getRefundsApi, getLocationId } from "@/lib/square";
import { getConvexClient } from "@/lib/convex";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export async function refundSquarePayment({
  ticketId,
  reason = "Event cancelled",
}: {
  ticketId: Id<"tickets">;
  reason?: string;
}) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.email;
  if (!userId) throw new Error("Not authenticated");
  
  const convex = getConvexClient();
  
  try {
    // Get ticket details
    const ticket = await convex.query(api.tickets.getTicketById, { ticketId });
    if (!ticket) throw new Error("Ticket not found");
    
    // Check if ticket can be refunded
    if (ticket.status === "refunded") {
      return {
        success: false,
        error: "Ticket already refunded",
      };
    }
    
    if (!ticket.paymentIntentId || !ticket.amount) {
      return {
        success: false,
        error: "No payment information found for this ticket",
      };
    }
    
    // Create refund with Square
    const refundsApi = await getRefundsApi();
    const locationId = await getLocationId();
    
    const refundResponse = await refundsApi.refundPayment({
      idempotencyKey: `refund-${ticketId}-${Date.now()}`,
      body: {
        paymentId: ticket.paymentIntentId,
        amountMoney: {
          amount: BigInt(ticket.amount),
          currency: "USD",
        },
        reason,
      },
    });
    
    if (refundResponse.result.refund) {
      // Update ticket status in database
      await convex.mutation(api.tickets.markAsRefunded, {
        ticketId,
        refundId: refundResponse.result.refund.id || "",
      });
      
      return {
        success: true,
        refundId: refundResponse.result.refund.id,
      };
    }
    
    return {
      success: false,
      error: "Failed to process refund",
    };
  } catch (error) {
    console.error("Error refunding payment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to refund payment",
    };
  }
}