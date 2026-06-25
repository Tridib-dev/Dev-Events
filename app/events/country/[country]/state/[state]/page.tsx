import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SeoEventListing from "@/components/SeoEventListing";
import { getSeoStateEvents, resolveStateLabel } from "@/lib/seo-events";
import { Suspense } from "react";

type PageProps = {
  params: Promise<{ country: string; state: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { country, state } = await params;
  const resolved = resolveStateLabel(country, state);

  if (!resolved) {
    return {
      title: "Events",
      description: "Browse upcoming events.",
    };
  }

  return {
    title: `${resolved.state}, ${resolved.country} Events`,
    description: `Browse events happening in ${resolved.state}, ${resolved.country}.`,
  };
}

export default function StateEventsPage({ params }: PageProps) {
    return (
        <Suspense fallback={<p>Loading events...</p>}>
            <StateEventsContent params={params} />
        </Suspense>
    );
}

async function StateEventsContent({ params }: PageProps)  {
  const { country, state } = await params;

  if (!country.trim() || !state.trim()) {
    notFound();
  }

  const result = await getSeoStateEvents(country, state);
  if (!result) {
    notFound();
  }

  return (
    <SeoEventListing
      title={`${result.state}, ${result.country} Events`}
      description={`Browse events happening in ${result.state}, ${result.country}.`}
      events={result.events}
      emptyMessage={`No events found in ${result.state}, ${result.country} yet.`}
    />
  );
}
