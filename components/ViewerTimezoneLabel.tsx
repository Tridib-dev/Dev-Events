"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

function getViewerOffset() {
  const part = new Intl.DateTimeFormat(undefined, {
    timeZoneName: "shortOffset",
  }).formatToParts(new Date()).find((item) => item.type === "timeZoneName")?.value;

  if (!part) return "GMT";
  return part.replace(/GMT([+-])0(\d):/, "GMT$1$2:");
}

export default function ViewerTimezoneLabel() {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  return <>{mounted ? getViewerOffset() : "GMT"}</>;
}
