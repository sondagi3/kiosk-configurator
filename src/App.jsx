// src/App.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Settings,
  Download,
  FileDown,
  LogOut,
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

import { DEFAULT_ADMIN, defaultSpecFromAdmin, clampSpecToAdmin } from "./lib/admin.js";
import { nowISO, uuid } from "./lib/utils.js";
import { initGlobalErrorHandlers, logInfo } from "./lib/log.js";

// ---------------------- LocalStorage helpers ----------------------
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

// ---------------------- App ----------------------
export default function App() {
  // Init global error handlers once
  useEffect(() => {
    initGlobalErrorHandlers();
    logInfo("App mounted");
  }, []);

  // Admin
  const [admin, setAdmin] = useState(() => {
    const fromLS = lsGet(LS_ADMIN, null);
    return fromLS ? { ...DEFAULT_ADMIN, ...fromLS } : { ...DEFAULT_ADMIN };
  });

  // Order
  const [order, setOrder] = useState(() => {
    const latestId = lsGet(LS_ORDER_LATEST, null);
    const saved = loadOrderById(latestId);
    if (saved) return saved;

    const fresh = newOrder(DEFAULT_ADMIN);
    saveOrder(fresh);
    return fresh;
  });

  // Debug modal state
  const [showDebug, setShowDebug] = useState(false);

  // Persist admin when changed
  useEffect(() => {
    lsSet(LS_ADMIN, admin);
  }, [admin]);

  // Persist order when changed
  useEffect(() => {
    saveOrder(order);
  }, [order]);

  // Derived: header logo
  let defaultLogo = "/brand-logo.png";
  try {
    // works in Vite/SSR
    defaultLogo = new URL("/brand-logo.png", import.meta.url).pathname;
  } catch {
    defaultLogo = "/brand-logo.png";
  }
  const headerLogo = admin?.logoUrl || defaultLogo;

  // Export full order JSON
  function exportOrder() {
    const blob = new Blob([JSON.stringify(order, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bm3-order-${order.orderId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Import order JSON (prompts for file)
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
        // keep it safe: clamp spec to current admin rules
        const clamped = {
          ...obj,
          spec: clampSpecToAdmin(obj.spec || defaultSpecFromAdmin(admin), admin),
          updatedAt: nowISO(),
        };
        setOrder(clamped);
        saveOrder(clamped);
        alert("Order imported.");
      };
      input.click();
    } catch (e) {
      alert(`Import failed: ${e.message || e}`);
    }
  }

  // New order
  function newOrder(adminObj = admin) {
    const id = uuid();
    const base = {
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
    return base;
  }

  function startNewOrder() {
    const fresh = newOrder();
    setOrder(fresh);
    saveOrder(fresh);
  }

  // Factory Reset — clears all bm3_* keys (including debug log) and reloads
  function factoryReset() {
    const ok = confirm(
      "Factory Reset will erase all Brand M3dia local data on this browser (admin, orders, debug log) and reload. Continue?"
    );
    if (!ok) return;

    try {
      const keys = Object.keys(localStorage);
      keys.forEach((k) => {
        if (k.startsWith("bm3_")) localStorage.removeItem(k);
      });
    } catch {}

    location.reload();
  }

  // Past client names (for intake autocomplete)
  const pastClients = useMemo(() => {
    return lsGet("bm3_client_names", []);
  }, [order?.client?.clientName]); // re-read occasionally

  return (
    <ErrorBoundary>
      {/* Header */}
      <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <img src={headerLogo} alt={admin.orgName || "Brand M3dia"} className="h-8 w-auto" />
            <h1 className="text-2xl font-bold text-gray-900">
              {admin.orgName || "Brand M3dia"} — Kiosk Orders
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={exportOrder}
              className="inline-flex items-center gap-2 rounded-lg border border-brand-600 px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
            >
              <Download className="h-4 w-4" /> Export Order
            </button>

            <button
              onClick={importOrder}
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium"
            >
              <FileDown className="h-4 w-4" /> Import Order
            </button>

            <button
              onClick={() => setShowDebug(true)}
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium"
            >
              Debug Log
            </button>

            <button
              onClick={startNewOrder}
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium"
              title="Start a fresh order (keeps Admin settings)"
            >
              New Order
            </button>

            <button
              onClick={factoryReset}
              className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
              title="Clear all data and reload"
            >
              <LogOut className="h-4 w-4" /> Factory Reset
            </button>
          </div>
        </div>
      </header>

      {/* Status ribbon */}
      <div className="mx-auto mt-3 max-w-6xl px-4">
        <StatusRibbon order={order} />
      </div>

      {/* Main content */}
      <main className="mx-auto my-4 grid max-w-6xl gap-4 px-4">
        {/* Client Intake */}
        <ClientIntake order={order} setOrder={setOrder} pastClients={pastClients} />

        {/* Spec Form (Alibaba Edition nested spec lives here) */}
        <SpecForm order={order} setOrder={setOrder} admin={admin} />

        {/* Quote + Approvals (uses estimator & print helper if you followed earlier steps) */}
        <QuoteApprovals order={order} setOrder={setOrder} admin={admin} />

        {/* Vendor + Fulfillment + Payment + Audit */}
        <VendorFulfillment order={order} setOrder={setOrder} />
        <PaymentRecord order={order} setOrder={setOrder} />
        <AuditTrail order={order} />
      </main>

      {/* Debug Log modal */}
      <DebugLog open={showDebug} onClose={() => setShowDebug(false)} />
    </ErrorBoundary>
  );
}
