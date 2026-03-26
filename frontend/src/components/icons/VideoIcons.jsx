    import React from "react";

export function MicOffIcon() {
  return (
    <svg width="24" height="24" fill="currentColor">
      <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" />
      <path d="M12 14a4 4 0 0 0 4-4V6" />
    </svg>
  );
}

export function VideoOffIcon() {
  return (
    <svg width="24" height="24" fill="currentColor">
      <line x1="3" y1="3" x2="21" y2="21" stroke="currentColor" />
      <rect x="3" y="7" width="13" height="10" rx="2" />
    </svg>
  );
}

export function EndCallIcon() {
  return (
    <svg width="24" height="24" fill="red">
      <path d="M4 12c8-8 16-8 20 0l-2 2c-6-6-10-6-16 0z" />
    </svg>
  );
}

export function CheckCircleIcon() {
  return (
    <svg width="24" height="24" fill="green">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12l2 2 4-4" stroke="white" strokeWidth="2" />
    </svg>
  );
}
