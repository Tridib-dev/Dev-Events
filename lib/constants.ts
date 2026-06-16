export type EventProps = {
    title : string;
    image : string;
    slug : string;
    location : string;
    date : string;
}

export const events: EventProps[] = [
    { 
        image: '/images/event1.png', 
        title: 'Global Tech Summit 2026',
        slug: 'global-tech-summit-2026',
        location: 'San Francisco, CA',
        date: 'June 24, 2026'
    },
    { 
        image: '/images/event2.png', 
        title: 'Next.js Hackathon',
        slug: 'nextjs-hackathon',
        location: 'Bengaluru, India',
        date: 'July 12, 2026'
    },
    { 
        image: '/images/event3.png', 
        title: 'AI Automation Workshop',
        slug: 'ai-automation-workshop',
        location: 'London, UK',
        date: 'August 05, 2026'
    },
    { 
        image: '/images/event4.png', 
        title: 'DevOps & Cloud Conference',
        slug: 'devops-cloud-conference',
        location: 'Austin, TX',
        date: 'September 19, 2026'
    },
    { 
        image: '/images/event5.png', 
        title: 'Open Source Unlocked',
        slug: 'open-source-unlocked',
        location: 'Berlin, Germany',
        date: 'October 11, 2026'
    },
    { 
        image: '/images/event6.png', 
        title: 'FullStack Developers Meet',
        slug: 'fullstack-developers-meet',
        location: 'Mumbai, India',
        date: 'November 02, 2026'
    },
];