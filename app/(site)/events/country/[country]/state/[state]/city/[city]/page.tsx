import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SeoEventListing from "@/components/SeoEventListing";
import { fallbackLabelFromSlug, getSeoCityEvents, resolveStateLabel } from "@/lib/seo-events";
import { Suspense } from "react";

type PageProps = {
    params: Promise<{ country: string; state: string; city: string }>;
};


export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { country, state, city } = await params;
  const resolved = resolveStateLabel(country, state);
  const cityLabel = fallbackLabelFromSlug(city);

  if (!resolved) {
    return {
      title: "Events",
      description: "Browse upcoming events.",
    };
  }

  return {
    title: `${cityLabel}, ${resolved.state}, ${resolved.country} Events`,
    description: `Browse events happening in ${cityLabel}, ${resolved.state}, ${resolved.country}.`,
  };
}

export default function CityEventsPage({ params }: PageProps) {
    return (
        <Suspense fallback={<p>Loading events...</p>}>
            <CityEventsContent params={params} />
        </Suspense>
    );
}

async function CityEventsContent({ params }: PageProps){
  const { country, state, city } = await params;

  if (!country.trim() || !state.trim() || !city.trim()) {
    notFound();
  }

  const result = await getSeoCityEvents(country, state, city);
  if (!result) {
    notFound();
  }

  return (
    <SeoEventListing
      title={`${result.city}, ${result.state}, ${result.country} Events`}
      description={`Browse events happening in ${result.city}, ${result.state}, ${result.country}.`}
      events={result.events}
      emptyMessage={`No events found in ${result.city}, ${result.state}, ${result.country} yet.`}
    />
  );
}
