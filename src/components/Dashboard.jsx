import React, { useEffect, useState } from "react";
import { listDocuments, searchDocuments } from "../auth/documentApi";
import { useAuth } from "../auth/AuthProvider";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, processing: 0, recent: [] });
  const [loading, setLoading] = useState(true);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await listDocuments(0, 5);
      setStats({
        total: data.total,
        processing:
          data.items?.filter(
            (i) => i.status === "PROCESSING" || i.status === "UPLOADING"
          ).length || 0,
        recent: data.items || [],
      });
    } catch (e) {
      console.error("Dashboard load failed", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    try {
      // In a real app, backend extracts ID from token.
      // Here we might need to pass it explicitly if the Search Controller demands it.
      // We'll pass user.sub (subject/email) or user.id depending on your auth model.
      const ownerId = user?.sub || "unknown";

      const data = await searchDocuments(searchQuery);
      // Adjust based on your SearchController response structure (Page<DocumentIndex>)
      setSearchResults(data.content || []);
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl text-accent font-semibold">Dashboard</h2>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-white focus:outline-none focus:border-accent w-64"
          />
          {searchResults && (
            <button
              type="button"
              onClick={clearSearch}
              className="px-3 py-2 bg-gray-800 text-gray-400 rounded-lg hover:text-white"
            >
              ✕
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-green-500 text-sm font-medium"
          >
            Search
          </button>
        </form>
      </div>

      {/* Search Results Overlay or Section */}
      {searchResults && (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 mb-6">
          <h3 className="text-lg text-white mb-3">
            Search Results ({searchResults.length})
          </h3>
          {searchResults.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No documents found matching "{searchQuery}"
            </p>
          ) : (
            <div className="space-y-3">
              {searchResults.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 bg-black/40 rounded border border-gray-800"
                >
                  <div className="flex justify-between">
                    <span className="text-accent font-medium">
                      {doc.filename}
                    </span>
                    <span className="text-xs text-gray-500">
                      {doc.category}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                    {doc.summary || "No summary available."}
                  </p>
                  {/* Highlight keywords if available */}
                  {doc.keywords && (
                    <div className="flex gap-2 mt-2">
                      {doc.keywords.map((k) => (
                        <span
                          key={k}
                          className="text-xs bg-gray-800 px-2 py-0.5 rounded text-gray-300"
                        >
                          #{k}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Standard Dashboard (Hide if searching? Or keep visible? Let's keep visible) */}
      {!searchResults && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-5 bg-gray-900 border border-gray-800 rounded-lg shadow-sm">
              <div className="text-xs text-gray-400 uppercase tracking-wide">
                Total Documents
              </div>
              <div className="text-3xl text-white font-bold mt-2">
                {loading ? "-" : stats.total}
              </div>
            </div>

            <div className="p-5 bg-gray-900 border border-gray-800 rounded-lg shadow-sm">
              <div className="text-xs text-gray-400 uppercase tracking-wide">
                Processing Active
              </div>
              <div className="text-3xl text-yellow-400 font-bold mt-2">
                {loading ? "-" : stats.processing}
                <span className="text-xs font-normal text-gray-500 ml-2">
                  (in recent)
                </span>
              </div>
            </div>

            <div className="p-5 bg-gray-900 border border-gray-800 rounded-lg shadow-sm">
              <div className="text-xs text-gray-400 uppercase tracking-wide">
                System Status
              </div>
              <div className="text-3xl text-green-400 font-bold mt-2">OK</div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-[#0d0d0d] border border-gray-800 rounded-lg p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg text-gray-200 font-medium">
                Recent Uploads
              </h3>
            </div>

            {loading ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : stats.recent.length === 0 ? (
              <div className="text-sm text-gray-500">No recent activity.</div>
            ) : (
              <div className="space-y-3">
                {stats.recent.map((doc) => (
                  <div
                    key={doc.documentId}
                    className="flex justify-between items-center p-3 bg-gray-900/50 rounded hover:bg-gray-800 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center text-lg">
                        📄
                      </div>
                      <div>
                        <div className="text-sm text-gray-200 font-medium">
                          {doc.filename}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(doc.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-400 border border-gray-700">
                        {doc.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
