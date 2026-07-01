// footer-data.ts — skeleton, fill in as you build features
export const FOOTER_COLUMNS = [
    {
        heading: "Discover",
        links: [
            { label: "All Events", href: "/events/discover" },
            { label: "Conferences", href: "/events/category/conference" },
            { label: "Workshops", href: "/events/category/workshop" },
            { label: "Meetups", href: "/events/category/meetup" },
            { label: "Hackathons", href: "/events/category/hackathon" },
        ],
    },
    {
        heading: "For Organizers",
        links: [
            { label: "Create an Event", href: "/create_event" },
            { label: "Organizer Dashboard", href: "/dashboard", soon: true },
            { label: "Help Center", href: "#", soon: true },
        ],
    },
    {
        heading: "Company",
        links: [
            { label: "About Us", href: "#", soon: true },
            { label: "Blog", href: "#", soon: true },
            { label: "Careers", href: "#", soon: true },
            { label: "Contact Us", href: "#", soon: true },
        ],
    },
    {
        heading: "Legal",
        links: [
            { label: "Terms of Service", href: "#", soon: true },
            { label: "Privacy Policy", href: "#", soon: true },
            { label: "Cookie Policy", href: "#", soon: true },
        ],
    },
    {
        heading: "SEO Pages",
        links: [
            { label: "Events in India", href: "/events/country/india" },
            { label: "Tech Conferences", href: "/events/category/conference" },
            { label: "Developer Meetups", href: "/events/category/meetup" },
            { label: "Upcoming Hackathons", href: "/events/tag/hackathon" },
            { label: "Online Dev Events", href: "/events/discover?mode=online" },
        ],
    },
];

export const SOCIAL_LINKS = [
    { label: "X (Twitter)", href: "https://x.com/", icon: "x" },
    { label: "GitHub", href: "https://github.com/", icon: "github" },
    { label: "LinkedIn", href: "https://linkedin.com/", icon: "linkedin" },
];