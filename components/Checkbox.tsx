import React from 'react';
import styled from 'styled-components';

const Checkbox = () => {
  return (
    <StyledWrapper>
      <label className="container">
        <input type="checkbox" defaultChecked={true} />
        <div className="checkmark" />
      </label>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  /* Hide the default checkbox */
  .container input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  /* Container holding the custom checkbox */
  .container {
    display: block;
    position: relative;
    cursor: pointer;
    font-size: 20px;
    user-select: none;
  }

  /* The custom checkbox (3D box with gradient) */
  .checkmark {
    position: relative;
    top: 0;
    left: 0;
    height: 2em;
    width: 2em;
    background: linear-gradient(
      145deg,
      #ececec,
      #c8c8c8
    ); /* Soft light 3D effect */
    border-radius: 12px; /* Rounded square */
    box-shadow:
      0 4px 10px rgba(0, 0, 0, 0.2),
      inset 0 -2px 5px rgba(0, 0, 0, 0.1); /* 3D shadow */
    transition:
      background-color 0.4s ease,
      transform 0.3s ease;
    overflow: hidden;
    position: relative;
  }

  /* When checked, add vibrant gradient background */
  .container input:checked ~ .checkmark {
    background: linear-gradient(45deg, #42e695, #3bb2b8);
    transform: scale(1.1); /* Slight pop-out effect */
    box-shadow:
      0 0px 20px rgba(66, 230, 149, 0.6),
      inset 0 -2px 8px rgba(0, 0, 0, 0.2);
  }

  /* The checkmark itself */
  .checkmark:after {
    content: "";
    position: absolute;
    display: none;
    width: 0.5em;
    height: 1em;
    border: solid white;
    border-width: 0 0.2em 0.2em 0;
    transform: rotate(45deg);
    left: 0.65em;
    top: 0.2em;
  }

  /* When checked, show the checkmark with a pulse animation */
  .container input:checked ~ .checkmark:after {
    display: block;
    animation: pulse 0.6s ease forwards;
  }

  /* Pulse animation for checkmark */
  @keyframes pulse {
    0% {
      transform: scale(0) rotate(45deg);
    }
    50% {
      transform: scale(1.2) rotate(45deg);
    }
    100% {
      transform: scale(1) rotate(45deg);
    }
  }

  /* Add sparkles when checked */
  .container input:checked ~ .checkmark:before {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 120%;
    height: 120%;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.5),
      transparent 80%
    );
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
    border-radius: 50%;
    transition:
      transform 0.5s ease,
      opacity 0.5s ease;
    animation: sparkle 0.6s ease-out forwards;
  }

  @keyframes sparkle {
    0% {
      transform: translate(-50%, -50%) scale(0);
      opacity: 0.5;
    }
    50% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 0.8;
    }
    100% {
      transform: translate(-50%, -50%) scale(0);
      opacity: 0;
    }
  }

  /* On hover, make it feel interactive with a glowing border */
  .container:hover .checkmark {
    box-shadow:
      0 0 15px rgba(255, 255, 255, 0.7),
      0 4px 10px rgba(0, 0, 0, 0.2);
  }`;

export default Checkbox;
