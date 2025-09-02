// src/components/ClientIntake.jsx
import React from "react";
import { Building2 } from "lucide-react";
import { Section, Field, Text } from "./Inputs.jsx";
import { nowISO } from "../lib/utils.js";

export default function ClientIntake({ order, setOrder, clientHistory, saveClientToHistory }) {
  return (
    <Section title="Client Intake" icon={<Building2 className="h-6 w-6 text-gray-800" />}>
      <datalist id="clientNames">
        {clientHistory.map((n) => (
          <option key={n} value={n} />
        ))}
      </datalist>

      <Field label="Client Name (required)">
        <div className="flex gap-2">
          <Text
            value={order.client.clientName}
            onChange={(v) => setOrder((o) => ({ ...o, client: { ...o.client, clientName: v }, updatedAt: nowISO() }))}
            list="clientNames"
            placeholder="Start typing to see past clients…"
          />
          <button
            type="button"
            onClick={() => saveClientToHistory(order.client.clientName)}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Save Name
          </button>
        </div>
      </Field>
      <Field label="Company">
        <Text value={order.client.company}
          onChange={(v) => setOrder((o) => ({ ...o, client: { ...o.client, company: v }, updatedAt: nowISO() }))} />
      </Field>
      <Field label="Email">
        <Text type="email" value={order.client.email}
          onChange={(v) => setOrder((o) => ({ ...o, client: { ...o.client, email: v }, updatedAt: nowISO() }))} />
      </Field>
      <Field label="Phone">
        <Text value={order.client.phone}
          onChange={(v) => setOrder((o) => ({ ...o, client: { ...o.client, phone: v }, updatedAt: nowISO() }))} />
      </Field>
      <Field label="Billing Address">
        <Text value={order.client.billingAddress}
          onChange={(v) => setOrder((o) => ({ ...o, client: { ...o.client, billingAddress: v }, updatedAt: nowISO() }))} />
      </Field>
      <Field label="Shipping Address">
        <Text value={order.client.shippingAddress}
          onChange={(v) => setOrder((o) => ({ ...o, client: { ...o.client, shippingAddress: v }, updatedAt: nowISO() }))} />
      </Field>
      <Field label="Project Name">
        <Text value={order.client.projectName}
          onChange={(v) => setOrder((o) => ({ ...o, client: { ...o.client, projectName: v }, updatedAt: nowISO() }))} />
      </Field>
      <Field label="Notes">
        <Text value={order.client.notes}
          onChange={(v) => setOrder((o) => ({ ...o, client: { ...o.client, notes: v }, updatedAt: nowISO() }))} />
      </Field>

      <div className="md:col-span-2">
        <div className="rounded-xl border bg-gray-50 p-3 text-xs text-gray-700">
          <div className="mb-1 font-semibold">Past Clients</div>
          <div className="flex flex-wrap gap-2">
            {clientHistory.length ? (
              clientHistory.slice(0, 12).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setOrder((o) => ({ ...o, client: { ...o.client, clientName: n }, updatedAt: nowISO() }))}
                  className="rounded-full border px-2.5 py-1 hover:bg-white"
                >
                  {n}
                </button>
              ))
            ) : (
              <span className="text-gray-500">No past clients yet.</span>
            )}
          </div>
        </div>
      </div>
    </Section>
  );
}
