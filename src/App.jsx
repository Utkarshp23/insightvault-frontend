// /mnt/data/App.jsx
import React, { useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useHotkeys } from "react-hotkeys-hook";
import { v4 as uuidv4 } from "uuid";

import { AuthProvider } from "./auth/AuthProvider";
import ProtectedRoute from "./auth/ProtectedRout";

import Landing from "./components/Landing";
import Login from "./auth/Login";
import Signup from "./auth/SignUp";

import Sidebar from "./components/Sidebar";
import Uploads from "./components/Uploads";
import History from "./components/History";
import AppLayout from "./AppLayout";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import { useAuth } from "./auth/useAuth";

/**
 * AppShell contains the original app UI and behavior (tabs, hotkeys, upload queue).
 */
function AppShell() {
  const tabs = ["Home", "Uploads", "My Documents", "Profile"];
  const [activeTab, setActiveTab] = useState("Home");

  /**
   * uploadQueue shape:
   * { id, file, idempotencyKey, started: boolean, status?, completedAt?, serverResponse? }
   */
  const [uploadQueue, setUploadQueue] = useState([]);

  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useHotkeys("alt+1", () => setActiveTab("Home"));
  useHotkeys("alt+2", () => setActiveTab("Uploads"));
  useHotkeys("alt+3", () => setActiveTab("My Documents"));
  useHotkeys("alt+4", () => setActiveTab("Profile"));

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  // --- NEW: addFilesToQueue pre-generates idempotencyKey and started=false
  const addFilesToQueue = (files) => {
    const pdfFiles = Array.from(files).filter(
      (f) => f.type === "application/pdf"
    );
    if (pdfFiles.length === 0) return;

    const newItems = pdfFiles.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      file,
      idempotencyKey: uuidv4(),
      started: false,
      status: "queued",
    }));

    setUploadQueue((prev) => [...prev, ...newItems]);
  };

  // mark a queue item as started so remounts won't re-trigger upload
  const markStarted = (id) => {
    setUploadQueue((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, started: true, status: "uploading" } : it
      )
    );
  };

  // remove an item (cancelled/removed/done cleanup)
  const removeFromQueue = (id) => {
    setUploadQueue((prev) => prev.filter((i) => i.id !== id));
  };

  // called when a single upload completes successfully (serverResponse is whatever backend returned)
  const markComplete = (id, serverResponse) => {
    setUploadQueue((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, completedAt: Date.now(), status: "done", serverResponse }
          : item
      )
    );
    // optionally you could keep completed items or remove them after a delay
  };

  return (
    <div className="flex h-screen bg-base text-gray-200 font-mono text-sm">
      <Sidebar
        tabs={tabs}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onLogout={handleLogout}
        userEmail={user?.email}
      />

      <main className="flex-1 p-6 overflow-auto">
        {activeTab === "Home" && <Dashboard />}

        {activeTab === "Uploads" && (
          <Uploads
            queue={uploadQueue}
            onAddFiles={addFilesToQueue}
            onRemove={removeFromQueue}
            onStart={markStarted}
            onComplete={markComplete}
          />
        )}

        {activeTab === "My Documents" && <History />}
        {activeTab === "Profile" && <Profile />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route
              path="/app/*"
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Landing />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}
