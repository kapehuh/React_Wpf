// src/components/SwapButton.jsx
import React from 'react';

const SwapButton = ({ onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-7 h-16 border rounded bg-gray-10 flex items-center justify-center overflow-hidden p-0.5
      border-transparent hover:border-gray-400 transition-colors
      ${
        disabled ? 'opacity-50 cursor-default' : 'hover:bg-gray-100'}`
      }
    title="Поменять местами высоту и ширину"
  >
    {/* Иконка двусторонней стрелки */}
    <svg viewBox="0 0 15 30" className="w-full h-full fill-current text-gray-300 stroke-current stroke-[2] text-gray-400" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 2 L6 4 L14 4 L14 26 L6 26 L6 28 L3 24 L6 20 L6 22 L16 22 L16 8 L6 8 L6 10 L3 6 Z" />
    </svg>

  </button>
);

export default SwapButton;