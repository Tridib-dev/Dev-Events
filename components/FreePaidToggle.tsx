'use client';

import React, { useState, useEffect } from 'react';

interface FreePaidToggleProps {
  onChange?: (price: number) => void;
  defaultPrice?: number;
}

const FreePaidToggle = ({ onChange, defaultPrice = 0 }: FreePaidToggleProps) => {
  const [isFree, setIsFree] = useState(defaultPrice === 0);
  const [amount, setAmount] = useState(defaultPrice);

  // Sync with parent when value changes
  useEffect(() => {
    onChange?.(isFree ? 0 : amount);
  }, [isFree, amount, onChange]);

  const handleToggle = (free: boolean) => {
    setIsFree(free);
    if (free) setAmount(0);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setAmount(value);
  };

  return (
    <div className="field">
      <label className="block mb-3 text-light-200">Event Pricing</label>
      
      <div className="glass-radio-group">
        <input 
          type="radio" 
          name="pricing" 
          id="free" 
          checked={isFree} 
          onChange={() => handleToggle(true)} 
        />
        <label htmlFor="free">Free Event</label>

        <input 
          type="radio" 
          name="pricing" 
          id="paid" 
          checked={!isFree} 
          onChange={() => handleToggle(false)} 
        />
        <label htmlFor="paid">Paid Event</label>

        <div className="glass-glider" />
      </div>

      {!isFree && (
        <div className="mt-4">
          <label htmlFor="price" className="text-sm text-light-400 mb-1 block">
            Ticket Price (₹)
          </label>
          <input
            id="price"
            name="price"
            type="number"
            min="1"
            value={amount}
            onChange={handleAmountChange}
            className="w-full px-4 py-3 bg-dark-200 border border-dark-300 rounded-2xl text-lg focus:outline-none focus:border-primary"
            placeholder="Enter amount in rupees"
            required={!isFree}
          />
        </div>
      )}
    </div>
  );
};

export default FreePaidToggle;