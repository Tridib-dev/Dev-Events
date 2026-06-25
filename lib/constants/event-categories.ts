
export const EVENT_CATEGORIES = [
    "Conference",
    "Meetup",
    "Workshop",
    "Webinar",
    "Hackathon",
    "Seminar",
    "Panel Discussion",
    "Networking Event",
    "Product Launch",
    "Demo Day",
    "Fireside Chat",
    "Bootcamp",
    "Competition",
    "Career Fair",
] as const;
 
export type EventCategory = (typeof EVENT_CATEGORIES)[number];