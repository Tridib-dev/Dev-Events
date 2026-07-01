'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { CreateBooking, hasUserBookedEvent } from '@/lib/actions/booking.actions';
import { toast } from 'sonner';
import Image from 'next/image';
import { Button } from "@/components/ui/button";

interface StickyBookingBarProps {
  eventId: string;
  slug: string;
  title: string;
  description?: string;
  price: number;
  mode: string;
}

const StickyBookingBar = ({ 
  eventId, 
  slug, 
  title, 
  description = "", 
  price, 
  mode 
}: StickyBookingBarProps) => {
  const { isSignedIn, user } = useUser();
  const [isSaved, setIsSaved] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [hasBooked, setHasBooked] = useState(false);

  const shortDesc = description.length > 85 ? description.substring(0, 85) + "..." : description;

  // Check if user has already booked
  useEffect(() => {
    const checkBookingStatus = async () => {
      if (isSignedIn && user?.emailAddresses?.[0]?.emailAddress) {
        const booked = await hasUserBookedEvent(eventId, user.emailAddresses[0].emailAddress);
        setHasBooked(booked);
      }
    };
    checkBookingStatus();
  }, [eventId, isSignedIn, user]);

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast.success(isSaved ? "Removed from watchlist" : "Added to watchlist");
  };

  const handleBook = async () => {
    if (!isSignedIn || !user?.emailAddresses?.[0]?.emailAddress) {
      window.location.href = `/sign-in?redirect_url=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    setIsBooking(true);

    const userEmail = user.emailAddresses[0].emailAddress;

    const result = await CreateBooking({ 
      eventId, 
      slug, 
      email: userEmail 
    });

    if (result.success) {
      setHasBooked(true);
      toast.success("🎉 You're signed up! Check your email for confirmation.");
    } else {
      toast.error(result.error || "Booking failed.");
    }

    setIsBooking(false);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4">
      <div className="bg-zinc-950/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        <div className="px-6 py-5 flex items-center justify-between">
          {/* Left Info */}
          <div className="flex-1 min-w-0 pr-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="text-xs font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded">
                {mode}
              </div>
              {price > 0 && <div className="text-xs font-medium text-amber-400">₹{price}</div>}
            </div>
            
            <p className="font-semibold text-white text-[17px] leading-tight truncate">
              {title}
            </p>
            
            {shortDesc && (
              <p className="text-sm text-white/60 mt-1 line-clamp-1">
                {shortDesc}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Save Button */}
            <Button
              variant="outline"
              onClick={handleSave}
              className="border-white/10 hover:bg-white/5 hover:border-white/30 transition-all active:scale-95 group"
            >
              <Image
                src="/icons/pin.svg"
                alt="Save"
                width={18}
                height={18}
                className={`mr-2 transition-all group-hover:scale-110 ${isSaved ? "text-pink-400" : ""}`}
              />
              Save
            </Button>

            {/* Book Button */}
            <Button
              onClick={handleBook}
              disabled={isBooking || hasBooked}
              className="bg-white text-black hover:bg-white/90 font-semibold px-8 active:scale-[0.985] transition-all disabled:opacity-70 group relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                {hasBooked ? (
                  "✓ Event Booked"
                ) : isBooking ? (
                  "Booking..."
                ) : price === 0 ? (
                  "Attend Free"
                ) : (
                  `Book • ₹${price}`
                )}
              </span>

              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 transition-transform duration-700 group-hover:translate-x-[200%]"></div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickyBookingBar;