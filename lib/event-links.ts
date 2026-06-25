// lib/event-links.ts

export const createSlug = (value: string): string =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export function getTagLink(tag: string): string {
  return `/events/tag/${createSlug(tag)}`;
}

export function getCategoryLink(category: string): string {
  return `/events/category/${createSlug(category)}`;
}

export function getCityLink(event: any): string {
  if (!event?.country || !event?.state || !event?.city) {
    return "#";
  }
  const country = createSlug(event.country);
  const state = createSlug(event.state);
  const city = createSlug(event.city);
  return `/events/country/${country}/state/${state}/city/${city}`;
}