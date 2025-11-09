// src/pages/Signup.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export default function SignUp() {
  const { signup } = useAuth();
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
      await signup({ email, password });
      navigate("/app", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Signup failed";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base text-gray-200">
      <form
        onSubmit={onSubmit}
        className="w-[420px] p-8 bg-surface rounded-2xl border border-gray-800 shadow-xl"
      >
        <h2 className="text-xl font-semibold text-accent mb-6">
          Create Account
        </h2>

        {error && (
          <div className="text-red-400 mb-3 text-sm bg-gray-900 p-2 rounded">
            {error}
          </div>
        )}

        <label className="block mb-4">
          <span className="text-sm text-gray-300">Email</span>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded bg-gray-900 border border-gray-700 focus:outline-none focus:border-accent text-sm"
          />
        </label>

        <label className="block mb-4">
          <span className="text-sm text-gray-300">Password</span>
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-1 px-3 py-2 rounded bg-gray-900 border border-gray-700 focus:outline-none focus:border-accent text-sm"
          />
        </label>

        <div className="flex gap-3 mt-6">
          <button
            type="submit"
            disabled={submitting}
            // className="flex-1 py-2 bg-accent text-white rounded hover:bg-green-500 transition disabled:opacity-60"
            className="flex-1 py-2 rounded bg-green-600 hover:bg-green-500 text-white font-medium"
          >
            {submitting ? "Creating…" : "Sign up"}
          </button>

          <Link
            to="/login"
            className="flex-1 text-center py-2 border border-gray-700 rounded hover:bg-gray-800 transition text-gray-300"
          >
            Already have an account?
          </Link>
        </div>
      </form>
    </div>
  );
}
