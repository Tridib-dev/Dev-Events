"use client";

import { useSyncExternalStore } from "react";
import { formatViewerTimestamp } from "@/lib/time";

const subscribe = () => () => {};

export default function ViewerTimestamp({
    value,
    className,
}: {
    value: string | number | Date;
    className?: string;
}) {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const normalizedValue = typeof value === "number" ? new Date(value) : value;
  return <span className={className}>{mounted ? formatViewerTimestamp(normalizedValue) : "—"}</span>;
}
