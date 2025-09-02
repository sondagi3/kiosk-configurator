// src/components/StatusRibbon.jsx
import React from "react";

export default function StatusRibbon({ order }) {
  const status = order?.status || "INTAKE";
  const steps = [
    "INTAKE",
    "QUOTE_SENT",
    "CLIENT_ACCEPTED",
    "CEO_APPROVED",
    "VENDOR_ORDERED",
    "FULFILLED",
  ];
  const idx = Math.max(0, steps.indexOf(status));

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <div className="flex flex-wrap items-center gap-2">
        {steps.map((s, i) => {
          const active = i <= idx;
          return (
            <span
              key={s}
              className={
                "rounded-full px-2.5 py-1 text-xs " +
                (active ? "bg-red50 text-red700 border border-red600" : "bg-gray-100 text-gray-700 border border-gray-200")
              }
            >
              {s}
            </span>
          );
        })}
      </div>
      <div className="mt-2 text-xs text-gray-500">
        Audit records: {(order?.audit && Array.isArray(order.audit)) ? order.audit.length : 0}
      </div>
    </div>
  );
}
