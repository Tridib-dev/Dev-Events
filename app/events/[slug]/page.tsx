// app/events/[slug]/page.tsx
import BookEvent from "@/components/BookEvent";
import EventCard from "@/components/EventCard";
import { getSimilaryEventsBySlug } from "@/lib/actions/event.actions";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const EventDetailItem = ({ icon, alt, label }: { icon: string; alt: string; label: string;}) => (
    <div className="flex items-center gap-2">
        <Image src={icon} alt={alt} width={17} height={17} />
        <p>{label}</p>
    </div>
);

const Agenda = ({ agendaItems }: { agendaItems: any[] }) => (
    <div className="agenda">
        <h2>Agenda</h2>
        <ul className="space-y-4">
            {agendaItems?.map((item, index) => (
                <li key={index} className="flex gap-4">
                    <div className="text-sm text-gray-400 min-w-30">
                        {item.startTime} — {item.endTime}
                    </div>
                    <div>{item.keynote}</div>
                </li>
            ))}
        </ul>
    </div>
);

const EventTags = ({ tags }: { tags: string[] }) => (
    <div className="flex flex-row gap-1.5 flex-wrap">
        {tags?.map((tag, index) => (
            <div className="pill" key={index}>{tag}</div>
        ))}
    </div>
);

async function EventContent({ slug }: { slug: string }) {
    const request = await fetch(`${BASE_URL}/api/events/${slug}`);

    if (!request.ok) {
        notFound();
    }

    const { event, organizer } = await request.json();

    if (!event) notFound();

    const { 
        description, 
        image, 
        overview, 
        date, 
        time, 
        location, 
        address,
        mode, 
        audience, 
        tags,
        agenda 
    } = event;

    const similarEvents = await getSimilaryEventsBySlug(slug);

    return (
        <>
            <div>
                <h1>Event Description</h1>
                <p>{description}</p>
            </div>

            <div className="details">
                <div className="content">
                    <Image 
                        className="banner" 
                        src={image} 
                        alt="Event Banner" 
                        width={800} 
                        height={800} 
                        priority 
                    />

                    <section className="flex-col-gap-2">
                        <h2>Overview</h2>
                        <p>{overview}</p>
                    </section>

                    <section className="flex-col-gap-2">
                        <h2>Event Details</h2>
                        <EventDetailItem icon="/icons/calendar.svg" alt="calendar" label={date} />
                        <EventDetailItem icon="/icons/clock.svg" alt="time" label={time} />
                        <EventDetailItem icon="/icons/pin.svg" alt="location" label={location} />
                        
                        {address && (
                            <EventDetailItem icon="/icons/pin.svg" alt="address" label={address} />
                        )}

                        <EventDetailItem icon="/icons/mode.svg" alt="mode" label={mode} />
                        <EventDetailItem icon="/icons/audience.svg" alt="audience" label={audience} />
                    </section>

                    {agenda && agenda.length > 0 && <Agenda agendaItems={agenda} />}

                    <section className="flex-col-gap-2">
                        <h2>About The Organizer</h2>
                        <p>{organizer}</p>
                    </section>

                    {tags && tags.length > 0 && <EventTags tags={tags} />}
                </div>

                <aside className="booking">
                    <div className="signup-card">
                        <h2>Book Your Spot</h2>
                        <BookEvent eventId={event._id} slug={event.slug} />
                    </div>
                </aside>
            </div>

            <div className="flex w-full flex-col gap-4 pt-20">
                <h2>Similar Events</h2>
                <div className="events">
                    {similarEvents.length > 0 &&
                        similarEvents.map((similarEvent: any) => (
                            <EventCard 
                                key={String(similarEvent._id)} 
                                {...similarEvent} 
                            />
                        ))}
                </div>
            </div>
        </>
    );
}

export default function EventDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
    return (
        <section id="event">
            <Suspense fallback={<p>Loading event...</p>}>
                <EventContentResolver paramsPromise={params} />
            </Suspense>
        </section>
    );
}

async function EventContentResolver({ paramsPromise }: { paramsPromise: Promise<{ slug: string }> }) {
    const { slug } = await paramsPromise;
    return <EventContent slug={slug} />;
}