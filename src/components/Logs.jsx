import React from "react";

export default function Logs({ logs }) {
  return (
    <div className="bg-[#0d0d0d] p-4 border border-gray-700 max-h-[80vh] overflow-y-auto">
      {logs.map((line, idx) => (
        <div key={idx}>{line}</div>
      ))}
    </div>
  );
}
