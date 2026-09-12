// components/room/LobbyScreen.tsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import AnimatedNumberCountdown from "./AnimatedNumberCountdown";
import PreMeetingUpdates from "./PreMeetingUpdates";

export interface LobbyScreenProps {
  eventId: string;
  eventTitle: string;
  bannerUrl?: string;
  scheduledStart: Date;
  onCountdownComplete: () => void;
  canModerate: boolean;  
  showCountdown?: boolean;
}

export default function LobbyScreen({
  eventId,
  eventTitle,
  bannerUrl,
  scheduledStart,
  onCountdownComplete,
  canModerate, 
  showCountdown = false,
}: LobbyScreenProps) {
  return (
    <AnimatePresence>
      <motion.div
        key="lobby"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex min-h-screen flex-col bg-slate-50 text-slate-900"
      >
        <div className="flex flex-col items-center gap-4 border-b border-slate-200 px-6 pb-8 pt-10 text-center sm:pt-14">
          {bannerUrl && (
            <img src={bannerUrl} alt={eventTitle} className="h-48 w-full max-w-lg rounded-2xl object-cover shadow-sm ring-1 ring-slate-200 sm:h-52" />
          )}
          <h1 className="text-xl font-semibold sm:text-2xl">{eventTitle}</h1>
          <p className="text-sm text-slate-600">The meeting will start from</p>
          {showCountdown && (
            <AnimatedNumberCountdown
              endDate={scheduledStart}
              onComplete={onCountdownComplete}
            />
          )}
          <p className="text-xs text-slate-500">
            The organizer hasn&apos;t started the meeting yet — chat and Q&amp;A are open below.
          </p>
        </div>

        <PreMeetingUpdates eventId={eventId} canModerate={canModerate} />

        {/* Chat + Q&A slots — wired up in Phase 3/4 */}
        <div className="grid flex-1 grid-cols-1 gap-3 p-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
            Live chat (Phase 3)
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
            Q&amp;A (Phase 4)
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
