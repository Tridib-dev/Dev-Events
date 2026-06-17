import EventCard from '@/components/EventCard';
import Explore from '@/components/Explore';
import { events } from '@/lib/constants';

const Page = () => {
  return (
    <section>
      <h1 className='text-center mt-30'>The Hub for Every Dev <br /> Events You Cant Miss</h1>
      <p className='text-center mt-5'>Hackathons, Meetups, and Conferences , All in one place </p>

      <Explore />

      <div className='mt-20 space-y-7'>
        <h3>Featured Events</h3>
        <ul className='events'>
          {events.map((event) =>(
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



