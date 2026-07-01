import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import SeoEventListing from "@/components/SeoEventListing";
import {
  fallbackLabelFromSlug,
  getSeoCountryEvents,
  resolveCountryLabel,
} from "@/lib/seo-events";



type PageParams = Promise<{ country: string }>;

type PageProps = {
  params: PageParams;
};

const getCountryLabel = (country: string) =>
  resolveCountryLabel(country) ?? fallbackLabelFromSlug(country);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { country } = await params;
  const label = getCountryLabel(country);

  return {
    title: `${label} Events`,
    description: `Browse events happening in ${label}.`,
  };
}

export default function CountryEventsPage({ params }: PageProps) {
    return (
        <Suspense fallback={<p>Loading events...</p>}>
            <CountryEventsContent params={params} />
        </Suspense>
    );
}

async function CountryEventsContent({ params }: PageProps) {
  const { country } = await params;
  const normalizedCountry = country.trim();

  if (!normalizedCountry) {
    notFound();
  }

  const events = await getSeoCountryEvents(normalizedCountry);
  if (!events) {
    notFound();
  }

  const label = getCountryLabel(normalizedCountry);

  return (
    <SeoEventListing
      title={`${label} Events`}
      description={`Browse events happening in ${label}.`}
      events={events}
      emptyMessage={`No events found in ${label} yet.`}
    />
  );
}
