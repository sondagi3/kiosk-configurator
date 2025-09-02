// src/components/QuoteApprovals.jsx
import React, { useState } from "react";
import { Calculator, CheckCircle2, Stamp, Printer } from "lucide-react";
import { Section, Field, Text } from "./Inputs.jsx";
import { estimateQuoteFromAlibaba } from "../lib/pricing.js";
import { printQuote } from "../lib/print.js";
import { nowISO } from "../lib/utils.js";
import { round2 } from "../lib/pricing.js";

export default function QuoteApprovals({ order, setOrder, admin }) {
  const [busy, setBusy] = useState(false);
  const q = order.quote;

  const canQuote = !!order.client?.clientName;

  async function generateQuote() {
    setBusy(true);
    try {
      // prefer Alibaba spec; fall back to legacy
      const alibaba = order.spec?.alibaba;
      const quote = estimateQuoteFromAlibaba(alibaba, admin.alibaba);
      setOrder((o) => ({
        ...o,
        quote,
        status: "QUOTE_SENT",
        updatedAt: nowISO(),
        audit: [
          ...(o.audit || []),
          { at: nowISO(), by: "system", action: "QUOTE_GENERATED", detail: `Total ${quote.currency} ${quote.total}` },
        ],
      }));
    } finally {
      setBusy(false);
    }
  }

  function clientAccept() {
    const who = order.client?.clientName || "Client";
    setOrder((o) => ({
      ...o,
      status: "CLIENT_ACCEPTED",
      clientAcceptance: { acceptedBy: who, acceptedAt: nowISO() },
      updatedAt: nowISO(),
      audit: [...(o.audit || []), { at: nowISO(), by: who, action: "CLIENT_ACCEPTED", detail: "" }],
    }));
  }

  function ceoApprove(name) {
    if (!name) return;
    setOrder((o) => ({
      ...o,
      status: "CEO_APPROVED",
      ceoApproval: { approvedBy: name, approvedAt: nowISO(), comment: "" },
      updatedAt: nowISO(),
      audit: [...(o.audit || []), { at: nowISO(), by: name, action: "CEO_APPROVED", detail: "" }],
    }));
  }

  return (
    <Section title="Quote & Approvals" icon={<Calculator className="h-6 w-6 text-gray-800" />}>
      <div className="md:col-span-2 flex flex-wrap items-center gap-2">
        <button
          disabled={!canQuote || busy}
          onClick={generateQuote}
          className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-brand-700"
        >
          Generate Quote
        </button>

        <button
          disabled={!q}
          onClick={() => printQuote({ ...order }, admin)}
          className="inline-flex items-center gap-2 rounded-lg border border-brand-600 px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-50"
        >
          <Printer className="h-4 w-4" /> Print Quote
        </button>

        <button
          disabled={!q}
          onClick={clientAccept}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          <CheckCircle2 className="h-4 w-4" /> Mark Client Accepted
        </button>
      </div>

      {/* CEO Approval */}
      <Field label="CEO Approval (enter name to approve)">
        <div className="flex gap-2">
          <Text value={order.ceoApproval?.approvedBy || ""} onChange={(v) =>
            setOrder((o) => ({ ...o, ceoApproval: { ...(o.ceoApproval || {}), approvedBy: v }, updatedAt: nowISO() }))
          } placeholder="CEO Name" />
          <button
            onClick={() => ceoApprove(order.ceoApproval?.approvedBy)}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Stamp className="h-4 w-4" /> CEO Approve
          </button>
        </div>
      </Field>

      {/* Quote summary */}
      <div className="md:col-span-2 rounded-xl border border-gray-200 p-3">
        <div className="font-semibold mb-1">Current Quote</div>
        {q ? (
          <div className="text-sm text-gray-800">
            <div>Items: {q.lineItems.length}</div>
            <div>Subtotal: {fmt(q.subtotal, q.currency)} | Shipping: {fmt(q.shipping, q.currency)} | Tax: {fmt(q.tax, q.currency)}</div>
            <div className="font-semibold">Total: {fmt(q.total, q.currency)}</div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">No quote generated yet.</div>
        )}
      </div>
    </Section>
  );
}

function fmt(n, cur = "USD") {
  try { return new Intl.NumberFormat(undefined, { style: "currency", currency: cur }).format(Number(n || 0)); }
  catch { return `$${Number(n || 0).toFixed(2)}`; }
}
