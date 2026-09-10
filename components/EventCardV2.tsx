"use client";

// components/EventCardH.tsx
// Horizontal saved-event card for the light dashboard surface.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SafeImage from "@/components/dashboard/savedPage";
import SaveButtonIcon from "@/components/ui/SaveButtonIcon";
import { toggleWatchlist } from "@/lib/actions/watchlist.actions";
import { getAttendeesCount } from "@/lib/actions/booking.actions";
import { toast } from "sonner";
import { Clock, Calendar, Users , MapIcon  } from "lucide-react";
import { getEventDisplayTime } from "@/lib/time";
import { normalizeEventMode } from "@/lib/constants/event-mode";

export interface EventCardHProps {
    eventId: string;
    slug: string;
    title: string;
    description?: string;
    image: string;
    category?: string;
    location: string;
    date: string;
    time: string;
    tags?: string[];
    price: number;
    isSaved?: boolean;
    onUnsave?: (eventId: string) => void; // optional: called after unsaving so parent can remove card
    timezone?: string;
    startAtUTC?: string | Date;
    mode?: string;
}

const MAX_TAGS = 2;

export default function EventCardH({
    eventId,
    slug,
    title,
    description = "",
    image,
    category,
    location,
    date,
    time,
    tags = [],
    price,
    isSaved: initialSaved = false,
    onUnsave,
    timezone,
    startAtUTC,
    mode,
}: EventCardHProps) {
    const [saved, setSaved] = useState(initialSaved);
    const [saving, setSaving] = useState(false);
    const [attendees, setAttendees] = useState(0);
    const router = useRouter();

    useEffect(() => {
        let mounted = true;

        getAttendeesCount(eventId).then((count) => {
            if (mounted) setAttendees(count);
        });

        return () => {
            mounted = false;
        };
    }, [eventId]);

    const visibleTags = tags.slice(0, MAX_TAGS);
    const extraTags = tags.length - MAX_TAGS;
    const isPaid = price > 0;
    const shortDesc =
        description.length > 90 ? description.slice(0, 90) + "…" : description;
    const normalizedMode = normalizeEventMode(mode);
    const { primary: eventDateTime } = getEventDisplayTime({
        date,
        time,
        timezone,
        startAtUTC,
    }, normalizedMode);
    const [eventDateLabel, eventTimeLabel] = eventDateTime.split(" · ");

    const handleBookmarkToggle = async () => {
        if (saving) return;
        setSaving(true);

        const result = await toggleWatchlist(eventId);
        setSaved(result.saved);

        if (!result.saved && onUnsave) {
            onUnsave(eventId);
        }

        toast.success(result.saved ? "Saved to watchlist" : "Removed from watchlist");
        router.refresh();
        setSaving(false);
    };

    return (
        <article className="group relative flex min-w-0 gap-3.5 p-1 rounded-[18px] border border-slate-200 bg-white p-0.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md sm:gap-4">
            <Link href={`/events/${slug}`} className="contents">
            {/* Left — Event image */}
                <div className="relative h-[108px] w-[112px] p-1 shrink-0 overflow-hidden rounded-[10px] bg-slate-100
                    sm:h-[108px] sm:w-[136px]
                    md:h-[118px] md:w-[180px]
                    lg:h-[130px] lg:w-[220px]
                    xl:h-[140px] xl:w-[240px]"
                >
                <SafeImage
                    src={image}
                    alt={title}
                    fill
                    fallback="https://placehold.co/136x108/f1f5f9/475569?text=Event"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent" />
            </div>

            {/* Right — Content */}
            <div className="flex h-full min-w-0 flex-1 pr-12 sm:pr-14 md:pr-[220px] lg:pr-[250px]">
                <div className="flex h-full min-w-0 flex-1 flex-col py-0.5">
                    <div>
                        {category && (
                            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-indigo-600">
                                {category}
                            </p>
                        )}

                        <h3 className="mb-1 line-clamp-1 text-[14px] font-semibold leading-snug text-slate-900 transition-colors group-hover:text-indigo-700 sm:text-[15px]">
                            {title}
                        </h3>

                        {shortDesc && (
                            <p className="mb-2 line-clamp-1 text-[12px] leading-relaxed text-slate-500">
                                {shortDesc}
                            </p>
                        )}

                        {tags.length > 0 && (
                            <div className="mb-2 flex flex-wrap items-center gap-1.5">
                                {visibleTags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-500"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                                {extraTags > 0 && (
                                    <span className="text-[10px] text-slate-400">+{extraTags}</span>
                                )}
                            </div>
                        )}

                    </div>

                    <div className="mt-2 min-w-0 pb-0 text-[11px] text-slate-500 md:mt-auto md:pb-1">
                        <div className="min-w-0 sm:max-w-[220px] lg:max-w-[260px]">
                            <span className="flex min-w-0 items-center gap-1">
                                <MapIcon size={12} className="shrink-0" />
                                <span className="min-w-0 truncate">{location}</span>
                            </span>
                            <div className="mt-0.5 flex min-w-0 flex-col gap-0.5 text-slate-500 md:flex-row md:items-center md:gap-3">
                                <div className="flex min-w-0 items-center gap-1">
                                    <Calendar size={12} className="shrink-0" />
                                    <span className="truncate whitespace-nowrap">
                                        {eventDateLabel}
                                    </span>
                                </div>
                                <div className="flex min-w-0 items-center gap-1">
                                    <Clock size={12} className="shrink-0" />
                                    <span className="truncate whitespace-nowrap">
                                        {eventTimeLabel}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            </Link>

            <div className="absolute right-3 top-3 hidden items-center gap-2 md:flex">
                {/* Future badges can be added before the attendee count here. */}
                <span className="inline-flex items-center gap-1 whitespace-nowrap text-[15px] text-slate-700">
                    <Users size={12} className="shrink-0" />
                    {attendees} {"Joined"}
                </span>

                <span
                    className={isPaid
                        ? "rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700"
                        : "rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700"
                    }
                >
                    {isPaid ? `₹${price.toLocaleString("en-IN")}` : "Free"}
                </span>
            </div>

            <span
                className={`${isPaid
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                    } absolute right-3 top-3 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold md:hidden`}
            >
                {isPaid ? `₹${price.toLocaleString("en-IN")}` : "Free"}
            </span>

            <SaveButtonIcon
                saved={saved}
                loading={saving}
                onToggle={handleBookmarkToggle}
                ariaLabel={saved ? "Remove from saved" : "Save event"}
                className="absolute bottom-3 right-3 h-10 w-10 justify-center rounded-full border border-slate-200 bg-white px-0 py-0 text-slate-700 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
            />
        </article>
    );
}
