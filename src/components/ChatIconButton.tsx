import React from "react";

export default function ChatIconButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 z-50 bg-gradient-to-br from-blue-500 to-sky-600 shadow-lg rounded-full w-16 h-16 flex items-center justify-center hover:scale-105 transition-transform"
      aria-label="Open Chat"
    >
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-message-circle">
        <path d="M21 11.5a8.38 8.38 0 0 1-1.9 5.4A8.5 8.5 0 1 1 3.4 6.6a8.38 8.38 0 0 1 5.4-1.9h.5a8.5 8.5 0 0 1 8.5 8.5v.5z"></path>
      </svg>
    </button>
  );
}
