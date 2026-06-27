import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import EventCard from "@/components/EventCard";
import DiscoverSearchBar from "@/components/DiscoverSearchBar";
import CategoryTabs from "@/components/CategoryTabs";
import DiscoverFilterPanel from "@/components/DiscoverFilterPanel";
import { getDiscoverEvents } from "@/lib/discover-events";

export const metadata: Metadata = {
    title: "Discover Events",
    description: "Search and filter developer events by topic, location, category, and mode.",
};

type SearchParams = Promise<{
    q?: string;
    location?: string;
    category?: string;
    tags?: string;
    mode?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: string;
}>;

export default async function DiscoverPage({ searchParams }: { searchParams: SearchParams }) {
    // const params = await searchParams;

    return (
        <section id="discover">
            <div className="discover-header">
                <h1>Discover Events</h1>
                <Suspense fallback={null}>
                    <DiscoverSearchBar />
                </Suspense>
                <Suspense fallback={null}>
                    <CategoryTabs searchParams={searchParams} />
                </Suspense>
            </div>

            <div className="discover-body">
                <Suspense>
                    <DiscoverFilterPanel />
                </Suspense>
                <div className="discover-results">
                    <Suspense fallback={<p className="discover-results-count">Loading events...</p>}>
                        <DiscoverResults searchParams={searchParams} />
                    </Suspense>
                </div>
            </div>
        </section>
    );
}


async function DiscoverResults({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams;
 
    const filters = {
        q: params.q,
        location: params.location,
        category: params.category,
        mode: params.mode,
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
        tags: params.tags?.split(",").filter(Boolean),
        page: params.page ? Number(params.page) : 1,
    };
 
    const { events, total, page, totalPages } = await getDiscoverEvents(filters);
 
    const buildPageHref = (targetPage: number) => {
        const sp = new URLSearchParams();
        if (params.q) sp.set("q", params.q);
        if (params.location) sp.set("location", params.location);
        if (params.category) sp.set("category", params.category);
        if (params.tags) sp.set("tags", params.tags);
        if (params.mode) sp.set("mode", params.mode);
        if (params.dateFrom) sp.set("dateFrom", params.dateFrom);
        if (params.dateTo) sp.set("dateTo", params.dateTo);
        sp.set("page", String(targetPage));
        return `/events/discover?${sp.toString()}`;
    };
 
    return (
        <>
            <p className="discover-results-count">
                {total} event{total === 1 ? "" : "s"} found
            </p>
 
            {events.length > 0 ? (
                <div className="events">
                    {events.map((event) => (
                        <EventCard key={event.slug} {...event} />
                    ))}
                </div>
            ) : (
                <div className="glass border border-border-dark p-6 text-light-200">
                    No events match these filters yet.
                </div>
            )}
 
            {totalPages > 1 && (
                <div className="discover-pagination">
                    {page > 1 && (
                        <Link href={buildPageHref(page - 1)} className="discover-pagination-link">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Previous
                        </Link>
                    )}
                    <span>
                        Page {page} of {totalPages}
                    </span>
                    {page < totalPages && (
                        <Link href={buildPageHref(page + 1)} className="discover-pagination-link">
                            Next
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </Link>
                    )}
                </div>
            )}
        </>
    );
}
 