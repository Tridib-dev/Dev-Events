// lib/actions/geo.actions.ts
'use server';

import { resolveEventTimezone } from "@/lib/geo/timezone-lookup";

export async function resolveEventTimezoneAction(
  countryCode: string,
  stateCode: string,
  city: string
): Promise<string | null> {
  return resolveEventTimezone(countryCode, stateCode, city);
}