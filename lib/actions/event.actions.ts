// lib/actions/event.actions.ts

'use server'

import { Event } from "@/database/event.model";
import connectToDatabase from "../mongodb"


export const getSimilarEventsBySlug = async (slug: string, limit = 6) => {
    try {
        await connectToDatabase();

        const event = await Event.findOne({ slug });
        if (!event) return [];

        const eventDate = new Date(event.date);
        const now = new Date().toISOString();

        const events = await Event.aggregate([
            {
                $match: {
                    _id: { $ne: event._id },
                    date: { $gte: now }, // only recommend upcoming events
                },
            },

            // Step 1: raw comparison values
            {
                $addFields: {
                    sharedTagsCount: {
                        $size: { $setIntersection: ["$tags", event.tags] },
                    },
                    daysApart: {
                        $abs: {
                            $divide: [
                                { $subtract: [{ $toDate: "$date" }, eventDate] },
                                1000 * 60 * 60 * 24,
                            ],
                        },
                    },
                },
            },

            // Step 2: "real" similarity score — date is NOT part of this
            {
                $addFields: {
                    coreScore: {
                        $add: [
                            { $multiply: ["$sharedTagsCount", 10] },
                            { $cond: [{ $eq: ["$category", event.category] }, 25, 0] },
                            { $cond: [{ $eq: ["$city", event.city] }, 20, 0] },
                            {
                                $cond: [
                                    { $and: [{ $ne: ["$city", event.city] }, { $eq: ["$country", event.country] }] },
                                    8,
                                    0,
                                ],
                            },
                            { $cond: [{ $eq: ["$mode", event.mode] }, 8, 0] },
                        ],
                    },
                    dateBonus: {
                        $max: [0, { $subtract: [15, { $divide: ["$daysApart", 7] }] }],
                    },
                },
            },

            // Step 3: final ranking score = real similarity + date boost
            {
                $addFields: {
                    score: { $add: ["$coreScore", "$dateBonus"] },
                },
            },

            //  Filter on coreScore, not the blended score — date alone can't qualify an event
            { $match: { coreScore: { $gt: 0 } } },

            { $sort: { score: -1, date: 1 } },
            { $limit: limit },
        ]);

        return JSON.parse(JSON.stringify(events));
    } catch (e) {
        console.error("Failed to fetch similar events by slug:", e);
        return [];
    }
};