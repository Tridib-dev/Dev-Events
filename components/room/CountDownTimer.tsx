// components/room/CountdownTimer.tsx
"use client";

import { useEffect, useState } from "react";

export interface CountdownTimerProps {
  target: Date;
  onComplete?: () => void;
  className?: string;
}

function formatRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const h = Math.floor((totalSeconds % 86400) / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${days}d ${pad(h)}h ${pad(m)}m ${pad(s)}s`;
}

export default function CountdownTimer({ target, onComplete, className }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(() => target.getTime() - Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      const diff = target.getTime() - Date.now();
      setRemaining(diff);
      if (diff <= 0) {
        clearInterval(id);
        onComplete?.();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [target, onComplete]);

  return (
    <span className={`font-[family-name:var(--font-mono)] tabular-nums ${className ?? ""}`}>
      {formatRemaining(remaining)}
    </span>
  );
}
