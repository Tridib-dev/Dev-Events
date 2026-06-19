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

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

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
            <div className="flex flex-row gap-2 items-center">
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
        </Link>
    )
};


export default EventCard;