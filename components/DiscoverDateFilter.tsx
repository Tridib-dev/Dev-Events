'use client';

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

const DiscoverDateFilter = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const dateFrom = searchParams.get("dateFrom") ?? "";
    const dateTo = searchParams.get("dateTo") ?? "";

    const updateParam = (key: "dateFrom" | "dateTo", value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        value ? params.set(key, value) : params.delete(key);
        params.delete("page");
        router.push(`/events/discover?${params.toString()}`);
    };

    const clearDates = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("dateFrom");
        params.delete("dateTo");
        params.delete("page");
        router.push(`/events/discover?${params.toString()}`);
    };

    return (
        <div className="discover-date-filter">
            <div className="discover-date-row">
                <Image src="/icons/calendar.svg" alt="" width={14} height={14} />
                <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => updateParam("dateFrom", e.target.value)}
                    aria-label="From date"
                />
                <span className="discover-date-separator">to</span>
                <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => updateParam("dateTo", e.target.value)}
                    aria-label="To date"
                />
            </div>
            {(dateFrom || dateTo) && (
                <button type="button" className="discover-date-clear" onClick={clearDates}>
                    Clear dates
                </button>
            )}
        </div>
    );
};

export default DiscoverDateFilter;
