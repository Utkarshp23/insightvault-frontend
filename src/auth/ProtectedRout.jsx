// src/auth/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { user, fetchMe, setAccessToken } = useAuth(); // fetchMe and setAccessToken should be exposed by your AuthProvider
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setChecking(true);
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
        // ignore - user will stay unauthenticated
      } finally {
        if (!mounted) return;
        setAllowed(!!(user || awaitPromiseUser())); // fallback check
        setChecking(false);
      }
    })();

    async function awaitPromiseUser() {
      await new Promise((r) => setTimeout(r, 10));
      return useAuth().user; 
    }

    return () => {
      mounted = false;
    };
  }, []);

  if (checking) return <div>Checking authentication…</div>;
  if (!allowed) return <Navigate to="/login" replace />;

  return children;
}
