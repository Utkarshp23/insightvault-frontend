// src/App.jsx
import React, { useState } from "react";
import { BrowserRouter, Routes, Route,useNavigate  } from "react-router-dom";
import { useHotkeys } from "react-hotkeys-hook";

import { AuthProvider } from "./auth/AuthProvider";
import ProtectedRoute from "./auth/ProtectedRout";

// prefer pages folder (adjust if your files live elsewhere)
import Landing from "./components/Landing";
import Login from "./auth/Login";
import Signup from "./auth/SignUp";

// your existing components
import Sidebar from "./components/Sidebar";
import Uploads from "./components/Uploads";
import History from "./components/History";
import AppLayout from "./AppLayout";
import Dashboard from "./components/Dashboard";
import { useAuth } from "./auth/useAuth";

/**
 * AppShell contains the original app UI and behavior (tabs, hotkeys, upload queue).
 * This will be shown only when user is authenticated (ProtectedRoute wraps it).
 */
function AppShell() {
  // include Home tab and set default to Home
  const tabs = ["Home", "Uploads", "History"];
  const [activeTab, setActiveTab] = useState("Home");
  const [uploadQueue, setUploadQueue] = useState([]);

  const { logout, user } = useAuth(); // assume useAuth returns logout and user
  const navigate = useNavigate();

  // hotkeys: map alt+1 -> Home, alt+2 -> Uploads, alt+3 -> History
  useHotkeys("alt+1", () => setActiveTab("Home"));
  useHotkeys("alt+2", () => setActiveTab("Uploads"));
  useHotkeys("alt+3", () => setActiveTab("History"));

  const handleLogout = async () => {
    try {
      await logout(); // clear tokens on client and/or server
    } catch (e) {
      // ignore or show notification
      console.error("Logout failed", e);
    } finally {
      navigate("/login", { replace: true });
    }
  };

  // upload queue helpers unchanged
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
            onComplete={markComplete}
            uploadUrl={
              import.meta.env.VITE_UPLOAD_URL ||
              "http://localhost:8080/uploadFile"
            }
          />
        )}

        {activeTab === "History" && <History />}
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

            {/* fallback: send unknown routes to landing */}
            <Route path="*" element={<Landing />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </AuthProvider>
  );
}
