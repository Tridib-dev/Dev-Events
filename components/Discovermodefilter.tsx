// components/Discovermodefilter · TSX
'use client';
 
import React from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { EVENT_MODES } from "@/lib/constants/event-mode";
 
const MODE_ICON_SRC: Record<string, string> = {
    "in-person": "/icons/building-2.svg",
    online: "/icons/wifi.svg",
    hybrid: "/icons/globe.svg",
};
 
const DiscoverModeFilter = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const activeMode = searchParams.get("mode") ?? "";
 
    const handleSelect = (modeSlug: string) => {
        const params = new URLSearchParams(searchParams.toString());
        modeSlug ? params.set("mode", modeSlug) : params.delete("mode");
        params.delete("page");
        router.push(`/events/discover?${params.toString()}`);
    };
 
    return (
        <div className="discover-mode-filter">
            <button
                type="button"
                className={`discover-mode-pill ${!activeMode ? "active" : ""}`}
                onClick={() => handleSelect("")}
            >
                Any
            </button>
            {EVENT_MODES.map((mode) => {
                const isActive = activeMode === mode.slug;
                return (
                    <button
                        key={mode.slug}
                        type="button"
                        className={`discover-mode-pill ${isActive ? "active" : ""}`}
                        onClick={() => handleSelect(mode.slug)}
                    >
                        <span className={`discover-mode-icon ${isActive ? "discover-mode-icon-active" : ""}`}>
                            <Image src={MODE_ICON_SRC[mode.slug]} alt="" width={13} height={13} />
                        </span>
                        {mode.label}
                    </button>
                );
            })}
        </div>
    );
};
 
export default DiscoverModeFilter;
 