// src/pages/Landing.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base text-gray-200">
      <div className="max-w-3xl w-full bg-surface border border-gray-800 rounded-2xl shadow-xl p-10">
        <h1 className="text-2xl font-bold text-accent mb-3">
          Welcome to Your Uploader
        </h1>
        <p className="text-gray-400 mb-6">
          A compact uploader app. Please sign up to create an account or login
          to continue.
        </p>

        <div className="flex gap-3 mb-8">
          <Link
            to="/login"
            className="flex-1 text-center py-2 border border-gray-700 rounded hover:bg-gray-800 transition text-gray-300"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="flex-1 text-center py-2 bg-accent rounded hover:bg-green-500 text-white transition"
          >
            Sign up
          </Link>
        </div>

        <hr className="border-gray-700 my-6" />

        <div>
          <h3 className="text-lg font-semibold text-accent mb-2">About</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            This is the landing page. Once you login, you’ll see the uploader
            interface with the sidebar, uploads list, and file progress system.
          </p>
        </div>
      </div>
    </div>
  );
}
