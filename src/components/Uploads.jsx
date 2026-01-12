// /mnt/data/Uploads.jsx
import React, { useRef } from "react";
import UploadItem from "./UploadItem";

export default function Uploads({ queue, onAddFiles, onRemove, onComplete, onStart }) {
  const inputRef = useRef();

  return (
    <div className="flex flex-col h-full">
      {/* Top upload area */}
      <div className="mb-6">
        <p className="mb-2 text-green-300">Drag and drop PDF(s) here or click to select:</p>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            onAddFiles(e.dataTransfer.files);
          }}
          onClick={() => inputRef.current?.click()}
          className="border border-dashed border-gray-500 p-8 text-center cursor-pointer bg-gray-800 hover:bg-gray-700 transition"
        >
          <p className="text-gray-400">Drop your PDF(s) here or click to select</p>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            onAddFiles(e.target.files);
            e.target.value = null;
          }}
          multiple
        />
      </div>

      {/* Upload queue */}
      <div className="flex-1 overflow-auto">
        {queue.length === 0 ? (
          <div className="bg-[#0d0d0d] p-4 border border-gray-700">No files in queue.</div>
        ) : (
          <div className="space-y-3">
            {queue.map((item) => (
              <UploadItem
                key={item.id}
                id={item.id}
                file={item.file}
                idempotencyKey={item.idempotencyKey}
                started={!!item.started}
                status={item.status}             // <-- pass status down
                completedAt={item.completedAt}   // <-- optional: pass completedAt
                onStart={() => onStart(item.id)}
                onRemove={() => onRemove(item.id)}
                onComplete={(resp) => onComplete(item.id, resp)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
