// src/App.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Download,
  FileDown,
  LogOut,
  Settings,
  MoreVertical,
} from "lucide-react";

import ErrorBoundary from "./components/ErrorBoundary.jsx";
import DebugLog from "./components/DebugLog.jsx";
import ClientIntake from "./components/ClientIntake.jsx";
import SpecForm from "./components/SpecForm.jsx";
import QuoteApprovals from "./components/QuoteApprovals.jsx";
import VendorFulfillment from "./components/VendorFulfillment.jsx";
import PaymentRecord from "./components/PaymentRecord.jsx";
import AuditTrail from "./components/AuditTrail.jsx";
import StatusRibbon from "./components/StatusRibbon.jsx";

import { DEFAULT_ADMIN, defaultSpecFromAdmin } from "./lib/admin.js";
import { nowISO, uuid } from "./lib/utils.js";
import { initGlobalErrorHandlers, logInfo } from "./lib/log.js";
import { normalizeOrderShape } from "./lib/normalize.js";

// -------------------- LocalStorage helpers --------------------
const LS_ADMIN = "bm3_admin_spec";
const LS_ORDER_LATEST = "bm3_order_latest";

function lsGet(key, fallback = null) {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : fallback;
  } catch {
    return fallback;
  }
}
function lsSet(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}
function loadOrderById(id) {
  if (!id) return null;
  return lsGet(`bm3_order_${id}`, null);
}
function saveOrder(order) {
  if (!order?.orderId) return;
  lsSet(`bm3_order_${order.orderId}`, order);
  lsSet(LS_ORDER_LATEST, order.orderId);
}

// -------------------- Small helpers --------------------
function useClickAway(ref, onAway) {
  useEffect(() => {
    function handler(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) onAway?.();
    }
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [ref, onAway]);
}

// -------------------- Admin Modal --------------------
function AdminModal({ open, onClose, admin, setAdmin }) {
  const r = useRef(null);
  useClickAway(r, onClose);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div ref={r} className="w-full max-w-xl rounded-2xl bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-gray-800" />
            <h2 className="text-lg font-semibold">Admin Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
          >
            Close
          </button>
        </div>

        <div className="grid gap-3">
          <label className="text-sm font-medium text-gray-700">
            Organization Name
            <input
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              value={admin.orgName || ""}
              onChange={(e) => setAdmin((a) => ({ ...a, orgName: e.target.value }))}
              placeholder="Brand M3dia"
            />
          </label>

          <label className="text-sm font-medium text-gray-700">
            Logo URL (optional)
            <input
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              value={admin.logoUrl || ""}
              onChange={(e) => setAdmin((a) => ({ ...a, logoUrl: e.target.value }))}
              placeholder="/brand-logo.png"
            />
            <div className="mt-1 text-xs text-gray-500">
              Tip: leave blank to use <code>/brand-logo.png</code>. Put your PNG in <code>public/</code>.
            </div>
          </label>

          <div className="flex items-center gap-3">
            <img
              src={admin?.logoUrl || "/brand-logo.png"}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/brand-logo.png";
              }}
              alt={admin.orgName || "Brand M3dia"}
              className="h-10 w-auto rounded bg-white"
            />
            <div className="text-xs text-gray-600">Preview</div>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------- App --------------------
