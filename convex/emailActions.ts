import { action } from "./_generated/server";
import { v } from "convex/values";

// Action to send purchase confirmation email
export const sendPurchaseEmail = action({
  args: {
    buyerName: v.string(),
    buyerEmail: v.string(),
    eventName: v.string(),
    eventDate: v.string(),
    eventTime: v.string(),
    eventLocation: v.string(),
    tickets: v.array(v.object({
      ticketId: v.string(),
      ticketNumber: v.string(),
      ticketCode: v.string(),
      ticketType: v.string(),
      shareUrl: v.string(),
    })),
    totalAmount: v.number(),
    purchaseId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Make API call to our email endpoint
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://stepperslife.com';
      const response = await fetch(`${baseUrl}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buyerName: args.buyerName,
          buyerEmail: args.buyerEmail,
          eventName: args.eventName,
          eventDate: args.eventDate,
          eventTime: args.eventTime,
          eventLocation: args.eventLocation,
          tickets: args.tickets.map(ticket => ({
            ...ticket,
            qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(ticket.shareUrl)}`
          })),
          totalAmount: args.totalAmount,
          purchaseId: args.purchaseId,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Email sent successfully to:', args.buyerEmail);
      } else {
        console.error('❌ Failed to send email:', result.error);
      }
      
      return result;
    } catch (error) {
      console.error('Error sending email:', error);
      return { success: false, error: 'Failed to send email' };
    }
  },
});