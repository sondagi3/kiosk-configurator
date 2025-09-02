// src/components/AuditTrail.jsx
import React from "react";

export default function AuditTrail({ order }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <h2 className="mb-2 text-lg font-semibold text-gray-900">Audit Trail</h2>
      <div className="overflow-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-gray-600">
              <th className="py-1 pr-3">Time</th>
              <th className="py-1 pr-3">By</th>
              <th className="py-1 pr-3">Action</th>
              <th className="py-1 pr-3">Detail</th>
            </tr>
          </thead>
          <tbody>
            {(order.audit || []).map((a, i) => (
              <tr key={i} className="border-t">
                <td className="py-1 pr-3">{new Date(a.at).toLocaleString()}</td>
                <td className="py-1 pr-3">{a.by}</td>
                <td className="py-1 pr-3">{a.action}</td>
                <td className="py-1 pr-3">{a.detail || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
