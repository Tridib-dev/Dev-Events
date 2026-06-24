// components/EventCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import posthog from "posthog-js";

export interface EventProps {
  title: string;
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string;
  mode?: string;
  tags?: string[];
  category?: string;   // optional for future
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const EventCard = ({
  title,
  image,
  slug,
  location,
  date,
  time,
  mode,
  tags = [],
}: EventProps) => {
  const handleClick = () => {
    posthog.capture('event_card_clicked', {
      slug,
      title,
      location,
      date,
    });
  };

  return (
    <Link href={`/events/${slug}`} id="event-card" onClick={handleClick} className="block group">
      <Image 
        src={image} 
        alt={title} 
        width={410} 
        height={300} 
        className="poster" 
        priority
      />

      <div className="flex flex-row gap-2 items-center mt-3">
        <Image src="/icons/pin.svg" alt="" width={14} height={14}/>
        <p>{location}</p>
      </div>

      <p className="title">{title}</p>

      <div className="flex flex-row items-center gap-4">
        <div className="flex flex-row items-center gap-2">
          <Image src="/icons/calendar.svg" alt="date" width={14} height={14}/>
          <p>{formatDate(date)}</p>
        </div>
        <div className="flex flex-row items-center gap-2">
          <Image src="/icons/clock.svg" alt="time" width={14} height={14}/>
          <p>{time}</p>
        </div>
      </div>

      {/* Mode */}
      {mode && (
        <div className="inline-block mt-3 text-sm font-medium bg-purple-100 text-purple-700 px-4 py-1 rounded-full">
          {mode}
        </div>
      )}

      {/* Tags - Visible only (Not Clickable) */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {tags.slice(0, 4).map((tag, index) => (
            <span 
              key={index}
              className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-700"
            >
              #{tag}
            </span>
          ))}
          {tags.length > 4 && <span className="text-xs text-gray-500">+{tags.length - 4}</span>}
        </div>
      )}
    </Link>
  );
};

export default EventCard;