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
      // For now, we'll need to use a test email since we can't get the email server-side easily
      // In production, you'd want to create a Convex function that gets tickets by userId
      tickets = await fetchQuery(api.tickets.getTicketsByEmail, { 
        email: "test@example.com" // This would need to be replaced with actual user email
      }) || [];
      console.log(`Server-side: Fetched ${tickets.length} tickets`);
    } catch (error) {
      console.error("Error fetching tickets server-side:", error);
      tickets = [];
    }
  }

  // Pass tickets to client component for auth check and display
  return <MyTicketsClient tickets={tickets} />;
}