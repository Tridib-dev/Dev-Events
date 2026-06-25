export const EVENT_MODES = [
    { slug: "in-person", label: "In-Person" },
    { slug: "online", label: "Online" },
    { slug: "hybrid", label: "Hybrid (In-Person & Online)" },
] as const;
 
export type EventModeSlug = (typeof EVENT_MODES)[number]["slug"];
 
export const getModeLabelBySlug = (slug: string): string | null =>
    EVENT_MODES.find((m) => m.slug === slug)?.label ?? null;
 