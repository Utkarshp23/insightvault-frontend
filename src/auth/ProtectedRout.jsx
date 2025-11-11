// src/auth/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { user, fetchMe, setAccessToken, getAccessToken } = useAuth(); // fetchMe and setAccessToken should be exposed by your AuthProvider
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setChecking(true);

      // If we already have an in-memory token or user, allow immediately.
      if (user || (getAccessToken && getAccessToken())) {
        if (!mounted) return;
        setAllowed(true);
        setChecking(false);
        return;
      }

      // Otherwise try one refresh (will return new access token if cookie present)
      try {
        const base =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
        const r = await fetch(base + "/auth/refresh", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: "{}",
        });

        if (r.ok) {
          const data = await r.json();
          if (data?.accessToken) {
            if (setAccessToken) setAccessToken(data.accessToken);
            if (fetchMe) await fetchMe();
          }
        }
      } catch (err) {
        // ignore
      } finally {
        if (!mounted) return;
        // allowed if we have user or token now
        setAllowed(!!(user || (getAccessToken && getAccessToken())));
        setChecking(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [user, getAccessToken, fetchMe, setAccessToken]);

  if (checking) return <div>Checking authentication…</div>;
  if (!allowed) return <Navigate to="/login" replace />;

  return children;
}
