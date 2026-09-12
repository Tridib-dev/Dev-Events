"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

export default function ViewerTimestampParts({
  value,
  className,
  part = "stacked",
}: {
  value: string | number | Date;
  className?: string;
  part?: "date" | "time" | "stacked";
}) {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const date = typeof value === "number" || typeof value === "string" ? new Date(value) : value;
  const valid = !Number.isNaN(date.getTime());

  if (!mounted || !valid) return <span className={className}>—</span>;

  const dateLabel = new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
  const timeLabel = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);

  if (part === "date") return <span className={className}>{dateLabel}</span>;
  if (part === "time") return <span className={className}>{timeLabel}</span>;

  return (
    <span className={`flex flex-col leading-tight ${className ?? ""}`}>
      <span>{dateLabel}</span>
      <span className="mt-0.5 text-[11px] text-slate-400">{timeLabel}</span>
    </span>
  );
}
