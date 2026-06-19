"use client";

import Image from "next/image";
import Link from "next/link";
import posthog from "posthog-js";

export interface EventProps{
    title : string;
    image : string;
    slug : string;
    location : string;
    date : string;
    time : string;
}

const EventCard = ({title,image,slug,location,date,time} : EventProps) => {
    const handleClick = () => {
        posthog.capture('event_card_clicked', {
            slug,
            title,
            location,
            date,
        });
    };

    return (
        <Link href={`/events/${slug}`} id="event-card" onClick={handleClick}>
            <Image src={image} alt={title} width={410} height={300} className="poster" priority/>
            <div className="flex flex-row gap-2">
                <Image src="/icons/pin.svg" alt="" width={14} height={14}/>
                <p>{location}</p>
            </div>
            <p className="title">{title}</p>
            <div>
                <Image src="/icons/calendar.svg" alt="date" width={14} height={14}/>
                <p>{date}</p>
            </div>

            <div>
                <Image src="/icons/clock.svg" alt="time" width={14} height={14}/>
                <p>{time}</p>
            </div>
        </Link>
    )
};

export default EventCard;