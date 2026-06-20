import EventCard from '@/components/EventCard';
import Explore from '@/components/Explore';
import { IEvent } from '@/database';
import { cacheLife } from 'next/cache';



const public_url = process.env.NEXT_PUBLIC_BASE_URL;

const Page = async () => {
  'use cache';
  cacheLife('hours')

  let events = [];
  try {
    const response = await fetch(`${public_url}/api/events/`);
    
    if (!response.ok) {
      console.error(`Failed to fetch events: ${response.status}`);
    } else {
      const data = await response.json();
      events = data.events || [];
    }
  } catch (error) {
    console.error('Error fetching events:', error);
  }
 
  return (
    <section>
      <h1 className='text-center mt-30'>The Hub for Every Dev <br /> Events You Cant Miss</h1>
      <p className='text-center mt-5'>Hackathons, Meetups, and Conferences , All in one place </p>

      <Explore />

      <div className='mt-20 space-y-7'>
        <h3>Featured Events</h3>
        <ul className='events'>
          {events && events.length > 0 && events.map((event : IEvent) =>(
            <li key={event.title}>
              <EventCard {...event}/>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Page;



