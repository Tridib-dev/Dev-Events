import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";

import EventCard from "@/components/EventCard";
import DiscoverSearchBar from "@/components/DiscoverSearchBar";
import CategoryTabs from "@/components/CategoryTabs";
import DiscoverModeFilter from "@/components/Discovermodefilter";
import DiscoverTagFilter from "@/components/Discovertagfilter";
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
  page?: string;
}>;

export default function DiscoverPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<p>Loading events...</p>}>
      <DiscoverContent searchParams={searchParams} />
    </Suspense>
  );
}

async function DiscoverContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;

  const filters = {
    q: params.q,
    location: params.location,
    category: params.category,
    mode: params.mode,
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
    sp.set("page", String(targetPage));
    return `/events/discover?${sp.toString()}`;
  };

  return (
    <section id="discover">
      <div className="discover-header">
        <h1>Discover Events</h1>
        <DiscoverSearchBar />
        <CategoryTabs
          activeCategory={params.category}
          searchParams={{
            q: params.q,
            location: params.location,
            tags: params.tags,
            mode: params.mode,
          }}
        />
      </div>

      <div className="discover-body">
        <aside className="discover-sidebar">
          <div className="form-section">
            <h3 className="form-section-title">Mode</h3>
            <DiscoverModeFilter />
          </div>
          <div className="form-section">
            <h3 className="form-section-title">Tags</h3>
            <DiscoverTagFilter />
          </div>
        </aside>

        <div className="discover-results">
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
              {page > 1 && <Link href={buildPageHref(page - 1)}>← Previous</Link>}
              <span>
                Page {page} of {totalPages}
              </span>
              {page < totalPages && <Link href={buildPageHref(page + 1)}>Next →</Link>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
