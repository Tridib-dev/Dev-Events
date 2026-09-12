"use server";

import { cache } from "react";
import { isValidObjectId } from "mongoose";
import connectToDatabase from "@/lib/mongodb";
import { Booking } from "@/database/booking.model";
import { Order } from "@/database/Order.model";
import { Event } from "@/database/event.model";
import { isGateAuthorized } from "@/lib/actions/gate.actions";
import { paiseToRupees } from "@/lib/payments/money";
import { getCoOrganizerCount, getEventActivityFeed } from "@/lib/event-dashboard/activity";
import { normalizeEventMode } from "@/lib/event-dashboard/mode";
import {
    DEFAULT_EVENT_TIMEZONE,
    formatReportingDateKey,
    reportingDateKey,
    resolveEventSchedule,
} from "@/lib/time";
import { DateTime } from "luxon";

export interface DailyApplicationPoint {
    day: string;
    dateKey?: string;
    applications: number;
}

export interface EventOverviewMetric {
    label: string;
    value: string;
    sub?: string;
}

export interface EventOverviewData {
    event: {
        id: string;
        title: string;
        slug: string;
        category: string;
        date: string;
        time: string;
        image: string;
        mode: string;
        timezone: string;
        startAtUTC?: string;
        isLegacySchedule: boolean;
        normalizedMode: ReturnType<typeof normalizeEventMode>;
    } | null;
    applicantCount: number;
    analyticsScore: number;
    coOrganizerCount: number;
    checkinRate: number;
    totalRevenue: number;
    todaySignups: number;
    dailyApplications: DailyApplicationPoint[];
    keyMetrics: EventOverviewMetric[];
    recentActivity: Awaited<ReturnType<typeof getEventActivityFeed>>["items"];
}

function computeAnalyticsScore(input: {
    checkinRate: number;
    last7: number;
    prior7: number;
    isPaid: boolean;
    revenueRatio: number;
    coOrganizerCount: number;
}): number {
    const velocity =
        input.prior7 === 0
            ? input.last7 > 0
                ? 100
                : 40
            : Math.min(100, Math.round((input.last7 / input.prior7) * 50 + 50));

    const checkinComponent = Math.round(input.checkinRate * 0.35);
    const velocityComponent = Math.round(velocity * 0.25);
    const revenueComponent = input.isPaid ? Math.round(input.revenueRatio * 20) : 15;
    const committeeComponent = Math.min(20, input.coOrganizerCount * 5);

    return Math.min(
        100,
        Math.max(0, checkinComponent + velocityComponent + revenueComponent + committeeComponent)
    );
}

function buildDailySeries(
    createdAt: Date,
    eventInstant: Date,
    entries: { createdAt: Date | string }[],
    timezone: string
): DailyApplicationPoint[] {
    const start = DateTime.fromJSDate(new Date(createdAt), { zone: "utc" }).setZone(timezone).startOf("day");
    const eventEnd = DateTime.fromJSDate(eventInstant, { zone: "utc" }).setZone(timezone).endOf("day");
    const now = DateTime.now().setZone(timezone);
    const cappedEnd = eventEnd < now ? eventEnd : now;

    const map = new Map<string, number>();
    const points: DailyApplicationPoint[] = [];

    for (let cursor = start; cursor <= cappedEnd; cursor = cursor.plus({ days: 1 })) {
        const key = cursor.toISODate() ?? "invalid";
        map.set(key, 0);
        points.push({ dateKey: key, day: formatReportingDateKey(key, timezone), applications: 0 });
    }

    for (const entry of entries) {
        const key = reportingDateKey(entry.createdAt, timezone);
        if (map.has(key)) {
            map.set(key, (map.get(key) ?? 0) + 1);
        }
    }

    return points.map((point) => ({
        day: point.day,
        // `map` is keyed by the stable ISO date (`dateKey`), while `day` is
        // the localized display label used by the chart axis.
        applications: map.get(point.dateKey ?? point.day) ?? 0,
    }));
}

