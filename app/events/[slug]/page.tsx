// app/events/[slug]/page.tsx
import BookEvent from "@/components/BookEvent";
import EventCard from "@/components/EventCard";
import { Booking, IEvent } from "@/database";
import { getSimilaryEventsBySlug } from "@/lib/actions/event.actions";
import Image from "next/image";
import { notFound } from "next/navigation";


const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const EventDetailItem = ({ icon, alt, label } : { icon : string ; alt : string;label : string}) => (
    <div className="flex-row-gap-2 items-center">
        <Image src={icon} alt={alt} width={17} height={17}/>
        <p>{label}</p>
    </div>
);

const Agenda = ({ agendaItems } : { agendaItems : string[] }) => (
    <div className="agenda">
        <h2>Agenda</h2>
        <ul>
            {agendaItems.map((item,index) => (
                <li key ={index}>{item}</li>
            ))}
        </ul>
    </div>
)

const EventTags = ({ tags } : {tags : string[] }) => (
    <div className="flex flex-row gap-1.5 flex-wrap">
        {tags.map((tag,index) => (
            <div className="pill" key={index}>{tag}</div>
        ))}
    </div>
)

const bookings = 10;

const EventDetailsPage = async ({params} : {params : Promise<{slug : string}>}) => {
    const { slug } = await params;
    const request = await fetch(`${BASE_URL}/api/events/${slug}`);
    
    if (!request.ok) {
        notFound();
    }
    
    const { event, organizer } = await request.json();
    if (!event?.description) {
        notFound();
    }
    
    const { description, image, overview, date, time, location, mode, agenda, audience, tags } = event;

    const similarEvents : IEvent[] = await getSimilaryEventsBySlug(slug);

    return (
        <section id='event'>  
        <div> 
            <h1>Event Description</h1>
            <p>{description}</p>
        </div>

        <div className="details">
            {/* Left side - Event Content */}
            <div className="content">
                <Image className="banner" src={image} alt = "Event Banner" width={800} height={800} style={{ width: "100%", height: "auto" }} priority/>

                <section className="flex-col-gap-2">
                    <h2>
                        Overview
                    </h2>
                    <p>{overview}</p>
                </section>

                <section className="flex-col-gap-2">
                    <h2>Event Details</h2>
                    <EventDetailItem icon="/icons/calendar.svg" alt = "calendar" label={date} />
                    <EventDetailItem icon="/icons/clock.svg" alt = "time" label={time}/>
                    <EventDetailItem icon="/icons/pin.svg" alt = "location" label={location}/>
                    <EventDetailItem icon="/icons/mode.svg" alt = "mode" label={mode}/>
                    <EventDetailItem icon="/icons/audience.svg" alt = "audience" label={audience}/>

                </section>

                <Agenda agendaItems={agenda || []} />

                <section className="flex-col-gap-2">
                    <h2> About The Organizer </h2>
                    <p>{organizer}</p>
                </section>

                <EventTags tags={tags || []} />

            </div>
            {/* Right side - Event Content */}
            <aside className="booking">
                <div className="signup-card">
                    <h2>Book Your Spot</h2>
                    {bookings > 0 ? (
                        <p className = "text-sm">
                            Join {bookings} people who have already booked their spot !
                        </p>
                    ): (
                        <p className="text-sm">Be the Firts to Book Your Spot</p>
                    )
                }
                <BookEvent/>
                </div>
            </aside>
        </div>
        <div className="flex w-full flex-col gap-4 pt-20">
            <h2>Similar Events</h2>
            <div className="events">
                { similarEvents.length > 0 && similarEvents.map((similarEvent : IEvent) =>(
                  <li key={similarEvent.title}>
                    <EventCard key={similarEvent.slug} {...similarEvent}/>
                  </li>
                ))}
            </div>
        </div>
        </section>
    )
}


export default EventDetailsPage;