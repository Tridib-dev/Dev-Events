import EventCard from "@/components/EventCard";
import { type SeoEventCard } from "@/lib/seo-events";

interface SeoEventListingProps {
  title: string;
  description: string;
  events: SeoEventCard[];
  emptyMessage: string;
}

const SeoEventListing = ({
  title,
  description,
  events,
  emptyMessage,
}: SeoEventListingProps) => {
  return (
    <section className="space-y-8" id="seo-event-listing">
      <header className="space-y-3">
        <p className="text-light-200 text-sm uppercase tracking-[0.25em]">SEO Discovery</p>
        <h1>{title}</h1>
        <p className="text-light-100 max-w-3xl text-base sm:text-lg">{description}</p>
      </header>

      {events.length > 0 ? (
        <ul className="events">
          {events.map((event) => (
            <li key={event.slug}>
              <EventCard
                eventId={event._id.toString()}
                title={event.title}
                image={event.image}
                slug={event.slug}
                location={event.location}
                date={event.date}
                time={event.time}
                mode={event.mode}
                price={event.price ?? 0}
                tags={event.tags}
                hostName={event.organizer || "Unknown"}
                organization="DevSphere Community"
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="glass border border-border-dark p-6 text-light-200">
          {emptyMessage}
        </div>
      )}
    </section>
  );
};

export default SeoEventListing;
