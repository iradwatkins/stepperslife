"use client";

import { MasonryEventCard } from "./MasonryEventCard";
import { InFeedAd } from "@/app/components/ads/InFeedAd";
import { Event } from "../types";

interface MasonryGridProps {
  events: Event[];
}

export function MasonryGrid({ events }: MasonryGridProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">No events found</p>
        <p className="text-gray-400 text-sm mt-2">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  // Inject ads: first after 6 events, then every 8 events
  const renderItems = () => {
    const items: JSX.Element[] = [];
    let adCounter = 0;

    events.forEach((event, index) => {
      items.push(
        <div
          key={event._id}
          style={{
            breakInside: 'avoid',
            marginBottom: '16px',
          }}
        >
          <MasonryEventCard event={event} />
        </div>
      );

      // Add ad after position 6, then every 8 events
      const shouldShowAd = (index === 5) || ((index > 5) && ((index - 5) % 8 === 0));
      if (shouldShowAd) {
        items.push(
          <div
            key={`ad-${adCounter++}`}
            style={{
              breakInside: 'avoid',
              marginBottom: '16px',
            }}
          >
            <InFeedAd />
          </div>
        );
      }
    });

    return items;
  };

  return (
    <>
      {/* Desktop: 4 columns */}
      <div
        className="hidden md:block"
        style={{
          columnCount: 4,
          columnGap: '16px',
        }}
      >
        {renderItems()}
      </div>

      {/* Tablet: 3 columns */}
      <div
        className="hidden sm:block md:hidden"
        style={{
          columnCount: 3,
          columnGap: '16px',
        }}
      >
        {renderItems()}
      </div>

      {/* Mobile: 2 columns */}
      <div
        className="block sm:hidden"
        style={{
          columnCount: 2,
          columnGap: '12px',
        }}
      >
        {renderItems()}
      </div>
    </>
  );
}
