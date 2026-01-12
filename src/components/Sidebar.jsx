// src/components/Sidebar.jsx
import React from "react";

export default function Sidebar({
  tabs,
  activeTab,
  onChangeTab,
  onLogout,
  userEmail, // optional: show logged-in user
}) {
  return (
    <aside className="w-52 bg-surface border-r border-gray-700 p-3 flex flex-col">
      <div className="mb-4">
        <h1 className="text-green-400 text-lg font-semibold">🧾 PDF CLI</h1>
        {userEmail && (
          <div
            className="text-xs text-gray-400 mt-2 truncate"
            title={userEmail}
          >
            {userEmail}
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onChangeTab(tab)}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors flex items-center gap-3 ${
                isActive
                  ? "bg-gray-700 text-green-300"
                  : "text-gray-300 hover:bg-gray-800"
              }`}
            >
              {/* Optional small bullet/emoji per tab */}
              <span className="text-sm opacity-80">
                {tab === "Home"
                  ? "🏠"
                  : tab === "Uploads"
                  ? "⬆️"
                  : tab === "My Documents" // Updated check
                  ? "📜"
                  : tab === "Profile"
                  ? "👤"
                  : "·"}
              </span>
              <span className="text-sm">{tab}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-gray-700">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-red-800 text-sm text-red-300 transition"
        >
          {/* simple logout / power SVG icon */}
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M10 3v4" />
            <path d="M21 12a9 9 0 1 1-9-9" />
            <path d="M16 17l5 0" />
            <path d="M21 17l-4-5" />
          </svg>
          <span>Logout</span>
        </button>

        <div className="text-xs text-gray-500 mt-3">Alt+1/2/3 to switch</div>
      </div>
    </aside>
  );
}
