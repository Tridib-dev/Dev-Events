import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SeoEventListing from "@/components/SeoEventListing";
import {
  fallbackLabelFromSlug,
  getSeoTagEvents,
  resolveTagLabel,
} from "@/lib/seo-events";
import { Suspense } from "react";

type PageParams = Promise<{ tag: string }>;

type PageProps = {
  params: PageParams;
};

const getTagLabel = (tag: string) => resolveTagLabel(tag) ?? fallbackLabelFromSlug(tag);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { tag } = await params;
  const label = getTagLabel(tag);

  return {
    title: `${label} Events`,
    description: `Browse events tagged with ${label}.`,
  };
}

export default function TagEventsPage({ params }: PageProps) {
    return (
        <Suspense fallback={<p>Loading events...</p>}>
            <TagEventsContent params={params} />
        </Suspense>
    );
}

async function TagEventsContent({ params }: PageProps){
  const { tag } = await params;
  const normalizedTag = tag.trim();

  if (!normalizedTag) {
    notFound();
  }

  const label = getTagLabel(normalizedTag);
  const events = await getSeoTagEvents(normalizedTag);

  return (
    <SeoEventListing
      title={`${label} Events`}
      description={`Browse events tagged with ${label}.`}
      events={events}
      emptyMessage={`No events found for ${label} yet.`}
    />
  );
}
