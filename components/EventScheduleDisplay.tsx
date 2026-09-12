"use client";

import { useMemo, useSyncExternalStore } from "react";
import { DEFAULT_EVENT_TIMEZONE, getEventDisplayTime } from "@/lib/time";

export default function EventScheduleDisplay({
    date,
    time,
    timezone,
    startAtUTC,
    mode,
    className,
}: {
    date: string;
    time: string;
    timezone?: string;
    startAtUTC?: string | Date;
    mode?: string;
    className?: string;
}) {
    const viewerTimezone = useSyncExternalStore(
        () => () => {},
        () => Intl.DateTimeFormat().resolvedOptions().timeZone,
        () => undefined,
    );

    const display = useMemo(
        () => getEventDisplayTime(
            { date, time, timezone, startAtUTC, mode },
            mode,
            viewerTimezone ?? timezone ?? DEFAULT_EVENT_TIMEZONE
        ),
        [date, time, timezone, startAtUTC, mode, viewerTimezone]
    );

    return (
        <span className={className}>
            <span>{display.primary}</span>
            {display.secondary && (
                <span className="ml-2 text-slate-400">{display.secondary}</span>
            )}
        </span>
    );
}
