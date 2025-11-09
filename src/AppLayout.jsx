// src/AppLayout.jsx
import React from "react";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#0d0d0d] text-gray-200 font-sans">
      {children}
    </div>
  );
}
