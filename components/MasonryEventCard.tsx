"use client";

import Link from "next/link";

interface Event {
  _id: string;
  name: string;
  imageUrl?: string;
}

interface MasonryEventCardProps {
  event: Event;
}

export default function MasonryEventCard({ event }: MasonryEventCardProps) {
  const imageUrl = event.imageUrl || "/placeholder-event.jpg";
  
  return (
    <Link href={`/event/${event._id}`} className="block group">
      <div className="overflow-hidden rounded-lg">
        <img
          src={imageUrl}
          alt={event.name}
          className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
    </Link>
  );
}