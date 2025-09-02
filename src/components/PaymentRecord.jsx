// src/components/PaymentRecord.jsx
import React from "react";
import { CreditCard } from "lucide-react";
import { Section, Field, Text, Select } from "./Inputs.jsx";
import { nowISO } from "../lib/utils.js";

export default function PaymentRecord({ order, setOrder }) {
  return (
    <Section title="Payment (Record)" icon={<CreditCard className="h-6 w-6 text-gray-800" />}>
      <Field label="Method">
        <Select
          value={order.payment.method}
          onChange={(v) => setOrder((o) => ({ ...o, payment: { ...o.payment, method: v }, updatedAt: nowISO() }))}
          options={["Credit Card", "Purchase Order"]}
        />
      </Field>
      {order.payment.method === "Credit Card" ? (
        <>
          <Field label="Card Number (last 4 OK)">
            <Text
              value={order.payment.cardNumber}
              onChange={(v) => setOrder((o) => ({ ...o, payment: { ...o.payment, cardNumber: v }, updatedAt: nowISO() }))}
              placeholder="•••• •••• •••• 1234"
            />
          </Field>
          <Field label="Expiry (MM/YY)">
            <Text
              value={order.payment.expiry}
              onChange={(v) => setOrder((o) => ({ ...o, payment: { ...o.payment, expiry: v }, updatedAt: nowISO() }))}
              placeholder="MM/YY"
            />
          </Field>
          <Field label="CVV (optional)">
            <Text
              value={order.payment.cvv}
              onChange={(v) => setOrder((o) => ({ ...o, payment: { ...o.payment, cvv: v }, updatedAt: nowISO() }))}
              placeholder="123"
            />
          </Field>
        </>
      ) : (
        <Field label="PO Number">
          <Text
            value={order.payment.poNumber}
            onChange={(v) => setOrder((o) => ({ ...o, payment: { ...o.payment, poNumber: v }, updatedAt: nowISO() }))}
            placeholder="PO-12345"
          />
        </Field>
      )}
    </Section>
  );
}
