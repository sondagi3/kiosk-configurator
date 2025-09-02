import React, { useEffect, useMemo, useState } from "react";
import {
  Monitor,
  Cpu,
  ShoppingCart,
  Smartphone,
  Check,
  ChevronDown,
  X,
  Download,
  Printer,
  Settings,
  Plus,
  Trash2,
  CreditCard,
  BadgeCheck,
  Building2,
  Factory,
  Save,
  RefreshCcw,
  Upload,
} from "lucide-react";

// Use env var in Vite if provided, else fallback (adjust for production)
const API_BASE = import.meta?.env?.VITE_API_BASE || "http://localhost:3001/api";

/* =========================================================================
   Brand M3dia – Corporate Kiosk Order Workflow (All-in-one file)
   - Fixes input cursor jumping
   - Modern Admin Panel (modal) with tabs, add/remove lists, import/export
   - Past Clients history + autocomplete
   - Order workflow with guardrails, audit, estimator (vendor/local)
   =======================================================================*/

// ---- Small helpers
function nowISO() {
  return new Date().toISOString();
}
function uuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ---- Default Admin Spec
const DEFAULT_ADMIN = {
  orgName: "Brand M3dia",
  display: {
    allowedBrands: ["LG", "Samsung"],
    sizeOptions: ["32-inch", "43-inch", "49-inch", "55-inch", "65-inch", "75-inch"],
    resolutionOptions: ["FHD (1920x1080)", "UHD (3840x2160)"],
    minBrightness: 400,
    minContrast: 1000,
  },
  pc: {
    cpuOptions: ["i5 / 16GB / 512GB", "i7 / 32GB / 1TB"],
    osOptions: ["Windows 11 Pro", "Ubuntu 22.04 LTS"],
  },
  touch: {
    types: ["PCAP", "IR"],
  },
  peripherals: {
    cameras: ["Logitech Brio 4K"],
    mics: ["Shure MV5C"],
    speakers: ["Logitech Z207"],
    qrScanners: ["Zebra DS2208"],
    badgePrinters: ["Zebra ZD421"],
    wallMounts: ["VESA 400x400"],
  },
  docs: {
    labels: true,
    manual: true,
    proofBeforeShip: true,
    visualProof: true,
    packagingOptions: ["Basic Box", "Retail Box", "Flight Case"],
    certifications: ["FCC", "CE", "UL"],
    requireCanadianWiringColors: true,
  },
  warranty: {
    noSubstitutions: true,
    years: 2,
  },
  customFields: [], // e.g. [{ key: "SiteCode", type: "text", defaultValue: "" }]
};

// Build default spec from admin spec
function defaultSpecFromAdmin(admin) {
  return {
    displayBrand: admin.display.allowedBrands[0] || "",
    size: admin.display.sizeOptions[3] || admin.display.sizeOptions[0] || "",
    resolution: admin.display.resolutionOptions[0] || "",
    brightness: String(admin.display.minBrightness),
    contrast: String(admin.display.minContrast),

    cpuRam: admin.pc.cpuOptions[0] || "",
    os: admin.pc.osOptions[0] || "",

    hasTouch: "Yes",
    touchType: admin.touch.types[0] || "",

    enclosureType: "Wall-mount",
    color: "Black",
    logoText: "Brand M3dia",

    labelsProvided: admin.docs.labels ? "Yes" : "No",
    manualProvided: admin.docs.manual ? "Yes" : "No",
    proofBeforeShip: admin.docs.proofBeforeShip ? "Yes" : "No",
    visualProof: admin.docs.visualProof ? "Yes" : "No",
    packaging: admin.docs.packagingOptions[2] || admin.docs.packagingOptions[0] || "",
    certifications: admin.docs.certifications.join(", "),
    originCountry: "",
    canadIanWireColors: admin.docs.requireCanadianWiringColors ? "Yes" : "No",

    noSubstitutions: admin.warranty.noSubstitutions ? "Yes" : "No",
    warrantyYears: String(admin.warranty.years),

    cameraModel: admin.peripherals.cameras[0] || "",
    micModel: admin.peripherals.mics[0] || "",
    speakerModel: admin.peripherals.speakers[0] || "",
    qrModel: admin.peripherals.qrScanners[0] || "",
    badgePrinterModel: admin.peripherals.badgePrinters[0] || "",
    wallMount: admin.peripherals.wallMounts[0] || "",
    peripherals: ["mic", "speaker", "webcam", "qr"],
  };
}

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
    payment: {
      method: "Credit Card",
      cardNumber: "",
      expiry: "",
      cvv: "",
      poNumber: "",
    },
    quote: null,
    clientAcceptance: null,
    ceoApproval: null,
    vendorOrder: null,
    fulfillment: null,
    audit: [{ at: nowISO(), by: "system", action: "ORDER_CREATED" }],
  };
}

