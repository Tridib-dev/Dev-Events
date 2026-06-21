'use server';

import connectToDatabase from "../mongodb";
import { Booking } from "@/database/booking.model";


export const CreateBooking = async ({ eventId, slug , email} : { eventId: string; slug : string ; email: string; }) => {
    try {
        await connectToDatabase();
        await Booking.create({ eventId,slug,email });

        return { success: true };
    }catch(error){
        if (error instanceof Error && 'code' in error && error.code === 11000) {
            return { success: false, error: "You've already booked this event with this email." };
        }
        console.error('Booking Creation Failed',error);
        return {success : false, error : error};
    }
}