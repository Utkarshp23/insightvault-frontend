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
    const originalRequest = error.config;

    // If request was to /auth/refresh or /auth/login/signup, don't attempt to refresh
    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (error.response && error.response.status === 401) {
      // prevent infinite loop
      originalRequest._retry = true;

      if (isRefreshing) {
        // queue the request - it will be retried after refresh
        return new Promise((resolve, reject) => {
          addRefreshSubscriber((newToken) => {
            if (!newToken) return reject(error);
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;
      try {
        // Call refresh endpoint - send cookies (refresh token cookie should be HttpOnly)
        const r = await axios.post(
          (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080") +
            "/auth/refresh",
          {},
          { withCredentials: true }
        );

        const newAccessToken = r.data?.accessToken;
        // let AuthProvider know about new token via subscriber callback
        onRefreshed(newAccessToken);
        isRefreshing = false;
        return api(originalRequest); // retry original request (interceptor will attach token via getter)
      } catch (refreshError) {
        // refresh failed — notify subscribers with null so they can sign out
        onRefreshed(null);
        isRefreshing = false;
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
