'use client';

import React, { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ALL_TAGS } from "@/lib/constants/event-taxonomy";

const slugify = (value: string): string => value.toLowerCase().replace(/\s+/g, "-");

const DiscoverTagFilter = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const selectedTags = useMemo(
        () => searchParams.get("tags")?.split(",").filter(Boolean) ?? [],
        [searchParams]
    );

    const groupedTags = useMemo(() => {
        const map = new Map<string, string[]>();
        ALL_TAGS.forEach(({ tag, category }) => {
            if (!map.has(category)) map.set(category, []);
            map.get(category)!.push(tag);
        });
        return Array.from(map.entries());
    }, []);

    const toggleTag = (tagSlug: string) => {
        const next = selectedTags.includes(tagSlug)
            ? selectedTags.filter((t) => t !== tagSlug)
            : [...selectedTags, tagSlug];

        const params = new URLSearchParams(searchParams.toString());
        next.length > 0 ? params.set("tags", next.join(",")) : params.delete("tags");
        params.delete("page");

        router.push(`/events/discover?${params.toString()}`);
    };

    return (
        <div className="discover-tag-filter">
            {groupedTags.map(([category, tags]) => (
                <div key={category} className="discover-tag-group">
                    <p className="discover-tag-group-title">{category}</p>
                    <div className="discover-tag-list">
                        {tags.map((tag) => {
                            const slug = slugify(tag);
                            const checked = selectedTags.includes(slug);
                            return (
                                <label key={tag} className="discover-tag-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => toggleTag(slug)}
                                    />
                                    {tag}
                                </label>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DiscoverTagFilter;