import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import SeoEventListing from "@/components/SeoEventListing";

import {
  fallbackLabelFromSlug,
  getSeoCategoryEvents,
  resolveCategoryLabel,
} from "@/lib/seo-events";

type PageParams = Promise<{ category: string }>;

type PageProps = {
  params: PageParams;
};

const getCategoryLabel = (category: string) =>
  resolveCategoryLabel(category) ?? fallbackLabelFromSlug(category);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params;
  const label = getCategoryLabel(category);

  return {
    title: `${label} Events`,
    description: `Browse upcoming ${label.toLowerCase()} events.`,
  };
}

// ✅ Outer page: synchronous, no await — Next.js renders this shell immediately
export default function CategoryEventsPage({ params }: PageProps) {
  return (
    <Suspense fallback={<p>Loading events...</p>}>
      <CategoryEventsContent params={params} />
    </Suspense>
  );
}

// ✅ Inner component: does the actual await, inside the Suspense boundary
async function CategoryEventsContent({ params }: PageProps) {
  const { category } = await params;
  const normalizedCategory = category.trim();

  if (!normalizedCategory) {
    notFound();
  }

  const events = await getSeoCategoryEvents(normalizedCategory);
  if (!events) {
    notFound();
  }

  const label = getCategoryLabel(normalizedCategory);

  return (
    <SeoEventListing
      title={`${label} Events`}
      description={`Browse upcoming ${label.toLowerCase()} events.`}
      events={events}
      emptyMessage={`No ${label.toLowerCase()} events found yet.`}
    />
  );
}