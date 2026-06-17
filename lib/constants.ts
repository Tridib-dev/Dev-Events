export type EventProps = {
    title : string;
    image : string;
    slug : string;
    location : string;
    date : string;
    time:string;
}
export const events: EventProps[] = [
    { 
        image: '/images/event1.png', 
        title: 'Global Tech Summit 2026',
        slug: 'global-tech-summit-2026',
        location: 'San Francisco, CA',
        date: 'June 24, 2026',
        time: '09:00 AM PST'
    },
    { 
        image: '/images/event2.png', 
        title: 'Next.js Hackathon',
        slug: 'nextjs-hackathon',
        location: 'Bengaluru, India',
        date: 'July 12, 2026',
        time: '10:00 AM IST'
    },
    { 
        image: '/images/event3.png', 
        title: 'AI Automation Workshop',
        slug: 'ai-automation-workshop',
        location: 'London, UK',
        date: 'August 05, 2026',
        time: '02:00 PM BST'
    },
    { 
        image: '/images/event4.png', 
        title: 'DevOps & Cloud Conference',
        slug: 'devops-cloud-conference',
        location: 'Austin, TX',
        date: 'September 19, 2026',
        time: '08:30 AM CST'
    },
    { 
        image: '/images/event5.png', 
        title: 'Open Source Unlocked',
        slug: 'open-source-unlocked',
        location: 'Berlin, Germany',
        date: 'October 11, 2026',
        time: '11:00 AM CEST'
    },
    { 
        image: '/images/event6.png', 
        title: 'FullStack Developers Meet',
        slug: 'fullstack-developers-meet',
        location: 'Mumbai, India',
        date: 'November 02, 2026',
        time: '06:30 PM IST'
    },
];