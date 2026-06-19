'use server'

import { Event } from "@/database/event.model";
import connectToDatabase from "../mongodb"


export const getSimilaryEventsBySlug = async (slug : string) => {
    try {
        await connectToDatabase();

        const event = await Event.findOne({ slug });

        if (!event) return [];

        const events = await Event.find({
            _id: { $ne: event._id },
            tags: { $in: event.tags },
        });
        return JSON.parse(JSON.stringify(events));

        
    }catch(e){
        console.error("Failed to fetch similar events by slug:", error);
        return []
    }
}