// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const resp = await login({ email, password });
      console.log("login resp:", resp);
      // successful login -> redirect to main app UI
      navigate("/app", { replace: true });
    } catch (err) {
      // extract helpful message
      const msg =
        err?.response?.data?.message || err?.message || "Login failed";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d]">
      <form
        onSubmit={onSubmit}
        className="w-[420px] p-8 rounded-2xl bg-[#1a1a1a] shadow-lg border border-gray-800"
      >
        <h2 className="text-xl text-green-400 font-semibold mb-4">Login</h2>

        {error && (
          <div className="text-red-400 mb-3 text-sm">{error}</div>
        )}

        <label className="block mb-4">
          <span className="text-gray-300 text-sm">Email</span>
          <input
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm focus:outline-none focus:border-green-400"
            placeholder="email"
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-300 text-sm">Password</span>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm focus:outline-none focus:border-green-400"
            placeholder="password"
          />
        </label>

        <div className="flex gap-3 mt-4">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-2 rounded bg-green-600 hover:bg-green-500 text-white font-medium"
          >
            {submitting ? "Logging in…" : "Login"}
          </button>

          <Link
            to="/signup"
            className="flex-1 py-2 text-center rounded border border-gray-700 hover:bg-gray-800 text-gray-300"
          >
            Create account
          </Link> 
        </div>
{/* 
        <div style={{ marginTop: 12, color: "#666" }}>
          <small>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </small>
        </div> */}
      </form>
    </div>
  );
}
