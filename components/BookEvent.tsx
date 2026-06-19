'use client';

import React, { useState } from "react";
import { toast } from "sonner";


const BookEvent = () => {
    const [email,setEmail] = useState('');
    const [submitted,setsubmitted] = useState(false);

    const handleSubmit = (e : React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setTimeout(() => {
            setsubmitted(true);
            toast.custom(() => (
              <div className="toast-success">
                <div className="toast-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 8.5L6.2 11.7L13 4"
                      stroke="#9FE1CB"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="toast-check"
                    />
                  </svg>
                </div>
                <div>
                  <p className="toast-title">You're signed up</p>
                  <p className="toast-subtitle">Check your email for confirmation</p>
                </div>
              </div>
            ));
        }, 1000);
    }
  return (
    <div id="book-event">
        {submitted ? (
            <p className="text-sm">Thanks for signing up!</p>
        ) : (
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            (e.currentTarget as HTMLInputElement).setCustomValidity('');
                        }}
                        placeholder="johndoe@domain.com"
                        required
                        pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                        onInvalid={(e) => {
                            const target = e.currentTarget as HTMLInputElement;
                            if (!target.value) {
                                target.setCustomValidity('Please enter your email address.');
                            } else {
                                target.setCustomValidity('Please enter a valid email address.');
                            }
                        }}
                        aria-describedby="email-help"
                    />
                    <p id="email-help" className="sr-only">
                        Enter a valid email like user@domain.com
                    </p>
                </div>
                <button type="submit" className="button-submit">
                    Submit
                </button>
            </form>
        )}
    </div>

  );
};

export default BookEvent;