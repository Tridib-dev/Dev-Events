'use client';

import React, { useMemo, useRef, useState } from "react";

export interface TagPickerProps {
    onChange: (tags: string[]) => void;
}

interface TagGroup {
    category: string;
    tags: string[];
}

const TAG_TAXONOMY: TagGroup[] = [
    {
        category: "Developer Events",
        tags: [
            "Web Development", "Frontend", "Backend", "Full Stack", "JavaScript",
            "TypeScript", "React", "Next.js", "Node.js", "Python", "Java", "Go",
            "Rust", "DevOps", "Cloud Computing", "AWS", "Azure", "Google Cloud",
            "Kubernetes", "Docker", "Cybersecurity", "Open Source",
            "Mobile Development", "Android", "iOS", "Flutter", "React Native",
            "Game Development", "AR/VR",
        ],
    },
    {
        category: "AI & Data",
        tags: [
            "Artificial Intelligence", "Machine Learning", "Deep Learning",
            "Generative AI", "LLMs", "AI Agents", "Computer Vision", "NLP",
            "Data Science", "Data Analytics", "MLOps", "Prompt Engineering",
            "RAG", "Vector Databases",
        ],
    },
    {
        category: "Startup & Entrepreneurship",
        tags: [
            "Startups", "Entrepreneurship", "Founders", "Venture Capital",
            "Fundraising", "Product Management", "Growth", "Marketing", "Sales",
            "SaaS", "No-Code", "Indie Hackers",
        ],
    },
    {
        category: "Event Formats",
        tags: [
            "Conference", "Meetup", "Workshop", "Webinar", "Hackathon", "Seminar",
            "Panel Discussion", "Networking Event", "Product Launch", "Demo Day",
            "Fireside Chat", "Bootcamp", "Competition", "Career Fair",
        ],
    },
    {
        category: "Student Events",
        tags: [
            "Student Community", "College Fest", "Coding Contest",
            "Placement Preparation", "Study Abroad", "Research", "Innovation",
            "Campus Event",
        ],
    },
    {
        category: "Professional Development",
        tags: [
            "Leadership", "Public Speaking", "Career Development",
            "Resume Building", "Interview Preparation", "Networking",
            "Personal Branding",
        ],
    },
    {
        category: "Industry Tags",
        tags: [
            "FinTech", "HealthTech", "EdTech", "ClimateTech", "E-Commerce",
            "Robotics", "Blockchain", "Web3", "IoT", "Aerospace", "Automotive",
            "Gaming",
        ],
    },
    {
        category: "Experience Level",
        tags: ["Beginner", "Intermediate", "Advanced", "Expert"],
    },
    {
        category: "Audience Tags",
        tags: [
            "Students", "Developers", "Designers", "Founders", "Researchers",
            "Investors", "Recruiters", "Product Managers",
        ],
    },
];

const ALL_TAGS = TAG_TAXONOMY.flatMap((group) =>
    group.tags.map((tag) => ({ tag, category: group.category }))
);

const TagPicker = ({ onChange }: TagPickerProps) => {
    const [selected, setSelected] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedLower = useMemo(
        () => new Set(selected.map((t) => t.toLowerCase())),
        [selected]
    );

    const filteredGroups = useMemo(() => {
        const query = inputValue.trim().toLowerCase();
        if (!query) return [];

        const matches = ALL_TAGS.filter(
            ({ tag }) => tag.toLowerCase().includes(query) && !selectedLower.has(tag.toLowerCase())
        );

        const grouped = new Map<string, string[]>();
        matches.forEach(({ tag, category }) => {
            if (!grouped.has(category)) grouped.set(category, []);
            grouped.get(category)!.push(tag);
        });

        return Array.from(grouped.entries());
    }, [inputValue, selectedLower]);

    const exactMatchExists = useMemo(() => {
        const query = inputValue.trim().toLowerCase();
        if (!query) return true;
        return ALL_TAGS.some(({ tag }) => tag.toLowerCase() === query);
    }, [inputValue]);

    const emit = (next: string[]) => {
        setSelected(next);
        onChange(next);
    };

    const addTag = (raw: string) => {
        const cleaned = raw.trim();
        if (!cleaned) return;
        if (selectedLower.has(cleaned.toLowerCase())) {
            setInputValue("");
            return;
        }
        emit([...selected, cleaned]);
        setInputValue("");
        setIsOpen(false);
        inputRef.current?.focus();
    };

    const removeTag = (tag: string) => {
        emit(selected.filter((t) => t !== tag));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addTag(inputValue);
        } else if (e.key === "Backspace" && !inputValue && selected.length > 0) {
            removeTag(selected[selected.length - 1]);
        } else if (e.key === "Escape") {
            setIsOpen(false);
        }
    };

    return (
        <div className="tag-picker">
            <div className="tag-input-wrapper">
                {selected.map((tag) => (
                    <span className="pill pill-removable" key={tag}>
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>
                            &times;
                        </button>
                    </span>
                ))}
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onBlur={() => setTimeout(() => setIsOpen(false), 150)}
                    onKeyDown={handleKeyDown}
                    placeholder={selected.length === 0 ? "Search or type a tag..." : ""}
                />
            </div>

            {isOpen && inputValue.trim() && (
                <div className="tag-suggestions">
                    {filteredGroups.length === 0 && (
                        <p className="tag-suggestions-empty">No matches in our list.</p>
                    )}

                    {filteredGroups.map(([category, tags]) => (
                        <div className="tag-suggestion-group" key={category}>
                            <p className="tag-suggestion-category">{category}</p>
                            {tags.map((tag) => (
                                <button
                                    type="button"
                                    key={tag}
                                    className="tag-suggestion-item"
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        addTag(tag);
                                    }}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    ))}

                    {!exactMatchExists && (
                        <button
                            type="button"
                            className="tag-suggestion-custom"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                addTag(inputValue);
                            }}
                        >
                            + Add &ldquo;{inputValue.trim()}&rdquo; as a new tag
                        </button>
                    )}
                </div>
            )}

            <p className="field-hint">Search the list or type your own, then press Enter.</p>
        </div>
    );
};

export default TagPicker;