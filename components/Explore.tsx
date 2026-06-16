"use client";
import Image from 'next/image';
import React from 'react';



const Explore = () => {
  return (
    <div>
      <button type='button' id="explore-btn" className='mt-7 mx-auto' onClick={() => console.log("Button clcked")}>
        <a href="#events">
             Explore Events 
             <Image src="/icons/arrow-down.svg" alt="arrow-down" width={24} height={24} />
        </a>
      </button>

    </div>
  );
};

export default Explore;