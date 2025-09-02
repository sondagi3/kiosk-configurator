// src/components/StatusRibbon.jsx
import React from "react";

export default function StatusRibbon({ order }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold">Order ID:</span> {order.orderId}
        <span className="mx-2 h-4 w-px bg-gray-300" />
        <span className="font-semibold">Status:</span>{" "}
        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">{order.status}</span>
        <span className="mx-2 h-4 w-px bg-gray-300" />
        <span className="text-gray-500">Updated: {new Date(order.updatedAt).toLocaleString()}</span>
      </div>
    </div>
  );
}
