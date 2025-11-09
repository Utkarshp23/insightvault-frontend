// src/auth/ProtectedRoute.jsx
import React from "react";
import { useAuth } from "./useAuth";
import { Navigate } from "react-router-dom";

/**
 * Wrap protected UI with <ProtectedRoute><YourComponent/></ProtectedRoute>
 * If auth is still loading, you may return null or a loader.
 * If not authenticated, redirects to /login.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // return a basic loader while checking session
    return <div style={{ padding: 24 }}>Checking session…</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
