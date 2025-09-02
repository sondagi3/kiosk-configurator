// src/lib/normalize.js
import { clampSpecToAdmin, defaultSpecFromAdmin } from "./admin.js";
import { nowISO } from "./utils.js";

export function normalizeOrderShape(order, admin) {
  const o = { ...(order || {}) };

  // ids & timestamps
  o.orderId ||= `ORD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  o.createdAt ||= nowISO();
  o.updatedAt ||= nowISO();

  // basic objects
  o.status ||= "INTAKE";
  o.client ||= {};
  o.payment ||= { method: "Credit Card", cardNumber: "", expiry: "", cvv: "", poNumber: "" };

  // spec (ensure nested alibaba exists via clamp)
  o.spec = clampSafely(o.spec, admin);

  // quote
  if (o.quote == null || typeof o.quote !== "object") {
    o.quote = null;
  } else {
    o.quote.currency ||= "USD";
    o.quote.lineItems = Array.isArray(o.quote.lineItems) ? o.quote.lineItems : [];
    o.quote.subtotal = num(o.quote.subtotal);
    o.quote.shipping = num(o.quote.shipping);
    o.quote.tax = num(o.quote.tax);
    o.quote.total = num(o.quote.total);
    o.quote.notes = Array.isArray(o.quote.notes) ? o.quote.notes : [];
  }

  // audit
  if (!Array.isArray(o.audit)) o.audit = [];
  if (o.audit.length === 0) {
    o.audit.push({ at: nowISO(), by: "system", action: "ORDER_NORMALIZED", detail: "" });
  }
  return o;

  function clampSafely(spec, adminObj) {
    try {
      const base = spec || defaultSpecFromAdmin(adminObj);
      return clampSpecToAdmin(base, adminObj);
    } catch {
      return defaultSpecFromAdmin(adminObj);
    }
  }
  function num(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
    }
}
