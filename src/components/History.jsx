import React, { useEffect, useState } from "react";
import { listDocuments, getDocument, deleteDocument } from "../auth/documentApi";

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function StatusBadge({ status }) {
  let colorClass = "bg-gray-800 text-gray-300";
  if (status === "UPLOADED") colorClass = "bg-blue-900 text-blue-200";
  if (status === "PROCESSING") colorClass = "bg-yellow-900 text-yellow-200";
  if (status === "PROCESSED") colorClass = "bg-green-900 text-green-200";
  if (status === "FAILED") colorClass = "bg-red-900 text-red-200";

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium border border-white/10 ${colorClass}`}
    >
      {status}
    </span>
  );
}

export default function History() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  const fetchDocs = async (p) => {
    setLoading(true);
    try {
      const data = await listDocuments(p, pageSize);
      setDocs(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error("Failed to list docs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs(page);
  }, [page]);

  const handleDownload = async (docId) => {
    try {
      const meta = await getDocument(docId, true);
      if (meta.presignedGetUrl) {
        window.open(meta.presignedGetUrl, "_blank");
      } else {
        alert("Download URL not available (file might be processing or archived)");
      }
    } catch (e) {
      console.error("Download failed", e);
      alert("Failed to get download link");
    }
  };

  const handleDelete = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;
    try {
      await deleteDocument(docId);
      // Refresh list after delete
      fetchDocs(page);
    } catch (e) {
      console.error("Delete failed", e);
      alert("Failed to delete document");
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl text-accent font-semibold">My Documents</h2>
        <button
          onClick={() => fetchDocs(page)}
          className="text-xs text-gray-400 hover:text-white"
        >
          Refresh
        </button>
      </div>

      <div className="bg-[#0d0d0d] border border-gray-800 rounded overflow-hidden">
        {loading && docs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : docs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No documents found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="bg-gray-900 text-gray-200 uppercase text-xs">
                <tr>
                  <th className="px-6 py-3">Filename</th>
                  <th className="px-6 py-3">Size</th>
                  <th className="px-6 py-3">Uploaded</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {docs.map((doc) => (
                  <tr key={doc.documentId} className="hover:bg-gray-900/50">
                    <td className="px-6 py-4 font-medium text-white">
                      {doc.filename}
                    </td>
                    <td className="px-6 py-4">{formatBytes(doc.size)}</td>
                    <td className="px-6 py-4">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-3">
                      <button
                        onClick={() => handleDownload(doc.documentId)}
                        className="text-accent hover:underline text-xs"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => handleDelete(doc.documentId)}
                        className="text-red-400 hover:text-red-300 hover:underline text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-end gap-2">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="px-3 py-1 rounded bg-gray-800 text-gray-300 disabled:opacity-50 hover:bg-gray-700"
          >
            Prev
          </button>
          <span className="px-2 py-1 text-gray-500">
            Page {page + 1} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 rounded bg-gray-800 text-gray-300 disabled:opacity-50 hover:bg-gray-700"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}