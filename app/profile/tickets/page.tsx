import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { auth } from "@clerk/nextjs/server";
import MyTicketsClient from "@/components/MyTicketsClient";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MyTicketsPage() {
  // Get user from Clerk auth
  const { userId } = await auth();
  
  // Fetch tickets server-side
  let tickets = [];
  
  if (userId) {
    try {
      // Use the new getTicketsByUserId function that looks up tickets by userId
      tickets = await fetchQuery(api.tickets.getTicketsByUserId, { 
        userId: userId
      }) || [];
      console.log(`Server-side: Fetched ${tickets.length} tickets for user ${userId}`);
    } catch (error) {
      console.error("Error fetching tickets server-side:", error);
      tickets = [];
    }
  }

  // Pass tickets to client component for auth check and display
  return <MyTicketsClient tickets={tickets} />;
}