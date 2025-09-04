import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { fetchQuery } from "convex/nextjs";
import EditEventFormComplete from "@/components/EditEventFormComplete";
import { notFound } from "next/navigation";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EditEventPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const eventId = params.id as Id<"events">;
  
  let event;
  try {
    event = await fetchQuery(api.events.getById, { eventId });
  } catch (error) {
    console.error("Error fetching event:", error);
    notFound();
  }
  
  if (!event) {
    notFound();
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <EditEventFormComplete event={event} />
    </div>
  );
}