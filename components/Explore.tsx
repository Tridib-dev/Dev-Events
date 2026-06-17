"use client";
import Image from 'next/image';
import React from 'react';
import posthog from 'posthog-js';



const Explore = () => {
  const handleExploreClick = () => {
    console.log("Button clcked");
    posthog.capture('explore_events_clicked');
  };

  return (
    <div>
      <button type='button' id="explore-btn" className='mt-7 mx-auto' onClick={handleExploreClick}>
        <a href="#events">
             Explore Events
             <Image src="/icons/arrow-down.svg" alt="arrow-down" width={24} height={24} />
        </a>
      </button>

    </div>
  );
};

export default Explore;