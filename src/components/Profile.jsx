// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../auth/useAuth";
import api from "../auth/authApi";

export default function Profile() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Use whatever your useAuth exposes. If your hook does not provide token, it'll be undefined.
  // If you use cookie sessions, request will work without Authorization header.
  const { getAccessToken } = useAuth() || {};

  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      const authUrl = import.meta.env.VITE_API_BASE_URL + "/auth/me";

      try {
        const resp = await api.get("/auth/me", { withCredentials: true });
        if (!mounted) return;
        setData(resp.data);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Failed to fetch profile");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      mounted = false;
    };
  }, [getAccessToken]);

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl text-accent font-semibold mb-4">Profile</h2>

      {loading && (
        <div className="p-4 bg-gray-900 border border-gray-800 rounded">
          Loading...
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-900 border border-red-800 rounded text-red-200">
          {error}
        </div>
      )}

      {data && (
        <div className="space-y-4">
          <div className="p-4 bg-gray-900 border border-gray-800 rounded">
            <div className="text-xs text-gray-400">Subject</div>
            <div className="text-lg text-green-300 font-medium">{data.sub}</div>
          </div>

          <div className="p-4 bg-gray-900 border border-gray-800 rounded">
            <div className="text-xs text-gray-400">Roles</div>
            <ul className="list-disc pl-5 mt-2 text-gray-300">
              {Array.isArray(data.roles) && data.roles.length > 0 ? (
                data.roles.map((r, i) => <li key={i}>{r}</li>)
              ) : (
                <li className="text-gray-500">No roles</li>
              )}
            </ul>
          </div>

          {/* show raw payload for debug (optional) */}
          <div className="p-3 bg-gray-900 border border-gray-800 rounded text-xs text-gray-400">
            <div className="mb-2">Raw response</div>
            <pre className="overflow-auto text-xs">{JSON.stringify(data, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
