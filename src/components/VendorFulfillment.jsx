// src/components/VendorFulfillment.jsx
import React from "react";
import { Factory } from "lucide-react";
import { Section, Field, Text, Select } from "./Inputs.jsx";

export default function VendorFulfillment({ order, canPlaceVendor, onPlaceVendorOrder, onMarkFulfillment, setOrder }) {
  return (
    <Section title="Vendor Order & Fulfillment" icon={<Factory className="h-6 w-6 text-gray-800" />}>
      <Field label="Place Vendor Order" hint="Requires CEO approval.">
        <div className="flex flex-col gap-2 md:flex-row">
          <Select
            value={order.vendorOrder?.vendor || "Alibaba"}
            onChange={(v) => setOrder((o) => ({ ...o, vendorOrder: { ...(o.vendorOrder || {}), vendor: v } }))}
            options={["Alibaba", "VendorX", "VendorY"]}
          />
          <Text
            placeholder="PO Number"
            value={order.vendorOrder?.poNumber}
            onChange={(v) => setOrder((o) => ({ ...o, vendorOrder: { ...(o.vendorOrder || {}), poNumber: v } }))}
          />
          <Text
            placeholder="Vendor Link (URL)"
            value={order.vendorOrder?.link}
            onChange={(v) => setOrder((o) => ({ ...o, vendorOrder: { ...(o.vendorOrder || {}), link: v } }))}
          />
          <button
            type="button"
            disabled={!canPlaceVendor}
            onClick={() =>
              onPlaceVendorOrder({
                vendor: order.vendorOrder?.vendor || "Alibaba",
                poNumber: order.vendorOrder?.poNumber || "",
                link: order.vendorOrder?.link || "",
              })
            }
            className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow hover:bg-gray-50 disabled:opacity-50"
          >
            Mark Vendor Order Placed
          </button>
        </div>
        {order.vendorOrder?.orderedAt ? (
          <div className="mt-2 text-xs text-gray-600">Ordered {new Date(order.vendorOrder.orderedAt).toLocaleString()}</div>
        ) : null}
      </Field>

      <Field label="Fulfillment Updates">
        <div className="flex flex-col gap-2 md:flex-row">
          <Text
            placeholder="Tracking #"
            value={order.fulfillment?.tracking}
            onChange={(v) => setOrder((o) => ({ ...o, fulfillment: { ...(o.fulfillment || {}), tracking: v } }))}
          />
        </div>
        <div className="mt-2 flex flex-col gap-2 md:flex-row">
          <Text
            placeholder="Carrier"
            value={order.fulfillment?.carrier}
            onChange={(v) => setOrder((o) => ({ ...o, fulfillment: { ...(o.fulfillment || {}), carrier: v } }))}
          />
          <Text
            placeholder="ETA (ISO or text)"
            value={order.fulfillment?.eta}
            onChange={(v) => setOrder((o) => ({ ...o, fulfillment: { ...(o.fulfillment || {}), eta: v } }))}
          />
          <button
            type="button"
            onClick={() => onMarkFulfillment({})}
            className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow hover:bg-gray-50"
          >
            Save Fulfillment
          </button>
          <button
            type="button"
            onClick={() => onMarkFulfillment({ deliveredAt: new Date().toISOString() })}
            className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow hover:bg-gray-50"
          >
            Mark Delivered
          </button>
        </div>

        {order.fulfillment ? (
          <div className="mt-2 text-xs text-gray-600">
            <div>Tracking: {order.fulfillment.tracking || "-"}</div>
            <div>Carrier: {order.fulfillment.carrier || "-"}</div>
            <div>ETA: {order.fulfillment.eta || "-"}</div>
            <div>Delivered: {order.fulfillment.deliveredAt ? new Date(order.fulfillment.deliveredAt).toLocaleString() : "-"}</div>
          </div>
        ) : null}
      </Field>
    </Section>
  );
}
