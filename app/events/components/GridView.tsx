"use client";

import { EventCard } from "./EventCard";
import { InFeedAd } from "@/app/components/ads/InFeedAd";
import { Event } from "../types";

interface GridViewProps {
  events: Event[];
}

export function GridView({ events }: GridViewProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">No events found</p>
      </div>
    );
  }

  // Inject ads: first after 6 events, then every 8 events
  const renderItems = () => {
    const items: JSX.Element[] = [];
    let adCounter = 0;

    events.forEach((event, index) => {
      items.push(<EventCard key={event._id} event={event} />);

      // Add ad after position 6, then every 8 events
      const shouldShowAd = (index === 5) || ((index > 5) && ((index - 5) % 8 === 0));
      if (shouldShowAd) {
        items.push(
          <div key={`ad-${adCounter++}`} className="col-span-2 lg:col-span-3 xl:col-span-4">
            <InFeedAd />
          </div>
        );
      }
    });

    return items;
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {renderItems()}
    </div>
  );
}
