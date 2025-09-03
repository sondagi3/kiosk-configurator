// src/components/AdminAdvancedEditor.jsx
import React, { useEffect, useRef, useState } from "react";
import { Save, X, Clipboard, Upload, Download as DownloadIcon, RotateCw, CheckCircle2, AlertTriangle } from "lucide-react";
import { DEFAULT_ADMIN } from "../lib/admin.js";

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
function deepMerge(target, source) {
  const out = Array.isArray(target) ? [...target] : { ...target };
  if (Array.isArray(out) || Array.isArray(source)) return source; // arrays: replace
  for (const [k, v] of Object.entries(source || {})) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      out[k] = deepMerge(out[k] ?? {}, v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

export default function AdminAdvancedEditor({ open, onClose, admin, setAdmin }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [valid, setValid] = useState(true);
  const [dirty, setDirty] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (open) {
      const pretty = JSON.stringify(admin ?? DEFAULT_ADMIN, null, 2);
      setText(pretty);
      setError("");
      setValid(true);
      setDirty(false);
    }
  }, [open, admin]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSave();
      }
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, text]);

  function handleValidate() {
    try {
      JSON.parse(text);
      setError("");
      setValid(true);
      return true;
    } catch (e) {
      setError(String(e.message || e));
      setValid(false);
      return false;
    }
  }
  function handleFormat() {
    try {
      const obj = JSON.parse(text);
      setText(JSON.stringify(obj, null, 2));
      setError("");
      setValid(true);
    } catch (e) {
      setError(String(e.message || e));
      setValid(false);
    }
  }
  function handleSave() {
    if (!handleValidate()) return;
    const parsed = JSON.parse(text);
    const merged = deepMerge(deepClone(DEFAULT_ADMIN), parsed); // keep defaults for missing keys
    setAdmin(merged);
    setDirty(false);
    onClose?.();
  }
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  }
  function handleDownload() {
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "admin-config.json";
    a.click();
    URL.revokeObjectURL(url);
  }
  function handleUpload() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async () => {
      const f = input.files?.[0];
      if (!f) return;
      const t = await f.text();
      setText(t);
      setDirty(true);
    };
    input.click();
  }
  function handleReset() {
    if (!confirm("Reset Admin to DEFAULTS? This will overwrite current settings.")) return;
    setText(JSON.stringify(DEFAULT_ADMIN, null, 2));
    setDirty(true);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-4xl rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-gray-800" />
            <h2 className="text-lg font-semibold">Advanced JSON Editor (Admin)</h2>
          </div>
          <button onClick={onClose} className="rounded-lg px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100">
            <X className="mr-1 inline h-4 w-4" />
            Close
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 border-b bg-gray-50 px-4 py-2">
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={handleValidate} className="rounded border px-2 py-1 text-xs hover:bg-gray-100">
              Validate
            </button>
            <button onClick={handleFormat} className="rounded border px-2 py-1 text-xs hover:bg-gray-100">
              <RotateCw className="mr-1 inline h-3.5 w-3.5" />
              Format
            </button>
            <button onClick={handleCopy} className="rounded border px-2 py-1 text-xs hover:bg-gray-100">
              <Clipboard className="mr-1 inline h-3.5 w-3.5" />
              Copy
            </button>
            <button onClick={handleDownload} className="rounded border px-2 py-1 text-xs hover:bg-gray-100">
              <DownloadIcon className="mr-1 inline h-3.5 w-3.5" />
              Download
            </button>
            <button onClick={handleUpload} className="rounded border px-2 py-1 text-xs hover:bg-gray-100">
              <Upload className="mr-1 inline h-3.5 w-3.5" />
              Import
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="rounded border border-red-300 bg-red-50 px-2 py-1 text-xs text-red-700 hover:bg-red-100"
              title="Reset to DEFAULT_ADMIN"
            >
              <AlertTriangle className="mr-1 inline h-3.5 w-3.5" />
              Reset to Defaults
            </button>
            <button
              onClick={handleSave}
              className="rounded bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
              title="Ctrl/Cmd+S"
            >
              <Save className="mr-1 inline h-3.5 w-3.5" />
              Save & Apply
            </button>
          </div>
        </div>

        <div className="p-3">
          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); setDirty(true); }}
            className="h-[55vh] w-full resize-none rounded-xl border border-gray-300 bg-white p-3 font-mono text-xs leading-5"
            spellCheck={false}
          />
          {!valid && (
            <div className="mt-2 rounded-lg border border-amber-300 bg-amber-50 p-2 text-xs text-amber-800">
              JSON Error: {error}
            </div>
          )}
          {dirty && valid && (
            <div className="mt-2 text-xs text-gray-500">
              Changes not saved yet. Press <kbd>Ctrl/Cmd+S</kbd> or click <strong>Save & Apply</strong>.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
