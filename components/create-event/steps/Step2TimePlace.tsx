'use client';

import React, { useEffect, useRef } from "react";
import { EventDraft } from "../types";
import ModeCards from "../fields/ModeCards";
import LocationFields from "../fields/LocationFields";
import { resolveEventTimezoneAction } from "@/lib/actions/geo.actions";

interface Step2Props {
  draft: EventDraft;
  onUpdate: (patch: Partial<EventDraft>) => void;
}

const Step2TimePlace = ({ draft, onUpdate }: Step2Props) => {
  const requestIdRef = useRef(0);

  useEffect(() => {
    const { countryCode, stateCode, city } = draft.location;
    
    if (!countryCode || !stateCode || !city) {
      return;
    }

    const currentRequestId = ++requestIdRef.current;

    // Clear any previous/default timezone immediately when location changes.
    onUpdate({ timezone: "" });

    const timeout = setTimeout(async () => {
      try {
        const resolved = await resolveEventTimezoneAction(
          countryCode,
          stateCode,
          city
        );

        // Ignore stale responses.
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        console.log("TIMEZONE DEBUG:", {
          countryCode,
          stateCode,
          city,
          resolved,
        });

        onUpdate({
          timezone: resolved ?? "",
        });
      } catch (error) {
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        console.error("TIMEZONE RESOLUTION FAILED:", error);

        onUpdate({
          timezone: "",
        });
      }
    }, 600);

    return () => {
      clearTimeout(timeout);
    };
  }, [
    draft.location.countryCode,
    draft.location.stateCode,
    draft.location.city,
    onUpdate,
  ]);

  console.log("RENDER TIMEZONE:", {
    draftTimezone: draft.timezone,
    city: draft.location.city,
    countryCode: draft.location.countryCode,
    stateCode: draft.location.stateCode,
  });

  return (
    <>
      <p className="cew-step-eyebrow">Step 2 of 7</p>

      <h1 className="cew-step-title">
        When and where does it happen?
      </h1>

      <p className="cew-step-subtitle">
        Pin down the logistics — attendees plan around this first.
      </p>

      <div className="cew-step-body">
        <div className="field-row">
          <div className="field">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              name="date"
              type="date"
              value={draft.date}
              onChange={(e) => onUpdate({ date: e.target.value })}
            />
          </div>

          <div className="field">
            <label htmlFor="time">Time</label>
            <input
              id="time"
              name="time"
              type="time"
              value={draft.time}
              onChange={(e) => onUpdate({ time: e.target.value })}
            />
          </div>
        </div>

        <ModeCards
          value={draft.mode}
          onChange={(mode) => onUpdate({ mode })}
        />

        <div className="field-row">
          <div className="field">
            <label htmlFor="venue">Venue</label>
            <input
              id="venue"
              name="venue"
              type="text"
              value={draft.venue}
              onChange={(e) => onUpdate({ venue: e.target.value })}
              placeholder="Moscone Center"
            />
          </div>

          <div className="field">
            <label htmlFor="address">Address</label>
            <input
              id="address"
              name="address"
              type="text"
              value={draft.address}
              onChange={(e) => onUpdate({ address: e.target.value })}
              placeholder="747 Howard St"
            />
          </div>
        </div>

        <LocationFields
          onChange={(location) => onUpdate({ location })}
        />

        <div className="field">
          <label htmlFor="timezone">Event timezone</label>

          <select
            id="timezone"
            value={draft.timezone}
            onChange={(e) =>
              onUpdate({ timezone: e.target.value })
            }
            required
            disabled={!draft.location.city}
          >
            <option value="" disabled>
              {draft.location.city
                ? "Detecting…"
                : "Select a location first"}
            </option>

            {Intl.supportedValuesOf("timeZone").map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
};

export default Step2TimePlace;