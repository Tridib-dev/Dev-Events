// components/CategoryTabs.tsx

import Link from "next/link";
import { EVENT_CATEGORIES } from "@/lib/constants/event-categories";

const slugify = (value: string): string => value.toLowerCase().replace(/\s+/g, "-");

interface CategoryTabsProps {
    activeCategory?: string;
    searchParams: Record<string, string | undefined>;
}

const CategoryTabs = ({ activeCategory, searchParams }: CategoryTabsProps) => {
    const buildHref = (categorySlug?: string) => {
        const params = new URLSearchParams();
        Object.entries(searchParams).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });
        if (categorySlug) {
            params.set("category", categorySlug);
        } else {
            params.delete("category");
        }
        params.delete("page");

        const query = params.toString();
        return `/events/discover${query ? `?${query}` : ""}`;
    };

    return (
        <div className="category-tabs">
            <Link href={buildHref(undefined)} className={`category-tab ${!activeCategory ? "active" : ""}`}>
                All
            </Link>
            {EVENT_CATEGORIES.map((category) => {
                const slug = slugify(category);
                return (
                    <Link
                        key={category}
                        href={buildHref(slug)}
                        className={`category-tab ${activeCategory === slug ? "active" : ""}`}
                    >
                        {category}
                    </Link>
                );
            })}
        </div>
    );
};

export default CategoryTabs;