// src/components/ClientIntake.jsx
import React from "react";
import { Section, Field, Text } from "./Inputs.jsx";
import { nowISO } from "../lib/utils.js";

export default function ClientIntake({ order, setOrder, pastClients = [] }) {
  const c = order.client || {};
  const up = (patch) => setOrder((o) => ({ ...o, client: { ...o.client, ...patch }, updatedAt: nowISO() }));

  function saveClientName(name) {
    const key = "bm3_client_names";
    const list = JSON.parse(localStorage.getItem(key) || "[]");
    if (name && !list.includes(name)) {
      list.push(name);
      localStorage.setItem(key, JSON.stringify(list));
    }
  }

  function exportClientsCSV() {
    const key = "bm3_client_names";
    const list = JSON.parse(localStorage.getItem(key) || "[]");
    const csv = "Client Name\n" + list.map((n) => `"${(n || "").replace(/"/g, '""')}"`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "brand-m3dia-clients.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  // datalist id
  const listId = "past-clients";

  return (
    <Section title="Client Intake" icon={<span className="inline-block h-6 w-6 rounded bg-brand-600" />}>
      <datalist id={listId}>
        {pastClients.map((n) => <option key={n} value={n} />)}
      </datalist>

      <Field label="Client Name">
        <Text value={c.clientName || ""} onChange={(v) => up({ clientName: v })} placeholder="e.g., Acme Corp" list={listId} />
      </Field>
      <Field label="Company">
        <Text value={c.company || ""} onChange={(v) => up({ company: v })} placeholder="Legal company name" />
      </Field>
      <Field label="Email">
        <Text value={c.email || ""} onChange={(v) => up({ email: v })} placeholder="name@company.com" />
      </Field>
      <Field label="Phone">
        <Text value={c.phone || ""} onChange={(v) => up({ phone: v })} placeholder="+1 ..." />
      </Field>
      <Field label="Billing Address">
        <Text value={c.billingAddress || ""} onChange={(v) => up({ billingAddress: v })} placeholder="Street, City, State, ZIP, Country" />
      </Field>
      <Field label="Shipping Address">
        <Text value={c.shippingAddress || ""} onChange={(v) => up({ shippingAddress: v })} placeholder="Street, City, State, ZIP, Country" />
      </Field>
      <Field label="Project Name">
        <Text value={c.projectName || ""} onChange={(v) => up({ projectName: v })} placeholder="e.g., Lobby Wayfinding" />
      </Field>
      <Field label="Notes (optional)">
        <Text value={c.notes || ""} onChange={(v) => up({ notes: v })} placeholder="Special requirements, deadlines…" />
      </Field>

      <div className="md:col-span-2 flex flex-wrap items-center gap-2">
        <button
          onClick={() => saveClientName(order.client?.clientName)}
          className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Save Client Name
        </button>
        <button
          onClick={exportClientsCSV}
          className="rounded-lg border border-brand-600 px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
        >
          Export Clients CSV
        </button>
      </div>
    </Section>
  );
}
