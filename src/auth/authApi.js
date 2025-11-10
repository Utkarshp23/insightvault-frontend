// src/auth/authApi.js
import axios from "axios";

/**
 * axios instance for authenticated API calls.
 * - baseURL should point to your API gateway/backend.
 * - The refresh flow calls POST /auth/refresh with credentials to get a new access token.
 */

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",
  // we will only send cookies for refresh endpoints explicitly (see refresh call uses withCredentials)
  timeout: 30_000,
});

console.log("[authApi] api instance created, baseURL:", api.defaults.baseURL);

let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb) {
  refreshSubscribers.push(cb);
}

/**
 * Attach access token to requests.
 * We'll not store access token here; request interceptor will pull token from the AuthProvider
 * by calling a callback set later (see setAccessTokenGetter).
 */
let getAccessToken = () => null;
export function setAccessTokenGetter(getter) {
  getAccessToken = getter;
}

// let setAccessTokenInApp = null;
// export function setAccessTokenSetter(fn) {
//   setAccessTokenInApp = fn;
// }

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken && getAccessToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

/**
 * Response interceptor:
 * On 401 we try to refresh using /auth/refresh (cookie-based).
 * We queue requests while a refresh is in progress.
 */
api.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    // Always log so we can see the interceptor is invoked
    try {
      const originalRequest = error?.config;
      console.log(
        "[authApi] response interceptor called:",
        originalRequest?.url,
        "status:",
        error?.response?.status
      );

      // Safety: if it's a network error without response, log and reject
      if (!error.response) {
        console.warn("[authApi] network/no-response error:", error.message);
        return Promise.reject(error);
      }

      // If no original request or already retried, don't attempt refresh
      if (!originalRequest || originalRequest._retry) {
        return Promise.reject(error);
      }

      // IMPORTANT: don't try to refresh when the failing request is the refresh/login/signup itself
      const url = originalRequest.url || "";
      if (
        url.includes("/auth/refresh") ||
        url.includes("/auth/login") ||
        url.includes("/auth/signup")
      ) {
        console.log(
          "[authApi] request to auth endpoint; skipping refresh attempt for:",
          url
        );
        return Promise.reject(error);
      }

      if (error.response.status === 401) {
        originalRequest._retry = true;

        if (isRefreshing) {
          console.log(
            "[authApi] refresh in progress; queueing:",
            originalRequest.url
          );
          return new Promise((resolve, reject) => {
            addRefreshSubscriber((newToken) => {
              if (!newToken) return reject(error);
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
              resolve(api(originalRequest));
            });
          });
        }

        isRefreshing = true;
        try {
          console.log("[authApi] calling /auth/refresh to rotate token");
          const base =
            import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
          const r = await axios.post(
            base + "/auth/refresh",
            {},
            { withCredentials: true }
          );

          const newAccessToken = r.data?.accessToken;
          if (!newAccessToken) {
            console.warn("[authApi] refresh returned no accessToken", r.data);
          } else {
            api.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${newAccessToken}`;
            console.log(
              "[authApi] refresh succeeded, token length:",
              newAccessToken.length
            );
          }

          // if (newAccessToken) {
          //   api.defaults.headers.common[
          //     "Authorization"
          //   ] = `Bearer ${newAccessToken}`;

          //   // ✅ also update React state in AuthProvider if setter is available
          //   if (typeof setAccessTokenInApp === "function") {
          //     try {
          //       setAccessTokenInApp(newAccessToken);
          //       console.log(
          //         "[authApi] updated AuthProvider accessToken via setter"
          //       );
          //     } catch (e) {
          //       console.warn("[authApi] setAccessTokenInApp failed:", e);
          //     }
          //   }
          // }

          onRefreshed(newAccessToken);
          isRefreshing = false;

          // attach new token (request interceptor also uses getter, but attach to be safe)
          if (newAccessToken) {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers[
              "Authorization"
            ] = `Bearer ${newAccessToken}`;
          }
          return api(originalRequest);
        } catch (refreshError) {
          console.error("[authApi] refresh failed:", refreshError);
          onRefreshed(null);
          isRefreshing = false;
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    } catch (err) {
      console.error("[authApi] unexpected error in interceptor:", err);
      return Promise.reject(err);
    }
  }
);

export default api;
