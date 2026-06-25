'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EVENT_CATEGORIES } from "@/lib/constants/event-categories";
import OrganizerEmails from "./Organizeremails";
import TagPicker from "./Tagpicker";
import AgendaFields, { AgendaItemInput } from "./Agendafields";
import LocationFields, { LocationValue } from "./Locationfields";

const CreateEventPage = () => {
    const router = useRouter();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [organizerEmails, setOrganizerEmails] = useState<string[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [agendaRows, setAgendaRows] = useState<AgendaItemInput[]>([]);
    const [location, setLocation] = useState<LocationValue>({
        country: "",
        countryCode: "",
        state: "",
        stateCode: "",
        city: "",
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            setImagePreview(null);
            return;
        }
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isSubmitting) return;

        const form = e.currentTarget;
        const formData = new FormData(form);

        // --- Validate everything first, before appending anything ---
        const agenda = agendaRows
            .map((row) => ({
                startTime: row.startTime,
                endTime: row.endTime,
                keynote: row.keynote.trim(),
            }))
            .filter((row) => row.startTime && row.endTime && row.keynote);

        if (agenda.length === 0) {
            toast.error("Add at least one agenda item.");
            return;
        }

        const hasInvalidTimes = agenda.some((item) => item.endTime <= item.startTime);
        if (hasInvalidTimes) {
            toast.error("Each agenda item's end time must be after its start time.");
            return;
        }

        if (tags.length === 0) {
            toast.error("Add at least one tag.");
            return;
        }

        if (organizerEmails.length === 0) {
            toast.error("Add at least one organizer contact email.");
            return;
        }

        if (!location.country || !location.state || !location.city) {
            toast.error("Please select a country, state, and city.");
            return;
        }

        // --- All valid — build the final FormData ---
        formData.append("agenda", JSON.stringify(agenda));
        tags.forEach((tag) => formData.append("tags", tag));
        organizerEmails.forEach((email) => formData.append("organizerEmails", email));

        formData.append("country", location.country);
        formData.append("state", location.state);
        formData.append("city", location.city);
        formData.set("location", `${location.city}, ${location.state}`);

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/events", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error || data?.message || "Event creation failed.");
            }

            toast.custom(() => (
                <div className="toast-success">
                    <div className="toast-icon">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path
                                d="M3 8.5L6.2 11.7L13 4"
                                stroke="#9FE1CB"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="toast-check"
                            />
                        </svg>
                    </div>
                    <div>
                        <p className="toast-title">Event created</p>
                        <p className="toast-subtitle">Your event is now live</p>
                    </div>
                </div>
            ));

            const slug = data?.event?.slug;
            router.push(slug ? `/events/${slug}` : "/");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Something went wrong.";
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section id="create-event">
            <div className="create-event-header">
                <h1>Create Event</h1>
                <p className="text-sm">Fill in the details below to publish a new event.</p>
            </div>

            <form onSubmit={handleSubmit} className="create-event-form">

                {/* Section 1 — Basics */}
                <div className="form-section">
                    <h3 className="form-section-title">Basics</h3>

                    <div className="field">
                        <label htmlFor="image">Banner Image</label>
                        <label htmlFor="image" className="image-drop">
                            {imagePreview ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={imagePreview} alt="Preview" className="image-drop-preview" />
                            ) : (
                                <span className="image-drop-placeholder">
                                    Click to upload a banner image
                                </span>
                            )}
                        </label>
                        <input
                            id="image"
                            name="image"
                            type="file"
                            accept="image/*"
                            required
                            onChange={handleImageChange}
                            className="sr-only"
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="title">Event Title</label>
                        <input id="title" name="title" type="text" placeholder="Cloud Next 2027" required />
                    </div>

                    <div className="field">
                        <label htmlFor="description">Short Description</label>
                        <textarea
                            id="description"
                            name="description"
                            rows={2}
                            placeholder="A one or two line summary shown on event cards."
                            required
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="overview">Overview</label>
                        <textarea
                            id="overview"
                            name="overview"
                            rows={4}
                            placeholder="A longer description of what attendees can expect."
                            required
                        />
                    </div>
                </div>

                {/* Section 2 — Location */}
                <div className="form-section">
                    <h3 className="form-section-title">Location</h3>
                    <p className="form-section-description">Where will this event take place?</p>

                    <div className="field-row">
                        <div className="field">
                            <label htmlFor="venue">Venue</label>
                            <input id="venue" name="venue" type="text" placeholder="Moscone Center" required />
                        </div>
                        <div className="field">
                            <label htmlFor="address">Address</label>
                            <input id="address" name="address" type="text" placeholder="747 Howard St" required />
                        </div>
                    </div>

                    <LocationFields onChange={setLocation} />
                </div>

                {/* Section 3 — Schedule & Agenda */}
                <div className="form-section">
                    <h3 className="form-section-title">Schedule &amp; Agenda</h3>

                    <div className="field-row">
                        <div className="field">
                            <label htmlFor="date">Date</label>
                            <input id="date" name="date" type="date" required />
                        </div>
                        <div className="field">
                            <label htmlFor="time">Time</label>
                            <input id="time" name="time" type="time" required />
                        </div>
                    </div>

                    <div className="field">
                        <label>Agenda</label>
                        <AgendaFields onChange={setAgendaRows} />
                    </div>
                </div>

                {/* Section 4 — Format & Audience */}
                <div className="form-section">
                    <h3 className="form-section-title">Format &amp; Audience</h3>

                    <div className="field-row">
                        <div className="field">
                            <label htmlFor="mode">Event Mode</label>
                            <select id="mode" name="mode" defaultValue="" required>
                                <option value="" disabled>
                                    Select a mode
                                </option>
                                <option value="In-Person">In-Person</option>
                                <option value="Online">Online</option>
                                <option value="Hybrid (In-Person & Online)">Hybrid</option>
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="category">Event Category</label>
                            <select id="category" name="category" defaultValue="" required>
                                <option value="" disabled>
                                    Select a category
                                </option>
                                {EVENT_CATEGORIES.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="field">
                        <label htmlFor="audience">Audience</label>
                        <input
                            id="audience"
                            name="audience"
                            type="text"
                            placeholder="Cloud engineers, DevOps, AI researchers"
                            required
                        />
                    </div>

                    <div className="field">
                        <label>Tags</label>
                        <TagPicker onChange={setTags} />
                    </div>
                </div>

                {/* Section 5 — Organizer */}
                <div className="form-section">
                    <h3 className="form-section-title">Organizer</h3>

                    <div className="field">
                        <label htmlFor="organizer">About the Organizer</label>
                        <textarea
                            id="organizer"
                            name="organizer"
                            rows={3}
                            placeholder="Who is hosting this event?"
                            required
                        />
                    </div>

                    <div className="field">
                        <label>Organizer Contact Email(s)</label>
                        <OrganizerEmails onChange={setOrganizerEmails} />
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row justify-between items-center mt-12 gap-4">
                    <button 
                        type="button"
                        onClick={() => router.back()}
                        className="button-cancel w-full sm:w-auto px-7 py-3"
                    >
                        Cancel
                    </button>
                                            
                    <button 
                        type="submit" 
                        className="button-submit w-full sm:w-auto px-7 py-3"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Publishing..." : "Publish Event"}
                    </button>
                </div>
            </form>
        </section>
    );
};

export default CreateEventPage;