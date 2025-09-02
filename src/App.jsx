import React, { useEffect, useMemo, useState } from "react";
import { Download, Printer, Settings, Plus } from "lucide-react";
import StatusRibbon from "./components/StatusRibbon.jsx";
import ClientIntake from "./components/ClientIntake.jsx";
import SpecForm from "./components/SpecForm.jsx";
import QuoteApprovals from "./components/QuoteApprovals.jsx";
import VendorFulfillment from "./components/VendorFulfillment.jsx";
import PaymentRecord from "./components/PaymentRecord.jsx";
import AuditTrail from "./components/AuditTrail.jsx";
import AdminPanel from "./components/AdminPanel.jsx";
import { DEFAULT_ADMIN, defaultSpecFromAdmin, clampSpecToAdmin } from "./lib/admin.js";
import { nowISO, uuid, save, load } from "./lib/utils.js";

const API_BASE = import.meta?.env?.VITE_API_BASE || "http://localhost:3001/api";

function blankOrder(admin) {
  return {
    orderId: uuid(),
    status: "INTAKE",
    createdAt: nowISO(),
    updatedAt: nowISO(),
    client: {
      clientName: "",
      company: "",
      email: "",
      phone: "",
      billingAddress: "",
      shippingAddress: "",
      projectName: "",
      notes: "",
    },
    spec: defaultSpecFromAdmin(admin),
    payment: { method: "Credit Card", cardNumber: "", expiry: "", cvv: "", poNumber: "" },
    quote: null,
    clientAcceptance: null,
    ceoApproval: null,
    vendorOrder: null,
    fulfillment: null,
    audit: [{ at: nowISO(), by: "system", action: "ORDER_CREATED" }],
  };
}