export const getEventOverview = cache(async (eventId: string): Promise<EventOverviewData> => {
    const empty: EventOverviewData = {
    event: null,
        applicantCount: 0,
        analyticsScore: 0,
        coOrganizerCount: 0,
        checkinRate: 0,
        totalRevenue: 0,
        todaySignups: 0,
        dailyApplications: [],
        keyMetrics: [],
        recentActivity: [],
    };

    if (!isValidObjectId(eventId)) return empty;

    const authorized = await isGateAuthorized(eventId);
    if (!authorized) return empty;

    await connectToDatabase();

    const event = await Event.findById(eventId).lean<{
        _id: { toString(): string };
        title: string;
        slug: string;
        category: string;
        date: string;
        time: string;
        image: string;
        mode: string;
        price?: number;
        createdAt: Date;
        timezone?: string;
        startAtUTC?: Date;
    }>();

    if (!event) return empty;

    const [bookings, orders, coOrganizerCount, activityFeed] = await Promise.all([
        Booking.find({ eventId }).sort({ createdAt: -1 }).lean(),
        Order.find({ eventId, status: "paid" }).sort({ createdAt: -1 }).lean(),
        getCoOrganizerCount(eventId),
        getEventActivityFeed(eventId, 8),
    ]);

    const totalApplicants = bookings.length + orders.length;
    const checkedInCount = bookings.filter((b) => b.checkedIn).length;
    const checkinRate =
        totalApplicants > 0 ? Math.round((checkedInCount / totalApplicants) * 100) : 0;
    const totalRevenuePaise = orders.reduce((sum, order) => sum + (order.amount ?? 0), 0);
    const totalRevenue = paiseToRupees(totalRevenuePaise);

    const schedule = resolveEventSchedule({
        date: event.date,
        time: event.time,
        timezone: event.timezone,
        startAtUTC: event.startAtUTC,
        mode: event.mode,
    });
    const reportingTimezone = schedule.timezone || DEFAULT_EVENT_TIMEZONE;

    const todayStart = DateTime.now().setZone(reportingTimezone).startOf("day").toUTC().toJSDate();
    const last7Start = DateTime.fromJSDate(todayStart, { zone: "utc" })
        .setZone(reportingTimezone).minus({ days: 7 }).toUTC().toJSDate();
    const prior7Start = DateTime.fromJSDate(last7Start, { zone: "utc" })
        .setZone(reportingTimezone).minus({ days: 7 }).toUTC().toJSDate();

    const allEntries = [...bookings, ...orders];
    const todaySignups = allEntries.filter((e) => new Date(e.createdAt) >= todayStart).length;
    const last7 = allEntries.filter((e) => new Date(e.createdAt) >= last7Start).length;
    const prior7 = allEntries.filter((e) => {
        const d = new Date(e.createdAt);
        return d >= prior7Start && d < last7Start;
    }).length;

    const isPaid = (event.price ?? 0) > 0;
    const revenueRatio = isPaid && totalApplicants > 0 ? Math.min(1, orders.length / totalApplicants) : 0;

    const analyticsScore = computeAnalyticsScore({
        checkinRate,
        last7,
        prior7,
        isPaid,
        revenueRatio,
        coOrganizerCount,
    });

    const dailyApplications = buildDailySeries(
        event.createdAt ?? new Date(event.date),
        schedule.instant,
        allEntries,
        reportingTimezone
    );

    const normalizedMode = normalizeEventMode(event.mode);

    return {
        event: {
            id: event._id.toString(),
            title: event.title,
            slug: event.slug,
            category: event.category,
            date: event.date,
            time: event.time,
            image: event.image,
            mode: event.mode,
            timezone: reportingTimezone,
            startAtUTC: event.startAtUTC?.toISOString() ?? schedule.instant.toISOString(),
            isLegacySchedule: schedule.isLegacy,
            normalizedMode,
        },
        applicantCount: totalApplicants,
        analyticsScore,
        coOrganizerCount,
        checkinRate,
        totalRevenue,
        todaySignups,
        dailyApplications,
        keyMetrics: [
            { label: "Check-in rate", value: `${checkinRate}%`, sub: "Of all registrations" },
            { label: "Today's signups", value: todaySignups.toString(), sub: "New applications today" },
            {
                label: "Revenue",
                value: totalRevenue > 0 ? `₹${totalRevenue.toLocaleString("en-IN")}` : "Free",
                sub: `${orders.length} paid orders`,
            },
            {
                label: "Free vs paid",
                value: `${bookings.length} / ${orders.length}`,
                sub: "Free registrations / paid",
            },
        ],
        recentActivity: activityFeed.items,
    };
});
