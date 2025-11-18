// src/components/UploadItem.jsx
import React, { useEffect, useRef, useState } from "react";
import { createUploadIntent, completeUpload } from "../auth/documentApi";

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function UploadItem({ id, file, onRemove, onComplete }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("queued"); // queued | uploading | done | error | cancelled
  const [errorMsg, setErrorMsg] = useState(null);
  const xhrRef = useRef(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    uploadFlow();
    return () => {
      cancelledRef.current = true;
      if (xhrRef.current) xhrRef.current.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function uploadFlow() {
    setStatus("uploading");

    // 1) Create upload intent in backend
    let intent;
    try {
      intent = await createUploadIntent({
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        metadata: {}, // add any extra metadata if needed
      });
    } catch (err) {
      console.error("createUploadIntent failed", err);
      setStatus("error");
      setErrorMsg("Failed to create upload intent");
      return;
    }

    if (!intent || !intent.presignedUrl) {
      setStatus("error");
      setErrorMsg("No presigned URL returned by server");
      return;
    }

    const presignedUrl = intent.presignedUrl;
    const documentId = intent.documentId;

    // 2) Upload file directly to presigned URL using XMLHttpRequest (to track progress)
    try {
      await putFileToPresignedUrl(presignedUrl, file, (pct) => {
        setProgress(pct);
      });
    } catch (err) {
      console.error("upload to presigned url failed", err);
      setStatus("error");
      setErrorMsg("Upload to storage failed");
      return;
    }

    // 3) Tell backend the upload is complete (idempotent)
    try {
      const resp = await completeUpload(documentId, { size: file.size });
      setProgress(100);
      setStatus("done");
      onComplete && onComplete(resp);
    } catch (err) {
      console.error("completeUpload failed", err);
      setStatus("error");
      setErrorMsg("Failed to finalize upload");
      return;
    }
  }

  // helper: PUT file to presigned URL using XHR for progress and ability to abort
  function putFileToPresignedUrl(url, file, onProgress) {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;

      xhr.open("PUT", url, true);

      // If presign was generated requiring a specific content-type, set it
      if (file.type) {
        xhr.setRequestHeader("Content-Type", file.type);
      }

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent =
            Math.round((event.loaded / event.total) * 100 * 10) / 10;
          onProgress(percent);
        }
      };

      xhr.onload = () => {
        // MinIO/S3 typically returns 200 or 201 — treat 2xx as success
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(xhr.responseText);
        } else {
          reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => reject(new Error("Network error"));
      xhr.onabort = () => reject(new Error("Upload aborted"));

      // Send file bytes directly
      xhr.send(file);
    });
  }

  const handleCancel = () => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      setStatus("cancelled");
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
