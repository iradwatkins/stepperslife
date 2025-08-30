"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function createCashAppCheckoutSession(ticketDetails: {
  ticketId: string;
  eventId: string;
  eventName: string;
  amount: number;
  userId: string;
  sellerId: string;
}) {
  const { userId: authUserId } = await auth();
  if (!authUserId) {
    throw new Error("Unauthorized");
  }

  const { ticketId, eventId, eventName, amount, userId, sellerId } = ticketDetails;

  // Cash App Pay integration
  // In production, you would integrate with Cash App Pay API
  // For now, we'll create a payment link format
  
  const CASH_APP_HANDLE = process.env.CASH_APP_HANDLE || "$SteppersLife";
  const referenceId = `TKT-${ticketId.slice(-8)}-${Date.now()}`;
  
  // Cash App payment link format
  // https://cash.app/$cashtag/amount?note=description
  const cashAppUrl = `https://cash.app/${CASH_APP_HANDLE}/${amount}`;
  
  // URL encode the note/memo
  const note = encodeURIComponent(`${eventName} - Ticket #${referenceId}`);
  const paymentUrl = `${cashAppUrl}?note=${note}`;

  // In production, you would:
  // 1. Create a payment request via Cash App Pay API
  // 2. Store the payment intent in your database
  // 3. Set up webhook to receive payment confirmation
  // 4. Return the Cash App Pay URL or QR code

  return {
    url: paymentUrl,
    referenceId,
    amount,
    // For development/testing
    testMode: true,
    instructions: `Send $${amount} to ${CASH_APP_HANDLE} with reference: ${referenceId}`
  };
}