// src/components/UploadItem.jsx
import React, { useEffect, useRef, useState } from "react";

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function UploadItem({
  id,
  file,
  onRemove,
  onComplete,
  uploadUrl,
}) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("queued"); // queued | uploading | done | error | cancelled
  const [errorMsg, setErrorMsg] = useState(null);
  const xhrRef = useRef(null);

  useEffect(() => {
    // start automatically
    uploadFile();
    // cleanup: abort if component unmounts
    return () => {
      if (xhrRef.current) {
        xhrRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uploadFile = () => {
    setStatus("uploading");
    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;

    xhr.open("POST", uploadUrl, true);

    // If your Spring Boot uses sessions/CSRF, handle CSRF token header here.

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent =
          Math.round((event.loaded / event.total) * 100 * 10) / 10;
        setProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        let resp = null;
        try {
          resp = JSON.parse(xhr.responseText);
        } catch (e) {
          resp = xhr.responseText;
        }
        setProgress(100);
        setStatus("done");
        onComplete(resp);
        // keep item visible (caller may move to history)
      } else {
        setStatus("error");
        setErrorMsg(`Upload failed: ${xhr.status} ${xhr.statusText}`);
      }
    };

    xhr.onerror = () => {
      setStatus("error");
      setErrorMsg("Network error during upload.");
    };

    xhr.onabort = () => {
      setStatus("cancelled");
    };

    const form = new FormData();
    // The server expects 'file' param (adjust if backend expects a different name)
    form.append("file", file, file.name);

    // Optional: append metadata fields
    // form.append('cnrNumber', '123');

    xhr.send(form);
  };

  const handleCancel = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      // keep showing cancelled then remove after a moment
      setTimeout(() => onRemove(), 500);
    } else {
      onRemove();
    }
  };

  const handleRemove = () => onRemove();

  return (
    <div className="bg-[#0d0d0d] p-3 border border-gray-700 rounded">
      <div className="flex justify-between items-start">
        <div>
          <div className="text-sm text-green-300">{file.name}</div>
          <div className="text-xs text-gray-400">{formatSize(file.size)}</div>
        </div>

        <div className="text-xs">
          {status === "queued" && <span className="text-gray-300">Queued</span>}
          {status === "uploading" && (
            <span className="text-yellow-300">Uploading…</span>
          )}
          {status === "done" && <span className="text-green-400">Done ✓</span>}
          {status === "error" && <span className="text-red-400">Error</span>}
          {status === "cancelled" && (
            <span className="text-red-400">Cancelled</span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3">
        <div className="w-full bg-gray-900 h-2 rounded overflow-hidden border border-gray-800">
          <div
            className="h-full rounded"
            style={{
              width: `${progress}%`,
              transition: "width 200ms linear",
              background: "linear-gradient(90deg,#10b981,#059669)",
            }}
          />
        </div>

        <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
          <div>{progress}%</div>
          <div>
            {status === "uploading" ? (
              <button
                onClick={handleCancel}
                className="text-xs px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700"
              >
                Cancel
              </button>
            ) : (
              <button
                onClick={handleRemove}
                className="text-xs px-2 py-0.5 rounded bg-gray-800 hover:bg-gray-700"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        {status === "error" && (
          <div className="mt-2 text-xs text-red-400">{errorMsg}</div>
        )}
      </div>
    </div>
  );
}