// =============================== App ===============================
export default function App() {
  // Admin spec with persistence
  const [admin, setAdmin] = useState(() => {
    try {
      const raw = localStorage.getItem("bm3_admin_spec");
      return raw ? JSON.parse(raw) : DEFAULT_ADMIN;
    } catch {
      return DEFAULT_ADMIN;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("bm3_admin_spec", JSON.stringify(admin));
    } catch {}
  }, [admin]);

  // Order as single source of truth (prevents cursor issues)
  const [order, setOrder] = useState(() => {
    try {
      const latestId = localStorage.getItem("bm3_order_latest");
      if (latestId) {
        const raw = localStorage.getItem(`bm3_order_${latestId}`);
        if (raw) return JSON.parse(raw);
      }
    } catch {}
    return blankOrder(admin);
  });

  // Autosave order
  useEffect(() => {
    try {
      localStorage.setItem(`bm3_order_${order.orderId}`, JSON.stringify(order));
      localStorage.setItem("bm3_order_latest", order.orderId);
    } catch {}
  }, [order]);

  // Past clients (for autocomplete/history)
  const [clientHistory, setClientHistory] = useState(() => {
    try {
      const raw = localStorage.getItem("bm3_client_names");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const saveClientToHistory = (name) => {
    const n = (name || "").trim();
    if (!n) return;
    setClientHistory((prev) => {
      const next = [n, ...prev.filter((p) => p.toLowerCase() !== n.toLowerCase())].slice(0, 50);
      try {
        localStorage.setItem("bm3_client_names", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // ---- Simple components
  const Select = ({ value, onChange, options }) => (
    <div className="relative">
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-2.5 pr-10 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-5 w-5 text-gray-500" />
    </div>
  );

  const Text = ({ value, onChange, type = "text", placeholder, list }) => (
    <input
      value={value ?? ""} // keep input controlled to avoid cursor jump
      onChange={(e) => onChange(e.target.value)}
      type={type}
      placeholder={placeholder}
      list={list}
      className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
    />
  );

  const Section = ({ title, icon, children }) => (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
    </div>
  );

  const Field = ({ label, children, hint }) => (
    <label className="block">
      <div className="mb-1 text-sm font-medium text-gray-700">{label}</div>
      {children}
      {hint ? <div className="mt-1 text-xs text-gray-500">{hint}</div> : null}
    </label>
  );

  // ---- Warnings / Guardrails
  const warnings = useMemo(() => {
    const s = order.spec;
    const c = order.client;
    const list = [];
    if (!admin.display.allowedBrands.includes(s.displayBrand)) {
      list.push(`Display brand must be one of: ${admin.display.allowedBrands.join(", ")}`);
    }
    if (parseInt(s.brightness || "0", 10) < admin.display.minBrightness) {
      list.push(`Brightness below minimum (${admin.display.minBrightness} nits).`);
    }
    if (parseInt(s.contrast || "0", 10) < admin.display.minContrast) {
      list.push(`Contrast below minimum (${admin.display.minContrast}:1).`);
    }
    if (s.hasTouch === "Yes" && !admin.touch.types.includes(s.touchType)) {
      list.push(`Touch type must be one of: ${admin.touch.types.join(", ")}`);
    }
    if (!c.clientName?.trim()) {
      list.push("Client Name is required (corporate standard).");
    }
    return list;
  }, [order.spec, order.client, admin]);

  // ---- Estimation
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spec }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } catch {
      return null;
    }
  }

  async function generateQuote() {
    if (warnings.length) {
      alert("Please resolve warnings before generating a quote.");
      return;
    }
    const vendor = await vendorEstimate(order.spec);
    const base = vendor || localEstimate(order.spec);
    setOrder((o) => ({
      ...o,
      quote: base,
      status: "QUOTE_SENT",
      updatedAt: nowISO(),
      audit: [...o.audit, { at: nowISO(), by: "system", action: "QUOTE_GENERATED", detail: base.estimator }],
    }));
  }

  function clientAccept() {
    if (!order.quote) return alert("Generate a quote first.");
    const name = (order.client.clientName || "").trim();
    if (!name) return alert("Client name is required to accept.");
    // Save to history on accept
    saveClientToHistory(name);
    setOrder((o) => ({
      ...o,
      status: "CLIENT_ACCEPTED",
      clientAcceptance: { acceptedBy: name, acceptedAt: nowISO() },
      updatedAt: nowISO(),
      audit: [...o.audit, { at: nowISO(), by: name, action: "CLIENT_ACCEPTED" }],
    }));
  }

  function ceoApprove(ceoName, note) {
    if (order.status !== "CLIENT_ACCEPTED") {
      return alert("Client must accept the quote before CEO approval.");
    }
    const who = (ceoName || "CEO").trim();
    setOrder((o) => ({
      ...o,
      status: "CEO_APPROVED",
      ceoApproval: { approvedBy: who, approvedAt: nowISO(), comment: note || "" },
      updatedAt: nowISO(),
      audit: [...o.audit, { at: nowISO(), by: who, action: "CEO_APPROVED", detail: note || "" }],
    }));
  }

  function placeVendorOrder({ vendor, poNumber, link }) {
    if (order.status !== "CEO_APPROVED") {
      return alert("CEO approval is required before placing vendor order.");
    }
    if (!vendor) return alert("Select a vendor (Alibaba or other).");
    setOrder((o) => ({
      ...o,
      status: "VENDOR_ORDERED",
      vendorOrder: { vendor, poNumber: poNumber || "", link: link || "", orderedAt: nowISO() },
      updatedAt: nowISO(),
      audit: [...o.audit, { at: nowISO(), by: "operations", action: "VENDOR_ORDER_PLACED", detail: `${vendor} ${poNumber || ""}` }],
    }));
  }

  function markFulfillment({ tracking, carrier, eta, deliveredAt }) {
    if (order.status !== "VENDOR_ORDERED" && order.status !== "FULFILLMENT") {
      return alert("Order must be placed with vendor first.");
    }
    const nextStatus = deliveredAt ? "CLOSED" : "FULFILLMENT";
    setOrder((o) => ({
      ...o,
      status: nextStatus,
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

  function resetNewOrder() {
    const fresh = blankOrder(admin);
    setOrder(fresh);
  }

  // Clamp spec to Admin (used when admin changes)
  function applyAdminDefaultsToSpec(newAdmin) {
    setAdmin(newAdmin);
    setOrder((o) => {
      const next = { ...o, spec: { ...o.spec } };
      const s = next.spec;

      if (!newAdmin.display.allowedBrands.includes(s.displayBrand)) {
        s.displayBrand = newAdmin.display.allowedBrands[0] || "";
      }
      if (!newAdmin.display.sizeOptions.includes(s.size)) {
        s.size = newAdmin.display.sizeOptions[0] || "";
      }
      if (!newAdmin.display.resolutionOptions.includes(s.resolution)) {
        s.resolution = newAdmin.display.resolutionOptions[0] || "";
      }
      if (parseInt(s.brightness || "0", 10) < newAdmin.display.minBrightness) {
        s.brightness = String(newAdmin.display.minBrightness);
      }
      if (parseInt(s.contrast || "0", 10) < newAdmin.display.minContrast) {
        s.contrast = String(newAdmin.display.minContrast);
      }

      if (!newAdmin.pc.cpuOptions.includes(s.cpuRam)) {
        s.cpuRam = newAdmin.pc.cpuOptions[0] || "";
      }
      if (!newAdmin.pc.osOptions.includes(s.os)) {
        s.os = newAdmin.pc.osOptions[0] || "";
      }

      if (s.hasTouch === "Yes" && !newAdmin.touch.types.includes(s.touchType)) {
        s.touchType = newAdmin.touch.types[0] || "";
      }

      const clamp = (arr, val) => (arr.includes(val) ? val : arr[0] || "");
      s.cameraModel = clamp(newAdmin.peripherals.cameras, s.cameraModel);
      s.micModel = clamp(newAdmin.peripherals.mics, s.micModel);
      s.speakerModel = clamp(newAdmin.peripherals.speakers, s.speakerModel);
      s.qrModel = clamp(newAdmin.peripherals.qrScanners, s.qrModel);
      s.badgePrinterModel = clamp(newAdmin.peripherals.badgePrinters, s.badgePrinterModel);
      s.wallMount = clamp(newAdmin.peripherals.wallMounts, s.wallMount);

      s.labelsProvided = newAdmin.docs.labels ? "Yes" : "No";
      s.manualProvided = newAdmin.docs.manual ? "Yes" : "No";
      s.proofBeforeShip = newAdmin.docs.proofBeforeShip ? "Yes" : "No";
      s.visualProof = newAdmin.docs.visualProof ? "Yes" : "No";
      if (!newAdmin.docs.packagingOptions.includes(s.packaging)) {
        s.packaging = newAdmin.docs.packagingOptions[0] || "";
      }
      s.certifications = newAdmin.docs.certifications.join(", ");
      s.canadIanWireColors = newAdmin.docs.requireCanadianWiringColors ? "Yes" : "No";

      s.noSubstitutions = newAdmin.warranty.noSubstitutions ? "Yes" : "No";
      s.warrantyYears = String(newAdmin.warranty.years);

      next.updatedAt = nowISO();
      next.audit = [...next.audit, { at: nowISO(), by: "admin", action: "ADMIN_DEFAULTS_APPLIED" }];
      return next;
    });
  }

  // ===== Admin Panel Modal (inline component) =====
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminTab, setAdminTab] = useState("org");
  const [adminDraft, setAdminDraft] = useState(admin);

  function ArrayEditor({ label, items, onChange, placeholder = "Add item", hint }) {
    const [val, setVal] = useState("");
    const add = () => {
      const v = val.trim();
      if (!v) return;
      if (items.includes(v)) return;
      onChange([...items, v]);
      setVal("");
    };
    const remove = (idx) => onChange(items.filter((_, i) => i !== idx));
    return (
      <div className="space-y-2">
        <Field label={label} hint={hint}>
          <div className="flex gap-2">
            <input
              value={val}
              onChange={(e) => setVal(e.target.value)}
              placeholder={placeholder}
              className="flex-1 rounded-xl border border-gray-300 px-3 py-2"
            />
            <button
              type="button"
              onClick={add}
              className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </div>
        </Field>
        <div className="flex flex-wrap gap-2">
          {items.map((t, i) => (
            <span key={`${t}-${i}`} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs">
              {t}
              <button type="button" onClick={() => remove(i)} className="text-gray-500 hover:text-gray-700">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      </div>
    );
  }

  function AdminPanelModal() {
    const exportJSON = () => {
      const blob = new Blob([JSON.stringify(adminDraft, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "brand-m3dia-admin-spec.json";
      a.click();
      URL.revokeObjectURL(url);
    };
    const importJSON = () => {
      const raw = prompt("Paste admin JSON to import:");
      if (!raw) return;
      try {
        const parsed = JSON.parse(raw);
        setAdminDraft(parsed);
        alert("Imported. Review and Save.");
      } catch {
        alert("Invalid JSON");
      }
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-5xl rounded-2xl bg-white shadow-xl">
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Admin Panel</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAdminDraft(DEFAULT_ADMIN)}
                className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-sm hover:bg-gray-50"
                title="Restore Defaults"
              >
                <RefreshCcw className="h-4 w-4" /> Defaults
              </button>
              <button
                onClick={exportJSON}
                className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-sm hover:bg-gray-50"
              >
                <Download className="h-4 w-4" /> Export
              </button>
              <button
                onClick={importJSON}
                className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-sm hover:bg-gray-50"
              >
                <Upload className="h-4 w-4" /> Import
              </button>
              <button
                onClick={() => {
                  applyAdminDefaultsToSpec(adminDraft);
                  alert("Defaults applied to current order/spec.");
                }}
                className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1.5 text-sm text-blue-800 hover:bg-blue-100"
                title="Apply defaults to current order/spec"
              >
                Apply to Order
              </button>
              <button
                onClick={() => {
                  setAdmin(adminDraft);
                  setAdminOpen(false);
                }}
                className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Save className="h-4 w-4" /> Save
              </button>
              <button
                onClick={() => setAdminOpen(false)}
                className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-sm hover:bg-gray-50"
              >
                <X className="h-4 w-4" /> Close
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-b p-3 text-sm">
            {[
              ["org", "Org"],
              ["display", "Display"],
              ["pc", "PC/OS"],
              ["touch", "Touch"],
              ["peripherals", "Peripherals"],
              ["docs", "Docs/QA"],
              ["warranty", "Warranty"],
              ["custom", "Custom Fields"],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setAdminTab(key)}
                className={`rounded-lg px-3 py-1.5 ${
                  adminTab === key ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="space-y-4 p-4">
            {adminTab === "org" && (
              <Section title="Organization">
                <Field label="Organization Name">
                  <Text
                    value={adminDraft.orgName}
                    onChange={(v) => setAdminDraft({ ...adminDraft, orgName: v })}
                  />
                </Field>
              </Section>
            )}

            {adminTab === "display" && (
              <Section title="Display Constraints">
                <ArrayEditor
                  label="Allowed Brands"
                  items={adminDraft.display.allowedBrands}
                  onChange={(arr) =>
                    setAdminDraft({ ...adminDraft, display: { ...adminDraft.display, allowedBrands: arr } })
                  }
                  hint="Brands CEO can select (enforced)."
                />
                <ArrayEditor
                  label="Size Options"
                  items={adminDraft.display.sizeOptions}
                  onChange={(arr) =>
                    setAdminDraft({ ...adminDraft, display: { ...adminDraft.display, sizeOptions: arr } })
                  }
                />
                <ArrayEditor
                  label="Resolution Options"
                  items={adminDraft.display.resolutionOptions}
                  onChange={(arr) =>
                    setAdminDraft({ ...adminDraft, display: { ...adminDraft.display, resolutionOptions: arr } })
                  }
                />
                <Field label="Minimum Brightness (nits)">
                  <Text
                    type="number"
                    value={adminDraft.display.minBrightness}
                    onChange={(v) =>
                      setAdminDraft({
                        ...adminDraft,
                        display: { ...adminDraft.display, minBrightness: Number(v) || 0 },
                      })
                    }
                  />
                </Field>
                <Field label="Minimum Contrast">
                  <Text
                    type="number"
                    value={adminDraft.display.minContrast}
                    onChange={(v) =>
                      setAdminDraft({
                        ...adminDraft,
                        display: { ...adminDraft.display, minContrast: Number(v) || 0 },
                      })
                    }
                  />
                </Field>
              </Section>
            )}

            {adminTab === "pc" && (
              <Section title="Compute & OS">
                <ArrayEditor
                  label="CPU/RAM/Storage Options"
                  items={adminDraft.pc.cpuOptions}
                  onChange={(arr) => setAdminDraft({ ...adminDraft, pc: { ...adminDraft.pc, cpuOptions: arr } })}
                />
                <ArrayEditor
                  label="OS Options"
                  items={adminDraft.pc.osOptions}
                  onChange={(arr) => setAdminDraft({ ...adminDraft, pc: { ...adminDraft.pc, osOptions: arr } })}
                />
              </Section>
            )}

            {adminTab === "touch" && (
              <Section title="Touch">
                <ArrayEditor
                  label="Touch Types"
                  items={adminDraft.touch.types}
                  onChange={(arr) => setAdminDraft({ ...adminDraft, touch: { ...adminDraft.touch, types: arr } })}
                />
              </Section>
            )}

            {adminTab === "peripherals" && (
              <Section title="Peripherals">
                <ArrayEditor
                  label="Cameras"
                  items={adminDraft.peripherals.cameras}
                  onChange={(arr) =>
                    setAdminDraft({ ...adminDraft, peripherals: { ...adminDraft.peripherals, cameras: arr } })
                  }
                />
                <ArrayEditor
                  label="Microphones"
                  items={adminDraft.peripherals.mics}
                  onChange={(arr) =>
                    setAdminDraft({ ...adminDraft, peripherals: { ...adminDraft.peripherals, mics: arr } })
                  }
                />
                <ArrayEditor
                  label="Speakers"
                  items={adminDraft.peripherals.speakers}
                  onChange={(arr) =>
                    setAdminDraft({ ...adminDraft, peripherals: { ...adminDraft.peripherals, speakers: arr } })
                  }
                />
                <ArrayEditor
                  label="QR Scanners"
                  items={adminDraft.peripherals.qrScanners}
                  onChange={(arr) =>
                    setAdminDraft({ ...adminDraft, peripherals: { ...adminDraft.peripherals, qrScanners: arr } })
                  }
                />
                <ArrayEditor
                  label="Badge Printers"
                  items={adminDraft.peripherals.badgePrinters}
                  onChange={(arr) =>
                    setAdminDraft({ ...adminDraft, peripherals: { ...adminDraft.peripherals, badgePrinters: arr } })
                  }
                />
                <ArrayEditor
                  label="Wall Mounts"
                  items={adminDraft.peripherals.wallMounts}
                  onChange={(arr) =>
                    setAdminDraft({ ...adminDraft, peripherals: { ...adminDraft.peripherals, wallMounts: arr } })
                  }
                />
              </Section>
            )}

            {adminTab === "docs" && (
              <Section title="Documentation & QA">
                <Field label="Labels Provided (Yes/No)">
                  <Text
                    value={adminDraft.docs.labels ? "Yes" : "No"}
                    onChange={(v) =>
                      setAdminDraft({ ...adminDraft, docs: { ...adminDraft.docs, labels: /^y/i.test(v) } })
                    }
                    placeholder="Yes or No"
                  />
                </Field>
                <Field label="Manual Provided (Yes/No)">
                  <Text
                    value={adminDraft.docs.manual ? "Yes" : "No"}
                    onChange={(v) =>
                      setAdminDraft({ ...adminDraft, docs: { ...adminDraft.docs, manual: /^y/i.test(v) } })
                    }
                  />
                </Field>
                <Field label="Proof Before Ship (Yes/No)">
                  <Text
                    value={adminDraft.docs.proofBeforeShip ? "Yes" : "No"}
                    onChange={(v) =>
                      setAdminDraft({
                        ...adminDraft,
                        docs: { ...adminDraft.docs, proofBeforeShip: /^y/i.test(v) },
                      })
                    }
                  />
                </Field>
                <Field label="Visual Proof (Yes/No)">
                  <Text
                    value={adminDraft.docs.visualProof ? "Yes" : "No"}
                    onChange={(v) =>
                      setAdminDraft({
                        ...adminDraft,
                        docs: { ...adminDraft.docs, visualProof: /^y/i.test(v) },
                      })
                    }
                  />
                </Field>
                <ArrayEditor
                  label="Packaging Options"
                  items={adminDraft.docs.packagingOptions}
                  onChange={(arr) =>
                    setAdminDraft({ ...adminDraft, docs: { ...adminDraft.docs, packagingOptions: arr } })
                  }
                />
                <ArrayEditor
                  label="Certifications"
                  items={adminDraft.docs.certifications}
                  onChange={(arr) =>
                    setAdminDraft({ ...adminDraft, docs: { ...adminDraft.docs, certifications: arr } })
                  }
                />
                <Field label="Require Canadian Wiring Colors (Yes/No)">
                  <Text
                    value={adminDraft.docs.requireCanadianWiringColors ? "Yes" : "No"}
                    onChange={(v) =>
                      setAdminDraft({
                        ...adminDraft,
                        docs: { ...adminDraft.docs, requireCanadianWiringColors: /^y/i.test(v) },
                      })
                    }
                  />
                </Field>
              </Section>
            )}

            {adminTab === "warranty" && (
              <Section title="Warranty">
                <Field label="No Substitutions Without Consent (Yes/No)">
                  <Text
                    value={adminDraft.warranty.noSubstitutions ? "Yes" : "No"}
                    onChange={(v) =>
                      setAdminDraft({
                        ...adminDraft,
                        warranty: { ...adminDraft.warranty, noSubstitutions: /^y/i.test(v) },
                      })
                    }
                  />
                </Field>
                <Field label="Warranty Years">
                  <Text
                    type="number"
                    value={adminDraft.warranty.years}
                    onChange={(v) =>
                      setAdminDraft({
                        ...adminDraft,
                        warranty: { ...adminDraft.warranty, years: Number(v) || 0 },
                      })
                    }
                  />
                </Field>
              </Section>
            )}

            {adminTab === "custom" && (
              <Section title="Custom Fields (show on CEO form)">
                <ArrayEditor
                  label="Add text field key (creates a text input on CEO form)"
                  items={(adminDraft.customFields || []).map((x) => x.key)}
                  onChange={(arr) =>
                    setAdminDraft({
                      ...adminDraft,
                      customFields: arr.map((k) => ({ key: k, type: "text", defaultValue: "" })),
                    })
                  }
                  hint='Example: "SiteCode" or "CostCenter".'
                />
              </Section>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ===== UI computed
  const canAdvanceToQuote = warnings.length === 0 && (order.client.clientName || "").trim();
  const canAccept = order.quote && order.status === "QUOTE_SENT";
  const canCEOApprove = order.status === "CLIENT_ACCEPTED";
  const canPlaceVendor = order.status === "CEO_APPROVED";

  // ===== Render
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{admin.orgName} – Kiosk Orders</h1>
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
                const lines = [];
                lines.push(`${admin.orgName} – Quotation`);
                lines.push(`Order ID: ${order.orderId}`);
                lines.push(`Client: ${order.client.clientName} (${order.client.company || "-"})`);
                lines.push(`Project: ${order.client.projectName || "-"}`);
                lines.push(`Date: ${new Date().toLocaleString()}`);
                lines.push("\nSpecification:");
                const s = order.spec;
                lines.push(
                  `Brand: ${s.displayBrand}; Size: ${s.size}; Res: ${s.resolution}; Brightness: ${s.brightness}; Contrast: ${s.contrast}`
                );
                lines.push(`Compute: ${s.cpuRam}; OS: ${s.os}; Touch: ${s.hasTouch} (${s.touchType})`);
                lines.push(
                  `Accessories: Cam=${s.cameraModel}; Mic=${s.micModel}; Speaker=${s.speakerModel}; QR=${s.qrModel}; Badge=${s.badgePrinterModel}; WM=${s.wallMount}`
                );
                lines.push(`Packaging: ${s.packaging}; Certs: ${s.certifications}`);
                lines.push("\nPricing:");
                lines.push(
                  `Subtotal: ${order.quote.subtotal}  Shipping: ${order.quote.shipping}  Tax: ${order.quote.tax}  TOTAL: ${order.quote.total} ${order.quote.currency}`
                );
                lines.push(`Estimator: ${order.quote.estimator}`);
                const text = lines.join("\n");
                const w = window.open("", "_blank", "width=900,height=700");
                if (!w) return;
                const safe = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                w.document.write(
                  `<!doctype html><html><head><meta charset='utf-8'><title>Quote – ${order.orderId}</title><style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif;white-space:pre-wrap;padding:24px;}</style></head><body>${safe}</body></html>`
                );
                w.document.close();
                w.focus();
                w.print();
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-2 text-sm font-medium text-white hover:bg-black"
            >
              <Printer className="h-4 w-4" /> Print Quote
            </button>
            <button
              onClick={resetNewOrder}
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"
            >
              <Plus className="h-4 w-4" /> New Order
            </button>
            <button
              onClick={() => {
                setAdminDraft(admin);
                setAdminOpen(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"
            >
              <Settings className="h-4 w-4" /> Admin Panel
            </button>
          </div>
        </header>

        {/* Status Ribbon */}
        <div className="rounded-xl border border-gray-200 bg-white p-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">Order ID:</span> {order.orderId}
            <span className="mx-2 h-4 w-px bg-gray-300" />
            <span className="font-semibold">Status:</span>{" "}
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">{order.status}</span>
            <span className="mx-2 h-4 w-px bg-gray-300" />
            <span className="text-gray-500">Updated: {new Date(order.updatedAt).toLocaleString()}</span>
          </div>
        </div>

        {/* Client Intake */}
        <Section title="Client Intake" icon={<Building2 className="h-6 w-6 text-gray-800" />}>
          {/* Autocomplete source */}
          <datalist id="clientNames">
            {clientHistory.map((n) => (
              <option key={n} value={n} />
            ))}
          </datalist>

          <Field label="Client Name (required)">
            <div className="flex gap-2">
              <Text
                value={order.client.clientName}
                onChange={(v) =>
                  setOrder((o) => ({ ...o, client: { ...o.client, clientName: v }, updatedAt: nowISO() }))
                }
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
            <Text
              value={order.client.company}
              onChange={(v) => setOrder((o) => ({ ...o, client: { ...o.client, company: v }, updatedAt: nowISO() }))}
            />
          </Field>
          <Field label="Email">
            <Text
              type="email"
              value={order.client.email}
              onChange={(v) => setOrder((o) => ({ ...o, client: { ...o.client, email: v }, updatedAt: nowISO() }))}
            />
          </Field>
          <Field label="Phone">
            <Text
              value={order.client.phone}
              onChange={(v) => setOrder((o) => ({ ...o, client: { ...o.client, phone: v }, updatedAt: nowISO() }))}
            />
          </Field>
          <Field label="Billing Address">
            <Text
              value={order.client.billingAddress}
              onChange={(v) =>
                setOrder((o) => ({ ...o, client: { ...o.client, billingAddress: v }, updatedAt: nowISO() }))
              }
            />
          </Field>
          <Field label="Shipping Address">
            <Text
              value={order.client.shippingAddress}
              onChange={(v) =>
                setOrder((o) => ({ ...o, client: { ...o.client, shippingAddress: v }, updatedAt: nowISO() }))
              }
            />
          </Field>
          <Field label="Project Name">
            <Text
              value={order.client.projectName}
              onChange={(v) =>
                setOrder((o) => ({ ...o, client: { ...o.client, projectName: v }, updatedAt: nowISO() }))
              }
            />
          </Field>
          <Field label="Notes">
            <Text
              value={order.client.notes}
              onChange={(v) => setOrder((o) => ({ ...o, client: { ...o.client, notes: v }, updatedAt: nowISO() }))}
            />
          </Field>

          {/* Past clients quick list */}
          <div className="md:col-span-2">
            <div className="rounded-xl border bg-gray-50 p-3 text-xs text-gray-700">
              <div className="mb-1 font-semibold">Past Clients</div>
              <div className="flex flex-wrap gap-2">
                {clientHistory.length ? (
                  clientHistory.slice(0, 12).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() =>
                        setOrder((o) => ({ ...o, client: { ...o.client, clientName: n }, updatedAt: nowISO() }))
                      }
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

        {/* Specification */}
        <Section title="Specification" icon={<Monitor className="h-6 w-6 text-gray-800" />}>
          <Field label="Brand">
            <Select
              value={order.spec.displayBrand}
              onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, displayBrand: v }, updatedAt: nowISO() }))}
              options={admin.display.allowedBrands}
            />
          </Field>
          <Field label="Size">
            <Select
              value={order.spec.size}
              onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, size: v }, updatedAt: nowISO() }))}
              options={admin.display.sizeOptions}
            />
          </Field>
          <Field label="Resolution">
            <Select
              value={order.spec.resolution}
              onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, resolution: v }, updatedAt: nowISO() }))}
              options={admin.display.resolutionOptions}
            />
          </Field>
          <Field label="Brightness (nits)">
            <Text
              type="number"
              value={order.spec.brightness}
              onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, brightness: v }, updatedAt: nowISO() }))}
            />
          </Field>
          <Field label="Contrast">
            <Text
              type="number"
              value={order.spec.contrast}
              onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, contrast: v }, updatedAt: nowISO() }))}
            />
          </Field>
          <Field label="Compute Spec">
            <Select
              value={order.spec.cpuRam}
              onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, cpuRam: v }, updatedAt: nowISO() }))}
              options={admin.pc.cpuOptions}
            />
          </Field>
          <Field label="Operating System">
            <Select
              value={order.spec.os}
              onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, os: v }, updatedAt: nowISO() }))}
              options={admin.pc.osOptions}
            />
          </Field>
          <Field label="Has Touch">
            <Select
              value={order.spec.hasTouch}
              onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, hasTouch: v }, updatedAt: nowISO() }))}
              options={["Yes", "No"]}
            />
          </Field>
          {order.spec.hasTouch === "Yes" ? (
            <Field label="Touch Type">
              <Select
                value={order.spec.touchType}
                onChange={(v) =>
                  setOrder((o) => ({ ...o, spec: { ...o.spec, touchType: v }, updatedAt: nowISO() }))
                }
                options={admin.touch.types}
              />
            </Field>
          ) : null}

          <Field label="Enclosure Type">
            <Text
              value={order.spec.enclosureType}
              onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, enclosureType: v }, updatedAt: nowISO() }))}
            />
          </Field>
          <Field label="Color">
            <Text
              value={order.spec.color}
              onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, color: v }, updatedAt: nowISO() }))}
            />
          </Field>
          <Field label="Logo Text">
            <Text
              value={order.spec.logoText}
              onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, logoText: v }, updatedAt: nowISO() }))}
            />
          </Field>

          <Field label="Camera Model">
            <Select
              value={order.spec.cameraModel}
              onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, cameraModel: v }, updatedAt: nowISO() }))}
              options={admin.peripherals.cameras}
            />
          </Field>
          <Field label="Microphone Model">
            <Select
              value={order.spec.micModel}
              onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, micModel: v }, updatedAt: nowISO() }))}
              options={admin.peripherals.mics}
            />
          </Field>
          <Field label="Speaker Option">
            <Select
              value={order.spec.speakerModel}
              onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, speakerModel: v }, updatedAt: nowISO() }))}
              options={admin.peripherals.speakers}
            />
          </Field>
          <Field label="QR Scanner Model">
            <Select
              value={order.spec.qrModel}
              onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, qrModel: v }, updatedAt: nowISO() }))}
              options={admin.peripherals.qrScanners}
            />
          </Field>
          <Field label="Badge Printer Model">
            <Select
              value={order.spec.badgePrinterModel}
              onChange={(v) =>
                setOrder((o) => ({ ...o, spec: { ...o.spec, badgePrinterModel: v }, updatedAt: nowISO() }))
              }
              options={admin.peripherals.badgePrinters}
            />
          </Field>
          <Field label="Wall Mount">
            <Select
              value={order.spec.wallMount}
              onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, wallMount: v }, updatedAt: nowISO() }))}
              options={admin.peripherals.wallMounts}
            />
          </Field>
          <Field label="Grouped Peripherals">
            <div className="flex flex-wrap gap-2">
              {["mic", "speaker", "webcam", "qr"].map((k) => {
                const active = order.spec.peripherals.includes(k);
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() =>
                      setOrder((o) => {
                        const per = o.spec.peripherals;
                        const next = active ? per.filter((x) => x !== k) : [...per, k];
                        return { ...o, spec: { ...o.spec, peripherals: next }, updatedAt: nowISO() };
                      })
                    }
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm ${
                      active
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-300 bg-white text-gray-700"
                    }`}
                  >
                    {active ? <Check className="h-4 w-4" /> : null}
                    {k}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Labels Provided">
            <Select
              value={order.spec.labelsProvided}
              onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, labelsProvided: v }, updatedAt: nowISO() }))}
              options={["Yes", "No"]}
            />
          </Field>
          <Field label="Manual Provided">
            <Select
              value={order.spec.manualProvided}
              onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, manualProvided: v }, updatedAt: nowISO() }))}
              options={["Yes", "No"]}
            />
          </Field>
          <Field label="Proof Before Ship">
            <Select
              value={order.spec.proofBeforeShip}
              onChange={(v) =>
                setOrder((o) => ({ ...o, spec: { ...o.spec, proofBeforeShip: v }, updatedAt: nowISO() }))
              }
              options={["Yes", "No"]}
            />
          </Field>
          <Field label="Visual Proof">
            <Select
              value={order.spec.visualProof}
              onChange={(v) =>
                setOrder((o) => ({ ...o, spec: { ...o.spec, visualProof: v }, updatedAt: nowISO() }))
              }
              options={["Yes", "No"]}
            />
          </Field>
          <Field label="Packaging">
            <Select
              value={order.spec.packaging}
              onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, packaging: v }, updatedAt: nowISO() }))}
              options={admin.docs.packagingOptions}
            />
          </Field>
          <Field label="Certifications (comma-separated)">
            <Text
              value={order.spec.certifications}
              onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, certifications: v }, updatedAt: nowISO() }))}
            />
          </Field>
          <Field label="Origin Country">
            <Text
              value={order.spec.originCountry}
              onChange={(v) => setOrder((o) => ({ ...o, spec: { ...o.spec, originCountry: v }, updatedAt: nowISO() }))}
            />
          </Field>
          <Field label="Canadian Wiring Colors">
            <Select
              value={order.spec.canadIanWireColors}
              onChange={(v) =>
                setOrder((o) => ({ ...o, spec: { ...o.spec, canadIanWireColors: v }, updatedAt: nowISO() }))
              }
              options={["Yes", "No"]}
            />
          </Field>
          <Field label="No Substitutions">
            <Select
              value={order.spec.noSubstitutions}
              onChange={(v) =>
                setOrder((o) => ({ ...o, spec: { ...o.spec, noSubstitutions: v }, updatedAt: nowISO() }))
              }
              options={["Yes", "No"]}
            />
          </Field>
          <Field label="Warranty Years">
            <Text
              type="number"
              value={order.spec.warrantyYears}
              onChange={(v) =>
                setOrder((o) => ({ ...o, spec: { ...o.spec, warrantyYears: v }, updatedAt: nowISO() }))
              }
            />
          </Field>
        </Section>

        {/* Warnings */}
        {warnings.length ? (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-amber-900">
            <div className="font-semibold">Compliance warnings</div>
            <ul className="list-disc pl-5 text-sm">
              {warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Quote & Approvals */}
        <Section title="Quote & Approvals" icon={<BadgeCheck className="h-6 w-6 text-gray-800" />}>
          <Field
            label="Generate Quote"
            hint="Uses vendor estimator if available, otherwise falls back to local heuristic."
          >
            <button
              type="button"
              disabled={!canAdvanceToQuote}
              onClick={generateQuote}
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Generate Quote
            </button>
          </Field>

          <div className="md:col-span-2">
            <div className="rounded-lg border bg-gray-50 p-3 text-sm">
              {order.quote ? (
                <pre className="whitespace-pre-wrap">{JSON.stringify(order.quote, null, 2)}</pre>
              ) : (
                "No quote yet."
              )}
            </div>
          </div>

          <Field label="Client Acceptance">
            <button
              type="button"
              disabled={!canAccept}
              onClick={clientAccept}
              className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow hover:bg-gray-50 disabled:opacity-50"
            >
              Mark Client Accepted
            </button>
            {order.clientAcceptance ? (
              <p className="mt-2 text-xs text-gray-600">
                Accepted by {order.clientAcceptance.acceptedBy} at{" "}
                {new Date(order.clientAcceptance.acceptedAt).toLocaleString()}
              </p>
            ) : null}
          </Field>

          <Field label="CEO Approval">
            <div className="flex gap-2">
              <Text
                placeholder="CEO name"
                value={order.ceoApproval?.approvedBy}
                onChange={(v) =>
                  setOrder((o) => ({
                    ...o,
                    ceoApproval: { approvedBy: v, approvedAt: o.ceoApproval?.approvedAt || "", comment: o.ceoApproval?.comment || "" },
                  }))
                }
              />
              <Text
                placeholder="Approval note (optional)"
                value={order.ceoApproval?.comment}
                onChange={(v) =>
                  setOrder((o) => ({
                    ...o,
                    ceoApproval: { approvedBy: o.ceoApproval?.approvedBy || "", approvedAt: o.ceoApproval?.approvedAt || "", comment: v },
                  }))
                }
              />
              <button
                type="button"
                disabled={!canCEOApprove}
                onClick={() => ceoApprove(order.ceoApproval?.approvedBy || "CEO", order.ceoApproval?.comment || "")}
                className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow hover:bg-gray-50 disabled:opacity-50"
              >
                CEO Approve
              </button>
            </div>
            {order.status === "CEO_APPROVED" ? (
              <p className="mt-2 text-xs text-gray-600">
                Approved by {order.ceoApproval?.approvedBy} at{" "}
                {new Date(order.ceoApproval?.approvedAt || nowISO()).toLocaleString()}{" "}
                {order.ceoApproval?.comment ? `— ${order.ceoApproval?.comment}` : ""}
              </p>
            ) : null}
          </Field>
        </Section>

        {/* Vendor Order & Fulfillment */}
        <Section title="Vendor Order & Fulfillment" icon={<Factory className="h-6 w-6 text-gray-800" />}>
          <Field label="Place Vendor Order" hint="Requires CEO approval.">
            <div className="flex flex-col gap-2 md:flex-row">
              <Select
                value={order.vendorOrder?.vendor || "Alibaba"}
                onChange={(v) =>
                  setOrder((o) => ({ ...o, vendorOrder: { ...(o.vendorOrder || {}), vendor: v } }))
                }
                options={["Alibaba", "VendorX", "VendorY"]}
              />
              <Text
                placeholder="PO Number"
                value={order.vendorOrder?.poNumber}
                onChange={(v) =>
                  setOrder((o) => ({ ...o, vendorOrder: { ...(o.vendorOrder || {}), poNumber: v } }))
                }
              />
              <Text
                placeholder="Vendor Link (URL)"
                value={order.vendorOrder?.link}
                onChange={(v) =>
                  setOrder((o) => ({ ...o, vendorOrder: { ...(o.vendorOrder || {}), link: v } }))
                }
              />
              <button
                type="button"
                disabled={!canPlaceVendor}
                onClick={() =>
                  placeVendorOrder({
                    vendor: order.vendorOrder?.vendor || "Alibaba",
                    poNumber: order.vendorOrder?.poNumber || "",
                    link: order.vendorOrder?.link || "",
                  })
                }
                className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow hover:bg-gray-50 disabled:opacity-50"
              >
                Mark Vendor Order Placed
              </button>
            </div>
            {order.vendorOrder?.orderedAt ? (
              <div className="mt-2 text-xs text-gray-600">
                Ordered {new Date(order.vendorOrder.orderedAt).toLocaleString()}
              </div>
            ) : null}
          </Field>

          <Field label="Fulfillment Updates">
            <div className="flex flex-col gap-2 md:flex-row">
              <Text
                placeholder="Tracking #"
                value={order.fulfillment?.tracking}
                onChange={(v) =>
                  setOrder((o) => ({ ...o, fulfillment: { ...(o.fulfillment || {}), tracking: v } }))
                }
              />
              <Text
                placeholder="Carrier"
                value={order.fulfillment?.carrier}
                onChange={(v) =>
                  setOrder((o) => ({ ...o, fulfillment: { ...(o.fulfillment || {}), carrier: v } }))
                }
              />
              <Text
                placeholder="ETA (ISO or text)"
                value={order.fulfillment?.eta}
                onChange={(v) => setOrder((o) => ({ ...o, fulfillment: { ...(o.fulfillment || {}), eta: v } }))}
              />
              <button
                type="button"
                onClick={() => markFulfillment({})}
                className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow hover:bg-gray-50"
              >
                Save Fulfillment
              </button>
              <button
                type="button"
                onClick={() => markFulfillment({ deliveredAt: nowISO() })}
                className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow hover:bg-gray-50"
              >
                Mark Delivered
              </button>
            </div>
            {order.fulfillment ? (
              <div className="mt-2 text-xs text-gray-600">
                <div>Tracking: {order.fulfillment.tracking || "-"}</div>
                <div>Carrier: {order.fulfillment.carrier || "-"}</div>
                <div>ETA: {order.fulfillment.eta || "-"}</div>
                <div>
                  Delivered:{" "}
                  {order.fulfillment.deliveredAt
                    ? new Date(order.fulfillment.deliveredAt).toLocaleString()
                    : "-"}
                </div>
              </div>
            ) : null}
          </Field>
        </Section>

        {/* Payment (record only) */}
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
                  onChange={(v) =>
                    setOrder((o) => ({ ...o, payment: { ...o.payment, cardNumber: v }, updatedAt: nowISO() }))
                  }
                  placeholder="•••• •••• •••• 1234"
                />
              </Field>
              <Field label="Expiry (MM/YY)">
                <Text
                  value={order.payment.expiry}
                  onChange={(v) =>
                    setOrder((o) => ({ ...o, payment: { ...o.payment, expiry: v }, updatedAt: nowISO() }))
                  }
                  placeholder="MM/YY"
                />
              </Field>
              <Field label="CVV (optional)">
                <Text
                  value={order.payment.cvv}
                  onChange={(v) =>
                    setOrder((o) => ({ ...o, payment: { ...o.payment, cvv: v }, updatedAt: nowISO() }))
                  }
                  placeholder="123"
                />
              </Field>
            </>
          ) : (
            <Field label="PO Number">
              <Text
                value={order.payment.poNumber}
                onChange={(v) =>
                  setOrder((o) => ({ ...o, payment: { ...o.payment, poNumber: v }, updatedAt: nowISO() }))
                }
                placeholder="PO-12345"
              />
            </Field>
          )}
        </Section>

        {/* Audit trail */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="mb-2 text-lg font-semibold text-gray-900">Audit Trail</h2>
          <div className="overflow-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-gray-600">
                  <th className="py-1 pr-3">Time</th>
                  <th className="py-1 pr-3">By</th>
                  <th className="py-1 pr-3">Action</th>
                  <th className="py-1 pr-3">Detail</th>
                </tr>
              </thead>
              <tbody>
                {(order.audit || []).map((a, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-1 pr-3">{new Date(a.at).toLocaleString()}</td>
                    <td className="py-1 pr-3">{a.by}</td>
                    <td className="py-1 pr-3">{a.action}</td>
                    <td className="py-1 pr-3">{a.detail || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Admin Panel Modal */}
        {adminOpen ? <AdminPanelModal /> : null}

        <footer className="py-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Brand M3dia — Corporate Kiosk Order Workflow
        </footer>
      </div>
    </div>
  );
}
