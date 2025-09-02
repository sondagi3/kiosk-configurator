// src/components/Inputs.jsx
import React from "react";
import { ChevronDown } from "lucide-react";

export const Section = ({ title, icon, children }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
    <div className="mb-3 flex items-center gap-2">
      {icon}
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    </div>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
  </div>
);

export const Field = ({ label, children, hint }) => (
  <label className="block">
    <div className="mb-1 text-sm font-medium text-gray-700">{label}</div>
    {children}
    {hint ? <div className="mt-1 text-xs text-gray-500">{hint}</div> : null}
  </label>
);

export const Text = ({ value, onChange, type = "text", placeholder, list }) => (
  <input
    value={value ?? ""}
    onChange={(e) => onChange(e.target.value)}
    type={type}
    placeholder={placeholder}
    list={list}
    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
  />
);

export const Select = ({ value, onChange, options }) => (
  <div className="relative">
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-2.5 pr-10 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
    <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-5 w-5 text-gray-500" />
  </div>
);
