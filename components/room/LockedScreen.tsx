// components/room/LockedScreen.tsx
"use client";

import { useSyncExternalStore } from "react";
import AnimatedNumberCountdown from "./AnimatedNumberCountdown";

export interface LockedScreenProps {
  eventTitle: string;
  bannerUrl?: string;
  lobbyOpensAt: Date;
  showCountdown?: boolean;
}

export default function LockedScreen({ eventTitle, bannerUrl, lobbyOpensAt, showCountdown = false }: LockedScreenProps) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const localSchedule = mounted
    ? new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZoneName: "short",
      }).format(lobbyOpensAt)
    : "—";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center text-slate-900">
      {bannerUrl && (
        <img src={bannerUrl} alt={eventTitle} className="h-40 w-full max-w-md rounded-xl object-cover shadow-sm ring-1 ring-slate-200" />
      )}
      <h1 className="text-xl font-semibold">{eventTitle}</h1>
      <p className="text-sm text-slate-600">Doors open at {localSchedule}</p>
      {showCountdown && (
        <div className="mt-1 flex flex-col items-center gap-1">
          {mounted ? (
            <AnimatedNumberCountdown endDate={lobbyOpensAt} />
          ) : (
            <span className="font-[family-name:var(--font-mono)] text-2xl font-semibold text-indigo-600">—</span>
          )}
        </div>
      )}
    </div>
  );
}
