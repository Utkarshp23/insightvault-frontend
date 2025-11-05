import React from "react";

export default function Sidebar({ tabs, activeTab, onChangeTab }) {
  return (
    <aside className="w-52 bg-[#1a1a1a] border-r border-gray-700 p-3 flex flex-col">
      <h1 className="text-green-400 mb-4">🧾 PDF CLI</h1>
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChangeTab(tab)}
          className={`text-left px-2 py-1 rounded ${
            activeTab === tab
              ? "bg-gray-700 text-green-300"
              : "hover:bg-gray-700"
          }`}
        >
          {tab}
        </button>
      ))}
      <div className="mt-auto text-xs text-gray-500 pt-6 border-t border-gray-700">
        Alt+1/2 to switch
      </div>
    </aside>
  );
}
