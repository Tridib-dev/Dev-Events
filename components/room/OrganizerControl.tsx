// components/room/OrganizerControls.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { LoaderCircle, Send } from "lucide-react";
import type { RoomPhase } from "@/lib/actions/room.actions";
import { Input } from "@/components/ui/input";

export interface OrganizerControlsProps {
  eventId: string;
  phase: RoomPhase;
  onChanged: () => void; // triggers a refetch in the parent
}

export default function OrganizerControls({ eventId, phase, onChanged }: OrganizerControlsProps) {
  const [pending, setPending] = useState<"start" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updateDraft, setUpdateDraft] = useState("");
  const [sendingUpdate, setSendingUpdate] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  async function handleStart() {
    if (pending) return;
    setPending("start");
    setError(null);
    try {
      const res = await fetch(`/api/rooms/${eventId}/start`, { method: "POST" });
      if (!res.ok) {
        setError("Couldn't start the meeting — try again.");
        return;
      }
      onChanged();
    } catch {
      setError("Network error — try again.");
    } finally {
      setPending(null);
    }
  }

  async function handleUpdateSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = updateDraft.trim();
    if (!body || sendingUpdate) return;

    if (body.length > 500) {
      setUpdateError("Updates must be 500 characters or fewer.");
      return;
    }

    setSendingUpdate(true);
    setUpdateError(null);

    try {
      const res = await fetch(`/api/rooms/${eventId}/discussion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "update", body, clientMutationId: crypto.randomUUID() }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.message ?? "Failed to post update.");
      }

      setUpdateDraft("");
      toast.success("Update posted.");
      window.dispatchEvent(new Event("room-updates:changed"));
    } catch (postError) {
      console.error("[OrganizerControls] failed to post update", postError);
      setUpdateError("Could not post the update. Please try again.");
      toast.error("Could not post the update. Please try again.");
    } finally {
      setSendingUpdate(false);
    }
  }

  // Ending the meeting is now handled by LeaveMeetingModal inside
  // LiveRoomScreen (Leave → "End meeting for everyone"), so there's nothing
  // left for this floating control to show once the room is live.
  if (phase === "ended" || phase === "live") return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4">
      <div className="mx-auto flex max-h-[calc(100dvh-1rem)] w-full max-w-4xl flex-col gap-3 overflow-y-auto rounded-t-4xl border border-indigo-100 border-b-0 bg-white/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-24px_50px_rgba(30,41,59,0.18)] backdrop-blur-xl sm:px-5">
        <div className="mx-auto h-1.5 w-14 rounded-full bg-slate-200" />
        <div className="flex flex-col items-center gap-3">
          {error && <p className="rounded-md bg-rose-50 px-2 py-1 text-xs text-rose-600 ring-1 ring-rose-100">{error}</p>}
          <button
            onClick={handleStart}
            disabled={pending !== null}
            className="min-w-48 rounded-full bg-indigo-600 px-7 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-600/20 transition-transform hover:bg-indigo-700 hover:scale-[1.02] disabled:scale-100 disabled:opacity-60"
          >
            {pending === "start" ? "Starting…" : "Start meeting"}
          </button>
        </div>

        <form onSubmit={handleUpdateSubmit} className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-3">
          <div className="relative">
          <Input
            value={updateDraft}
            onChange={(event) => setUpdateDraft(event.target.value)}
            placeholder="new updates for attendees ..."
            className="h-12 rounded-xl border-indigo-100 bg-white pr-14 text-slate-900 placeholder:text-slate-400 shadow-sm focus-visible:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={sendingUpdate}
            aria-label="Post update"
            title="Post update"
            className="absolute right-1.5 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {sendingUpdate ? (
              <LoaderCircle size={17} strokeWidth={2.2} className="animate-spin" aria-hidden="true" />
            ) : (
              <Send size={17} strokeWidth={2.2} aria-hidden="true" />
            )}
          </button>
          </div>
        </form>
        {updateError && <p className="text-xs text-rose-600">{updateError}</p>}

      </div>
    </div>
  );
}