export default function App() {
  useEffect(() => {
    initGlobalErrorHandlers();
    logInfo("App mounted");
  }, []);

  // Admin
  const [admin, setAdmin] = useState(() => {
    const fromLS = lsGet(LS_ADMIN, null);
    return fromLS ? { ...DEFAULT_ADMIN, ...fromLS } : { ...DEFAULT_ADMIN };
  });

  // Order (normalize on load)
  const [order, setOrder] = useState(() => {
    const latestId = lsGet(LS_ORDER_LATEST, null);
    const saved = loadOrderById(latestId);
    const base = saved || newOrder(DEFAULT_ADMIN);
    const normalized = normalizeOrderShape(base, DEFAULT_ADMIN);
    saveOrder(normalized);
    return normalized;
  });

  const [showDebug, setShowDebug] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  useClickAway(menuRef, () => setMenuOpen(false));

  useEffect(() => { lsSet(LS_ADMIN, admin); }, [admin]);
  useEffect(() => { saveOrder(order); }, [order]);

  // Safe logo path
  let defaultLogo = "/brand-logo.png";
  try {
    defaultLogo = new URL("/brand-logo.png", import.meta.url).pathname;
  } catch {
    defaultLogo = "/brand-logo.png";
  }
  const headerLogo = admin?.logoUrl || defaultLogo;

  function exportOrder() {
    const blob = new Blob([JSON.stringify(order, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bm3-order-${order.orderId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function importOrder() {
    try {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "application/json";
      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        const text = await file.text();
        const obj = JSON.parse(text);
        if (!obj?.orderId) throw new Error("Invalid file: missing orderId");
        const clamped = normalizeOrderShape(obj, admin || DEFAULT_ADMIN);
        setOrder(clamped);
        saveOrder(clamped);
        alert("Order imported.");
      };
      input.click();
    } catch (e) {
      alert(`Import failed: ${e.message || e}`);
    }
  }

  function newOrder(adminObj = admin) {
    const id = uuid();
    return {
      orderId: id,
      status: "INTAKE",
      client: {},
      spec: defaultSpecFromAdmin(adminObj),
      payment: { method: "Credit Card", cardNumber: "", expiry: "", cvv: "", poNumber: "" },
      quote: null,
      clientAcceptance: null,
      ceoApproval: null,
      vendorOrder: null,
      fulfillment: null,
      audit: [{ at: nowISO(), by: "system", action: "ORDER_CREATED", detail: "" }],
      createdAt: nowISO(),
      updatedAt: nowISO(),
    };
  }

  function startNewOrder() {
    const fresh = normalizeOrderShape(newOrder(admin), admin);
    setOrder(fresh);
    saveOrder(fresh);
  }

  function factoryReset() {
    const ok = confirm(
      "Factory Reset will erase all Brand M3dia local data on this browser (admin, orders, debug log) and reload. Continue?"
    );
    if (!ok) return;
    try {
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith("bm3_")) localStorage.removeItem(k);
      });
    } catch {}
    location.reload();
  }

  const pastClients = useMemo(() => lsGet("bm3_client_names", []), [order?.client?.clientName]);

  return (
    <ErrorBoundary>
      {/* Header */}
      <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          {/* Left: logo + stacked title */}
          <div className="flex items-center gap-3">
            <img
              src={headerLogo}
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/brand-logo.png"; }}
              alt={admin.orgName || "Brand M3dia"}
              className="h-8 w-auto"
            />
            <div className="leading-tight">
  <div className="text-xl font-semibold text-gray-900">Kiosk Orders</div>
</div>
          </div>

          {/* Right: Admin button + kebab menu */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdmin(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100"
              title="Admin Settings"
            >
              <Settings className="h-4 w-4" />
              Admin
            </button>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="inline-flex items-center justify-center rounded-lg border border-gray-300 p-2 hover:bg-gray-100"
                title="More actions"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
                >
                  <button
                    onClick={() => { setMenuOpen(false); exportOrder(); }}
                    role="menuitem"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    <Download className="h-4 w-4" /> Export Order
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); importOrder(); }}
                    role="menuitem"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    <FileDown className="h-4 w-4" /> Import Order
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); setShowDebug(true); }}
                    role="menuitem"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    Debug Log
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); startNewOrder(); }}
                    role="menuitem"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    New Order
                  </button>
                  <div className="my-1 h-px bg-gray-100" />
                  <button
                    onClick={() => { setMenuOpen(false); factoryReset(); }}
                    role="menuitem"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" /> Factory Reset
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Status ribbon */}
      <div className="mx-auto mt-3 max-w-6xl px-4">
        <StatusRibbon order={order} />
      </div>

      {/* Main content */}
      <main className="mx-auto my-4 grid max-w-6xl gap-4 px-4">
        <ClientIntake order={order} setOrder={setOrder} pastClients={pastClients} />
        <SpecForm order={order} setOrder={setOrder} admin={admin} />
        <QuoteApprovals order={order} setOrder={setOrder} admin={admin} />
        <VendorFulfillment order={order} setOrder={setOrder} />
        <PaymentRecord order={order} setOrder={setOrder} />
        <AuditTrail order={order} />
      </main>

      {/* Modals */}
      <AdminModal open={showAdmin} onClose={() => setShowAdmin(false)} admin={admin} setAdmin={setAdmin} />
      <DebugLog open={showDebug} onClose={() => setShowDebug(false)} />
    </ErrorBoundary>
  );
}
