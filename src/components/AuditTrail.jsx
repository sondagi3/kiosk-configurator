// src/components/AuditTrail.jsx
import React from "react";

export default function AuditTrail({ order }) {
  const rows = Array.isArray(order?.audit) ? order.audit : [];
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-2 text-lg font-semibold">Audit Trail</div>
      {rows.length === 0 ? (
        <div className="text-sm text-gray-500">No audit events yet.</div>
      ) : (
        <div className="divide-y">
          {rows.map((r, i) => (
            <div key={i} className="py-2 text-sm">
              <div className="text-gray-800">
                <strong>{r.action}</strong> <span className="text-gray-500">by {r.by || "system"}</span>
              </div>
              <div className="text-gray-500">{r.at}</div>
              {r.detail ? <div className="text-gray-700">{r.detail}</div> : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
