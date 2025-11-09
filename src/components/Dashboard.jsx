// src/pages/Dashboard.jsx
import React from "react";

export default function Dashboard() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl text-accent font-semibold">Dashboard</h2>

      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-gray-900 border border-gray-800 rounded-lg">
          <div className="text-xs text-gray-400">Queued uploads</div>
          <div className="text-xl text-green-300 font-medium mt-2">3</div>
        </div>

        <div className="p-4 bg-gray-900 border border-gray-800 rounded-lg">
          <div className="text-xs text-gray-400">Completed</div>
          <div className="text-xl text-green-300 font-medium mt-2">24</div>
        </div>

        <div className="p-4 bg-gray-900 border border-gray-800 rounded-lg">
          <div className="text-xs text-gray-400">Errors</div>
          <div className="text-xl text-red-400 font-medium mt-2">1</div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-300">
        Welcome back — this area can show recent activity, tips, or quick actions.
      </div>
    </div>
  );
}
