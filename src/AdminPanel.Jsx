// src/components/AdminPanel.jsx
import React, { useState } from "react";
import { Settings, Plus, Trash2, Save, RefreshCcw, Upload, Download, X } from "lucide-react";

function Section({ title, children }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-base font-semibold text-gray-900">{title}</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <div className="mb-1 text-sm font-medium text-gray-700">{label}</div>
      {children}
      {hint ? <div className="mt-1 text-xs text-gray-500">{hint}</div> : null}
    </label>
  );
}

function Text({ value, onChange, type = "text", placeholder }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      type={type}
      placeholder={placeholder}
      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
    />
  );
}

function ArrayEditor({ label, items, onChange, placeholder = "Add item", hint }) {
  const [val, setVal] = useState("");
  const add = () => {
    const v = val.trim();
    if (!v) return;
    if (items.includes(v)) return;
    onChange([...items, v]);
    setVal("");
  };
  const remove = (idx) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2">
      <Field label={label} hint={hint}>
        <div className="flex gap-2">
          <input
            value={val}
            onChange={(e) => setVal(e.target.value)}
            placeholder={placeholder}
            className="flex-1 rounded-xl border border-gray-300 px-3 py-2"
          />
          <button
            type="button"
            onClick={add}
            className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      </Field>
      <div className="flex flex-wrap gap-2">
        {items.map((t, i) => (
          <span key={`${t}-${i}`} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs">
            {t}
            <button type="button" onClick={() => remove(i)} className="text-gray-500 hover:text-gray-700">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function AdminPanel({
  defaultAdmin,
  initialAdmin,
  onSave,              // (adminDraft) => void
  onApplyDefaults,     // (adminDraft) => void
  onClose,
}) {
  const [tab, setTab] = useState("org");
  const [admin, setAdmin] = useState(initialAdmin);

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(admin, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "brand-m3dia-admin-spec.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = async () => {
    const raw = prompt("Paste admin JSON to import:");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      setAdmin(parsed);
      alert("Imported. Review and Save.");
    } catch {
      alert("Invalid JSON");
    }
  };

  return (
    <div className="w-full max-w-5xl rounded-2xl bg-white shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Admin Panel</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAdmin(defaultAdmin)}
            className="inline-flex items-center gap-1 rounded-lg border px-
