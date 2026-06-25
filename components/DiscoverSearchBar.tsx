'use client';


// components/DiscoverSearchBar.tsx

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const DiscoverSearchBar = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [q, setQ] = useState(searchParams.get("q") ?? "");
    const [location, setLocation] = useState(searchParams.get("location") ?? "");

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        const params = new URLSearchParams(searchParams.toString());
        q.trim() ? params.set("q", q.trim()) : params.delete("q");
        location.trim() ? params.set("location", location.trim()) : params.delete("location");
        params.delete("page"); // a new search always resets pagination

        router.push(`/events/discover?${params.toString()}`);
    };

    return (
        <form onSubmit={handleSubmit} className="discover-search-bar">
            <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search events, tags, topics..."
                aria-label="Search events"
            />
            <span className="discover-search-divider" />
            <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, state, or country"
                aria-label="Location"
            />
            <button type="submit" aria-label="Search">
                Search
            </button>
        </form>
    );
};

export default DiscoverSearchBar;