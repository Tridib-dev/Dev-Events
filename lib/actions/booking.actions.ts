// lib/actions/booking.actions.ts
'use server';

import connectToDatabase from "../mongodb";
import { Booking } from "@/database/booking.model";

export const CreateBooking = async ({ 
  eventId, 
  slug, 
  email 
}: { 
  eventId: string; 
  slug: string; 
  email: string; 
}) => {
  try {
    await connectToDatabase();

    await Booking.create({ 
      eventId, 
      slug, 
      email: email.toLowerCase().trim() 
    });

    return { success: true };
  } catch (error: any) {
    if (error.code === 11000) {
      return { 
        success: false, 
        error: "You've already booked this event with this email." 
      };
    }
    console.error('Booking Creation Failed', error);
    return { success: false, error: "Failed to create booking" };
  }
};


export const getAttendeesCount = async (eventId: string): Promise<number> => {
  try {
    await connectToDatabase();
    
    const count = await Booking.countDocuments({ eventId });
    return count;
  } catch (error) {
    console.error("Failed to get attendees count:", error);
    return 0;
  }
};


export const hasUserBookedEvent = async (eventId: string, email: string): Promise<boolean> => {
  try {
    await connectToDatabase();
    
    const booking = await Booking.findOne({ 
      eventId, 
      email: email.toLowerCase().trim() 
    });

    return !!booking;
  } catch (error) {
    console.error("Failed to check booking status:", error);
    return false;
  }
};