// src/components/QuoteApprovals.jsx
import React from "react";
import { BadgeCheck } from "lucide-react";
import { Section, Field, Text } from "./Inputs.jsx";

export default function QuoteApprovals({
  order,
  canAdvanceToQuote,
  canAccept,
  canCEOApprove,
  onGenerateQuote,
  onClientAccept,
  onCEOApprove,
  setOrder,
}) {
  return (
    <Section title="Quote & Approvals" icon={<BadgeCheck className="h-6 w-6 text-gray-800" />}>
      <Field label="Generate Quote" hint="Uses vendor estimator if available, else local heuristic.">
        <button
          type="button"
          disabled={!canAdvanceToQuote}
          onClick={onGenerateQuote}
          className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Generate Quote
        </button>
      </Field>

      <div className="md:col-span-2">
        <div className="rounded-lg border bg-gray-50 p-3 text-sm">
          {order.quote ? <pre className="whitespace-pre-wrap">{JSON.stringify(order.quote, null, 2)}</pre> : "No quote yet."}
        </div>
      </div>

      <Field label="Client Acceptance">
        <button
          type="button"
          disabled={!canAccept}
          onClick={onClientAccept}
          className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow hover:bg-gray-50 disabled:opacity-50"
        >
          Mark Client Accepted
        </button>
        {order.clientAcceptance ? (
          <p className="mt-2 text-xs text-gray-600">
            Accepted by {order.clientAcceptance.acceptedBy} at {new Date(order.clientAcceptance.acceptedAt).toLocaleString()}
          </p>
        ) : null}
      </Field>

      <Field label="CEO Approval">
        <div className="flex gap-2">
          <Text
            placeholder="CEO name"
            value={order.ceoApproval?.approvedBy}
            onChange={(v) =>
              setOrder((o) => ({ ...o, ceoApproval: { approvedBy: v, approvedAt: o.ceoApproval?.approvedAt || "", comment: o.ceoApproval?.comment || "" } }))
            }
          />
          <Text
            placeholder="Approval note (optional)"
            value={order.ceoApproval?.comment}
            onChange={(v) =>
              setOrder((o) => ({ ...o, ceoApproval: { approvedBy: o.ceoApproval?.approvedBy || "", approvedAt: o.ceoApproval?.approvedAt || "", comment: v } }))
            }
          />
          <button
            type="button"
            disabled={!canCEOApprove}
            onClick={() => onCEOApprove(order.ceoApproval?.approvedBy || "CEO", order.ceoApproval?.comment || "")}
            className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow hover:bg-gray-50 disabled:opacity-50"
          >
            CEO Approve
          </button>
        </div>
        {order.status === "CEO_APPROVED" ? (
          <p className="mt-2 text-xs text-gray-600">
            Approved by {order.ceoApproval?.approvedBy} at {new Date(order.ceoApproval?.approvedAt || Date.now()).toLocaleString()}{" "}
            {order.ceoApproval?.comment ? `— ${order.ceoApproval?.comment}` : ""}
          </p>
        ) : null}
      </Field>
    </Section>
  );
}
