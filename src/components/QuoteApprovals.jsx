import React, { useMemo, useState, useEffect } from "react";
import { Calculator, CheckCircle2, Stamp, Printer, User, DollarSign } from "lucide-react";
import { Section, Field, Text } from "./Inputs.jsx";
import { estimateQuoteFromAlibaba } from "../lib/pricing.js";
import { printQuote } from "../lib/print.js";
import { nowISO } from "../lib/utils.js";
import { logInfo } from "../lib/log.js";

export default function QuoteApprovals({ order, setOrder, admin }) {
  const [busy, setBusy] = useState(false);
  const q = order?.quote || null;

  // Gate on trimmed client name
  const clientName = useMemo(() => String(order?.client?.clientName ?? ""), [order?.client?.clientName]);
  const clientNameReady = clientName.trim().length > 0;
  const canQuote = clientNameReady && !busy;

  useEffect(() => {
    logInfo("QuoteApprovals: gating state", {
      clientName,
      clientNameReady,
      busy,
      canQuote,
    });
  }, [clientName, clientNameReady, busy, canQuote]);

  async function generateQuote() {
    if (!canQuote) return;
    setBusy(true);
    try {
      const alibaba = order?.spec?.alibaba;
      const quote = estimateQuoteFromAlibaba(alibaba, admin?.alibaba);
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
    const who = order?.client?.clientName?.trim() || "Client";
    setOrder((o) => ({
      ...o,
      status: "CLIENT_ACCEPTED",
      clientAcceptance: { acceptedBy: who, acceptedAt: nowISO() },
      updatedAt: nowISO(),
      audit: [...(o.audit || []), { at: nowISO(), by: who, action: "CLIENT_ACCEPTED", detail: "" }],
    }));
  }

  function ceoApprove(name) {
    const n = String(name || "").trim();
    if (!n) return;
    setOrder((o) => ({
      ...o,
      status: "CEO_APPROVED",
      ceoApproval: { approvedBy: n, approvedAt: nowISO(), comment: "" },
      updatedAt: nowISO(),
      audit: [...(o.audit || []), { at: nowISO(), by: n, action: "CEO_APPROVED", detail: "" }],
    }));
  }

  return (
    <Section title="Quote & Approvals" icon={<Calculator className="h-6 w-6 text-gray-800" />}>
      {/* Detected client name */}
      <div className="md:col-span-2 -mt-1 mb-1 flex items-center gap-2 text-xs text-gray-600">
        <User className="h-3.5 w-3.5" />
        <span>
          Client:&nbsp;
          {clientNameReady ? (
            <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-emerald-700">{clientName.trim()}</span>
          ) : (
            <span className="rounded bg-amber-50 px-1.5 py-0.5 text-amber-700">
              (not set — fill “Client Name” in Client Intake)
            </span>
          )}
        </span>
      </div>

      {/* Buttons row */}
      <div className="md:col-span-2 flex flex-wrap items-center gap-2">
        {/* ✅ Generate Quote — this is the one you were missing */}
        <button
          disabled={!canQuote}
          onClick={generateQuote}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-brand-700"
          title={canQuote ? "Generate vendor-style line items & totals" : "Enter Client Name in Client Intake"}
          type="button"
        >
          <DollarSign className="h-4 w-4" />
          Generate Quote
        </button>

        <button
          disabled={!q}
          onClick={() => printQuote({ ...order }, admin)}
          className="inline-flex items-center gap-2 rounded-lg border border-brand-600 px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-50"
          title={q ? "Open printable quotation" : "Generate a quote first"}
          type="button"
        >
          <Printer className="h-4 w-4" /> Print Quote
        </button>

        <button
          disabled={!q}
          onClick={clientAccept}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          title={q ? "Record client acceptance" : "Generate a quote first"}
          type="button"
        >
          <CheckCircle2 className="h-4 w-4" /> Mark Client Accepted
        </button>
      </div>

      {/* If disabled, tell the user why */}
      {!clientNameReady && (
        <div className="md:col-span-2 mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
          To generate a quote, please enter the <strong>Client Name</strong> in the <strong>Client Intake</strong> section.
        </div>
      )}

      {/* CEO Approval */}
      <Field label="CEO Approval (enter name to approve)">
        <div className="flex gap-2">
          <Text
            value={order?.ceoApproval?.approvedBy || ""}
            onChange={(v) =>
              setOrder((o) => ({
                ...o,
                ceoApproval: { ...(o.ceoApproval || {}), approvedBy: v },
                updatedAt: nowISO(),
              }))
            }
            placeholder="CEO Name"
          />
          <button
            onClick={() => ceoApprove(order?.ceoApproval?.approvedBy)}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            type="button"
          >
            <Stamp className="h-4 w-4" /> CEO Approve
          </button>
        </div>
      </Field>

      {/* Quote summary */}
      <div className="md:col-span-2 rounded-xl border border-gray-200 p-3">
        <div className="mb-1 font-semibold">Current Quote</div>
        {q ? (
          <div className="text-sm text-gray-800">
            <div>Items: {Array.isArray(q.lineItems) ? q.lineItems.length : 0}</div>
            <div>
              Subtotal: {fmt(q.subtotal, q.currency)} | Shipping: {fmt(q.shipping, q.currency)} | Tax: {fmt(q.tax, q.currency)}
            </div>
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
