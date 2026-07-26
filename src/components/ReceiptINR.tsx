import React from 'react';

export const ReceiptINR: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Receipt Ticket Outline */}
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z" />
    {/* Indian Rupee ₹ symbol inside */}
    <path d="M8.5 7h7" />
    <path d="M8.5 10.5h7" />
    <path d="M8.5 7h4a2.25 2.25 0 0 1 0 4.5h-4" />
    <path d="M11.5 11.5l4.5 5.5" />
  </svg>
);
