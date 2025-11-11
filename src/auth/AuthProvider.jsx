// src/auth/AuthProvider.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import api, { setAccessTokenGetter, setAccessTokenSetter } from "./authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAccessTokenGetter( () => accessToken);
    setAccessTokenSetter((tok) => {
      // authApi may call this with new access token after refresh
      setAccessToken(tok);
      if (tok) {
        api.defaults.headers = api.defaults.headers || {};
        api.defaults.headers.common = api.defaults.headers.common || {};
        api.defaults.headers.common["Authorization"] = `Bearer ${tok}`;
      } else {
        if (api?.defaults?.headers?.common) {
          delete api.defaults.headers.common["Authorization"];
        }
      }
    });
  }, [accessToken]);

  // Helper: fetch /auth/me (requires a valid access token)
  const fetchMe = useCallback(async () => {
    try {
      console.log("AuthProvider fetchMe called");
      const res = await api.get("/auth/me");
      console.log("fetchMe response:", res.data);
      setUser(res.data);
      return res.data;
    } catch (e) {
      setUser(null);
      return null;
    }
  }, []);

  // Login
  const login = async ({ email, password }) => {
    console.log("AuthProvider login called", email, password);
    const resp = await api.post(
      "/auth/login",
      {
        email,
        password,
      },
      { withCredentials: true }
    );

    console.log("login response:", resp.data);
    const tokenFromResp = resp.data?.accessToken;
    if (tokenFromResp) {
      // 1) set in-memory state
      setAccessToken(tokenFromResp);

      // 2) attach immediately to axios so next requests include it
      api.defaults.headers = api.defaults.headers || {};
      api.defaults.headers.common = api.defaults.headers.common || {};
      api.defaults.headers.common["Authorization"] = `Bearer ${tokenFromResp}`;

      // 3) populate user from /auth/me
      try {
        const me = await fetchMe(); // fetchMe uses api (which now has header)
        return { ...resp.data, user: me };
      } catch (e) {
        // If /auth/me fails, return resp so caller can inspect
        return resp.data;
      }
    }
  };

  // Signup (optionally auto-login on signup if backend returns token)
  const signup = async ({ email, password }) => {
    const resp = await api.post("/auth/signup", { email, password });
    // If backend returns token & user, set them
    const tokenFromResp = resp.data?.accessToken;
    if (tokenFromResp) {
      setAccessToken(tokenFromResp);
      api.defaults.headers = api.defaults.headers || {};
      api.defaults.headers.common = api.defaults.headers.common || {};
      api.defaults.headers.common["Authorization"] = `Bearer ${tokenFromResp}`;

      try {
        const me = await fetchMe();
        return { ...resp.data, user: me };
      } catch (e) {
        return resp.data;
      }
    }
  };

  // Logout
  const logout = async () => {
    try {
      // Ask server to revoke refresh token (server should read cookie or body)
      const respe = await api.post(
        "/auth/logout",
        {},
        { withCredentials: true }
      );
      console.log("logout response:", respe.data);
    } catch (e) {
      // ignore network/server errors for logout - still clear client state
    } finally {
      // clear in-memory token + user
      setAccessToken(null);
      setUser(null);

      // IMPORTANT: remove Authorization header from axios defaults so it is not sent again
      if (api?.defaults?.headers?.common) {
        delete api.defaults.headers.common["Authorization"];
      }
    }
  };

  // Expose function for UploadItem to get current token (in-memory)
  const getAccessToken = () => accessToken;

  const ctx = {
    user,
    loading,
    login,
    signup,
    logout,
    fetchMe,
    getAccessToken,
    setAccessToken,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={ctx}>{children}</AuthContext.Provider>;
}

/**
 * Export a single shared `useAuth` hook that consumes the same AuthContext.
 * Use this in your components: `import { useAuth } from './auth/AuthProvider'`
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
