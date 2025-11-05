// src/App.jsx
import React, { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import Sidebar from "./components/Sidebar";
import Uploads from "./components/Uploads";
import History from "./components/History";

const tabs = ["Uploads", "History"];

export default function App() {
  const [activeTab, setActiveTab] = useState("Uploads");
  const [uploadQueue, setUploadQueue] = useState([]);

  useHotkeys("alt+1", () => setActiveTab("Uploads"));
  useHotkeys("alt+2", () => setActiveTab("History"));

  const addFilesToQueue = (files) => {
    const pdfFiles = Array.from(files).filter(
      (f) => f.type === "application/pdf"
    );
    if (pdfFiles.length === 0) return;

    const newItems = pdfFiles.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      file,
    }));

    setUploadQueue((prev) => [...prev, ...newItems]);
  };

  const removeFromQueue = (id) => {
    setUploadQueue((prev) => prev.filter((i) => i.id !== id));
  };

  const markComplete = (id, serverResponse) => {
    setUploadQueue((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, completedAt: Date.now(), serverResponse }
          : item
      )
    );
  };

  return (
    <div className="flex h-screen bg-black text-gray-200 font-mono text-sm">
      <Sidebar tabs={tabs} activeTab={activeTab} onChangeTab={setActiveTab} />

      <main className="flex-1 p-6 overflow-auto">
        {activeTab === "Uploads" && (
          <Uploads
            queue={uploadQueue}
            onAddFiles={addFilesToQueue}
            onRemove={removeFromQueue}
            onComplete={markComplete}
            uploadUrl="http://localhost:8080/uploadFile" // <-- your Spring Boot endpoint
          />
        )}

        {activeTab === "History" && <History />}
      </main>
    </div>
  );
}
