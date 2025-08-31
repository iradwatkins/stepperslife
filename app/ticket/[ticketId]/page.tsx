import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import TicketDisplayClient from "@/components/TicketDisplayClient";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// This page is PUBLIC - no authentication required
export default async function PublicTicketPage({ 
  params 
}: { 
  params: { ticketId: string } 
}) {
  const ticketId = params.ticketId;
  
  // Fetch ticket server-side
  let ticket = null;
  
  try {
    ticket = await fetchQuery(api.tickets.getTicketById, { ticketId });
    console.log(`Server-side: Fetched ticket ${ticketId}`);
  } catch (error) {
    console.error("Error fetching ticket server-side:", error);
    ticket = null;
  }

  // Pass ticket to client component for QR code generation and display
  return <TicketDisplayClient ticket={ticket} />;
}