export default function App() {
  // Admin persisted
  const [admin, setAdmin] = useState(() => load("bm3_admin_spec", DEFAULT_ADMIN));
  useEffect(() => { save("bm3_admin_spec", admin); }, [admin]);

  // Order persisted
  const [order, setOrder] = useState(() => {
    const latestId = load("bm3_order_latest", null);
    if (latestId) {
      const restored = load(`bm3_order_${latestId}`, null);
      if (restored) return restored;
    }
    return blankOrder(admin);
  });
  useEffect(() => {
    save(`bm3_order_${order.orderId}`, order);
    save("bm3_order_latest", order.orderId);
  }, [order]);

  // Client history (names)
  const [clientHistory, setClientHistory] = useState(() => load("bm3_client_names", []));
  const saveClientToHistory = (name) => {
    const n = (name || "").trim();
    if (!n) return;
    const next = [n, ...clientHistory.filter((p) => p.toLowerCase() !== n.toLowerCase())].slice(0, 50);
    setClientHistory(next);
    save("bm3_client_names", next);
  };

  // Warnings
  const warnings = useMemo(() => {
    const s = order.spec, a = admin, c = order.client;
    const list = [];
    if (!a.display.allowedBrands.includes(s.displayBrand)) list.push(`Display brand must be one of: ${a.display.allowedBrands.join(", ")}`);
    if (+s.brightness < a.display.minBrightness) list.push(`Brightness below minimum (${a.display.minBrightness} nits).`);
    if (+s.contrast < a.display.minContrast) list.push(`Contrast below minimum (${a.display.minContrast}:1).`);
    if (s.hasTouch === "Yes" && !a.touch.types.includes(s.touchType)) list.push(`Touch type must be one of: ${a.touch.types.join(", ")}`);
    if (!(c.clientName || "").trim()) list.push("Client Name is required (corporate standard).");
    return list;
  }, [order.spec, order.client, admin]);

  // Estimation
  function localEstimate(spec) {
    const baseDisplay = /55/.test(spec.size) ? 650 : 520;
    const brandAdj = spec.displayBrand === "Samsung" ? 60 : 0;
    const resAdj = /UHD/.test(spec.resolution) ? 120 : 0;
    const touchAdj = spec.hasTouch === "Yes" ? 180 : 0;
    const pcAdj = /i7/.test(spec.cpuRam) ? 350 : 230;
    const audioAdj = spec.peripherals?.includes("speaker") ? 40 : 0;
    const camAdj = spec.peripherals?.includes("webcam") ? 90 : 0;
    const qrAdj = spec.peripherals?.includes("qr") ? 110 : 0;
    const badgeAdj = spec.badgePrinterModel ? 380 : 0;
    const subtotal = baseDisplay + brandAdj + resAdj + touchAdj + pcAdj + audioAdj + camAdj + qrAdj + badgeAdj;
    const shipping = 120;
    const tax = Math.round((subtotal * 0.085 + Number.EPSILON) * 100) / 100;
    const total = subtotal + shipping + tax;
    return { estimator: "local", currency: "USD", subtotal, shipping, tax, total };
  }
  async function vendorEstimate(spec) {
    try {
      const r = await fetch(`${API_BASE}/vendor/estimate`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ spec }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } catch { return null; }
  }
  async function generateQuote() {
    if (warnings.length) { alert("Please resolve warnings before generating a quote."); return; }
    const vendor = await vendorEstimate(order.spec);
    const base = vendor || localEstimate(order.spec);
    setOrder((o) => ({
      ...o, quote: base, status: "QUOTE_SENT", updatedAt: nowISO(),
      audit: [...o.audit, { at: nowISO(), by: "system", action: "QUOTE_GENERATED", detail: base.estimator }],
    }));
  }
  function clientAccept() {
    if (!order.quote) return alert("Generate a quote first.");
    const name = (order.client.clientName || "").trim();
    if (!name) return alert("Client name is required to accept.");
    saveClientToHistory(name);
    setOrder((o) => ({
      ...o, status: "CLIENT_ACCEPTED",
      clientAcceptance: { acceptedBy: name, acceptedAt: nowISO() },
      updatedAt: nowISO(),
      audit: [...o.audit, { at: nowISO(), by: name, action: "CLIENT_ACCEPTED" }],
    }));
  }
  function ceoApprove(ceoName, note) {
    if (order.status !== "CLIENT_ACCEPTED") return alert("Client must accept the quote before CEO approval.");
    const who = (ceoName || "CEO").trim();
    setOrder((o) => ({
      ...o, status: "CEO_APPROVED",
      ceoApproval: { approvedBy: who, approvedAt: nowISO(), comment: note || "" },
      updatedAt: nowISO(),
      audit: [...o.audit, { at: nowISO(), by: who, action: "CEO_APPROVED", detail: note || "" }],
    }));
  }
  function placeVendorOrder({ vendor, poNumber, link }) {
    if (order.status !== "CEO_APPROVED") return alert("CEO approval is required before placing vendor order.");
    if (!vendor) return alert("Select a vendor.");
    setOrder((o) => ({
      ...o, status: "VENDOR_ORDERED",
      vendorOrder: { vendor, poNumber: poNumber || "", link: link || "", orderedAt: nowISO() },
      updatedAt: nowISO(),
      audit: [...o.audit, { at: nowISO(), by: "operations", action: "VENDOR_ORDER_PLACED", detail: `${vendor} ${poNumber || ""}` }],
    }));
  }
  function markFulfillment({ tracking, carrier, eta, deliveredAt }) {
    if (order.status !== "VENDOR_ORDERED" && order.status !== "FULFILLMENT") return alert("Order must be placed with vendor first.");
    const nextStatus = deliveredAt ? "CLOSED" : "FULFILLMENT";
    setOrder((o) => ({
      ...o, status: nextStatus,
      fulfillment: {
        ...(o.fulfillment || {}),
        tracking: tracking ?? o.fulfillment?.tracking ?? "",
        carrier: carrier ?? o.fulfillment?.carrier ?? "",
        eta: eta ?? o.fulfillment?.eta ?? "",
        deliveredAt: deliveredAt ?? o.fulfillment?.deliveredAt ?? null,
      },
      updatedAt: nowISO(),
      audit: [...o.audit, { at: nowISO(), by: "operations", action: deliveredAt ? "DELIVERED" : "FULFILLMENT_UPDATE" }],
    }));
  }

  // UI computed
  const canAdvanceToQuote = warnings.length === 0 && (order.client.clientName || "").trim();
  const canAccept = order.quote && order.status === "QUOTE_SENT";
  const canCEOApprove = order.status === "CLIENT_ACCEPTED";
  const canPlaceVendor = order.status === "CEO_APPROVED";

  // Admin modal
  const [adminOpen, setAdminOpen] = useState(false);

  function applyAdminDefaultsToSpec(newAdmin) {
    setAdmin(newAdmin);
    setOrder((o) => ({
      ...o,
      spec: clampSpecToAdmin(o.spec, newAdmin),
      updatedAt: nowISO(),
      audit: [...o.audit, { at: nowISO(), by: "admin", action: "ADMIN_DEFAULTS_APPLIED" }],
    }));
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-4">
        {/* Header */}
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{admin.orgName} — Kiosk Orders</h1>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(order, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `bm3_order_${order.orderId}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Download className="h-4 w-4" /> Export Order
            </button>
            <button
              onClick={() => {
                if (!order.quote) return alert("Generate a quote first.");
                const s = order.spec;
                const lines = [
                  `${admin.orgName} – Quotation`,
                  `Order ID: ${order.orderId}`,
                  `Client: ${order.client.clientName} (${order.client.company || "-"})`,
                  `Project: ${order.client.projectName || "-"}`,
                  `Date: ${new Date().toLocaleString()}`,
                  "", "Specification:",
                  `Brand: ${s.displayBrand}; Size: ${s.size}; Res: ${s.resolution}; Brightness: ${s.brightness}; Contrast: ${s.contrast}`,
                  `Compute: ${s.cpuRam}; OS: ${s.os}; Touch: ${s.hasTouch} (${s.touchType})`,
                  `Accessories: Cam=${s.cameraModel}; Mic=${s.micModel}; Speaker=${s.speakerModel}; QR=${s.qrModel}; Badge=${s.badgePrinterModel}; WM=${s.wallMount}`,
                  `Packaging: ${s.packaging}; Certs: ${s.certifications}`,
                  "", "Pricing:",
                  `Subtotal: ${order.quote.subtotal}  Shipping: ${order.quote.shipping}  Tax: ${order.quote.tax}  TOTAL: ${order.quote.total} ${order.quote.currency}`,
                  `Estimator: ${order.quote.estimator}`,
                ];
                const text = lines.join("\n");
                const w = window.open("", "_blank", "width=900,height=700");
                if (!w) return;
                const safe = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                w.document.write(`<!doctype html><html><head><meta charset='utf-8'><title>Quote – ${order.orderId}</title><style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif;white-space:pre-wrap;padding:24px;}</style></head><body>${safe}</body></html>`);
                w.document.close(); w.focus(); w.print();
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-2 text-sm font-medium text-white hover:bg-black"
            >
              <Printer className="h-4 w-4" /> Print Quote
            </button>
            <button onClick={() => setOrder(blankOrder(admin))} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50">
              <Plus className="h-4 w-4" /> New Order
            </button>
            <button onClick={() => setAdminOpen(true)} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50">
              <Settings className="h-4 w-4" /> Admin Panel
            </button>
          </div>
        </header>

        {/* Status */}
        <StatusRibbon order={order} />

        {/* Intake */}
        <ClientIntake order={order} setOrder={setOrder} clientHistory={clientHistory} saveClientToHistory={saveClientToHistory} />

        {/* Spec */}
        <SpecForm order={order} setOrder={setOrder} admin={admin} />

        {/* Warnings */}
        {warnings.length ? (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-amber-900">
            <div className="font-semibold">Compliance warnings</div>
            <ul className="list-disc pl-5 text-sm">{warnings.map((w, i) => (<li key={i}>{w}</li>))}</ul>
          </div>
        ) : null}

        {/* Quote & approvals */}
        <QuoteApprovals
          order={order}
          setOrder={setOrder}
          canAdvanceToQuote={!!canAdvanceToQuote}
          canAccept={!!canAccept}
          canCEOApprove={!!canCEOApprove}
          onGenerateQuote={generateQuote}
          onClientAccept={clientAccept}
          onCEOApprove={ceoApprove}
        />

        {/* Vendor & fulfillment */}
        <VendorFulfillment
          order={order}
          setOrder={setOrder}
          canPlaceVendor={!!canPlaceVendor}
          onPlaceVendorOrder={placeVendorOrder}
          onMarkFulfillment={markFulfillment}
        />

        {/* Payment */}
        <PaymentRecord order={order} setOrder={setOrder} />

        {/* Audit */}
        <AuditTrail order={order} />

        {/* Admin modal */}
        {adminOpen ? (
          <AdminPanel
            defaultAdmin={DEFAULT_ADMIN}
            initialAdmin={admin}
            onSave={(draft) => { setAdmin(draft); setAdminOpen(false); }}
            onApplyDefaults={(draft) => { applyAdminDefaultsToSpec(draft); alert("Defaults applied to current order/spec."); }}
            onClose={() => setAdminOpen(false)}
          />
        ) : null}

        <footer className="py-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Brand M3dia — Corporate Kiosk Order Workflow
        </footer>
      </div>
    </div>
  );
}
