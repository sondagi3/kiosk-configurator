// src/components/DebugLog.jsx
import React from "react";
import { getLog, clearLog } from "../lib/log.js";

export default function DebugLog({ open, onClose }) {
  const [rows, setRows] = React.useState([]);

  React.useEffect(() => {
    if (open) setRows(getLog().slice().reverse());
  }, [open]);

  if (!open) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(rows, null, 2));
      alert("Copied log to clipboard.");
    } catch {
      alert("Copy failed.");
    }
  };

  const clearAll = () => {
    clearLog();
    setRows([]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 p-4" onClick={onClose}>
      <div
        className="mx-auto max-w-3xl rounded-xl bg-white p-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Debug Log</h2>
          <div className="flex items-center gap-2">
            <button onClick={copy} className="rounded border px-3 py-1.5 text-sm">Copy</button>
            <button onClick={clearAll} className="rounded border px-3 py-1.5 text-sm">Clear</button>
            <button onClick={onClose} className="rounded bg-brand-600 px-3 py-1.5 text-sm text-white">Close</button>
          </div>
        </div>
        <div className="max-h-[60vh] overflow-auto rounded border bg-gray-50 p-2 text-xs">
          {rows.length === 0 ? (
            <div className="p-2 text-gray-500">No log entries yet.</div>
          ) : (
            rows.map((r, i) => (
              <div key={i} className="mb-2 rounded border bg-white p-2">
                <div className="mb-1 text-[11px] text-gray-500">{r.at}</div>
                <div className="font-semibold">{r.type?.toUpperCase()} — {r.msg}</div>
                {r.detail ? (
                  <pre className="whitespace-pre-wrap break-words text-[11px] text-gray-800">
                    {typeof r.detail === "string" ? r.detail : JSON.stringify(r.detail, null, 2)}
                  </pre>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
