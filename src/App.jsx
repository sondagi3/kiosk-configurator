import React, { useEffect, useMemo, useState } from "react";
import AdminPanel from "./components/AdminPanel.jsx";
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
   Save,
   RefreshCcw,
   Upload,
} from "lucide-react";

// Use env var in Vite if provided, else fallback (adjust for production)
const API_BASE = import.meta?.env?.VITE_API_BASE || "http://localhost:3001/api";

/* =========================================================================
   Brand M3dia – Corporate Kiosk Order Workflow (Single-file demo)
   Scope covered:
   1) Client Intake (captures client/company/contacts; PII kept minimal)
   2) Technical Specification (display/compute/touch/peripherals/docs/warranty)
   3) Quote/Estimate (local heuristic + optional vendor/Alibaba estimator)
   4) Client Acceptance (record date & name)
   5) CEO Approval (guardrail: cannot place vendor order before approval)
   6) Vendor Order (Alibaba or others; PO, link, order date)
   7) Fulfillment & Close (tracking, delivery confirmation)
   8) Persistence (localStorage), Export/Import JSON, Printable Quote
   =======================================================================*/

const ORDER_STATUSES = [
  "INTAKE",            // captured client & project basics
  "SPEC_REVIEW",       // spec defined & internally reviewed
  "QUOTE_SENT",        // quote generated and sent
  "CLIENT_ACCEPTED",   // client approved the quote
  "CEO_APPROVED",      // CEO confirms/approves final order spec & price
  "VENDOR_ORDERED",    // PO placed with vendor (Alibaba, etc.)
  "FULFILLMENT",       // in manufacturing/shipping
  "CLOSED",            // delivered/accepted
];

function nowISO() {
  return new Date().toISOString();
}

function uuid() {
  // small UUID for demo
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function App() {
  // ======================= Admin Spec (editable) =======================
  const defaultAdmin = {
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
    customFields: [],
  };

  const [admin, setAdmin] = useState(defaultAdmin);
  // Load saved admin spec on mount
React.useEffect(() => {
  try {
    const raw = localStorage.getItem("bm3_admin_spec");
    if (raw) setAdmin(JSON.parse(raw));
  } catch {}
}, []);

// Persist admin spec when changed
React.useEffect(() => {
  try {
    localStorage.setItem("bm3_admin_spec", JSON.stringify(admin));
  } catch {}
}, [admin]);


  // ======================= Client Intake =======================
  const initialClient = {
    clientName: "", // REQUIRED (corporate rule)
    company: "",
    email: "",
    phone: "",
    billingAddress: "",
    shippingAddress: "",
    projectName: "",
    notes: "",
  };

  // ======================= CEO Form (spec) ======================
  const yesNo = ["Yes", "No"];

  const initialSpec = {
    // Display
    displayBrand: "LG",
    size: defaultAdmin.display.sizeOptions[3], // 55-inch
    resolution: defaultAdmin.display.resolutionOptions[0],
    brightness: String(defaultAdmin.display.minBrightness),
    contrast: String(defaultAdmin.display.minContrast),
    // Compute/OS
    cpuRam: defaultAdmin.pc.cpuOptions[0],
    os: defaultAdmin.pc.osOptions[0],
    // Touch
    hasTouch: "Yes",
    touchType: defaultAdmin.touch.types[0],
    // Aesthetics
    enclosureType: "Wall-mount",
    color: "Black",
    logoText: "Brand M3dia",
    // Docs (derived defaults)
    labelsProvided: defaultAdmin.docs.labels ? "Yes" : "No",
    manualProvided: defaultAdmin.docs.manual ? "Yes" : "No",
    proofBeforeShip: defaultAdmin.docs.proofBeforeShip ? "Yes" : "No",
    visualProof: defaultAdmin.docs.visualProof ? "Yes" : "No",
    packaging: defaultAdmin.docs.packagingOptions[2] || defaultAdmin.docs.packagingOptions[0],
    certifications: defaultAdmin.docs.certifications.join(", "),
    originCountry: "",
    canadIanWireColors: defaultAdmin.docs.requireCanadianWiringColors ? "Yes" : "No",
    // Warranty
    noSubstitutions: defaultAdmin.warranty.noSubstitutions ? "Yes" : "No",
    warrantyYears: String(defaultAdmin.warranty.years),
    // Accessories
    cameraModel: defaultAdmin.peripherals.cameras[0],
    micModel: defaultAdmin.peripherals.mics[0],
    speakerModel: defaultAdmin.peripherals.speakers[0],
    qrModel: defaultAdmin.peripherals.qrScanners[0],
    badgePrinterModel: defaultAdmin.peripherals.badgePrinters[0],
    wallMount: defaultAdmin.peripherals.wallMounts[0],
    peripherals: ["mic", "speaker", "webcam", "qr"],
  };

  // ======================= Payment (client-side record) =======================
  const initialPayment = {
    method: "Credit Card",
    cardNumber: "",
    expiry: "",
    cvv: "",
    poNumber: "",
  };

  // ======================= Order State & Persistence =======================
  const [client, setClient] = useState(initialClient);
  const [spec, setSpec] = useState(initialSpec);
  const [payment, setPayment] = useState(initialPayment);

  // Order envelope (single source of truth for workflow)
  const blankOrder = useMemo(
    () => ({
      orderId: uuid(),
      status: "INTAKE",
      createdAt: nowISO(),
      updatedAt: nowISO(),
      client: initialClient,
      spec: initialSpec,
      payment: initialPayment,
      quote: null, // { subtotal, shipping, tax, total, estimator:"local|vendor", currency, notes }
      clientAcceptance: null, // { acceptedBy, acceptedAt }
      ceoApproval: null, // { approvedBy, approvedAt, comment }
      vendorOrder: null, // { vendor:"Alibaba|VendorX", poNumber, link, orderedAt }
      fulfillment: null, // { tracking, carrier, eta, deliveredAt }
      audit: [{ at: nowISO(), by: "system", action: "ORDER_CREATED" }],
    }),
    []
  );

  const [order, setOrder] = useState(blankOrder);

  // Mirror granular pieces into order (and vice-versa), keeping it simple
  useEffect(() => {
    setOrder((o) => ({ ...o, client }));
  }, [client]);

  useEffect(() => {
    setOrder((o) => ({ ...o, spec }));
  }, [spec]);

  useEffect(() => {
    setOrder((o) => ({ ...o, payment }));
  }, [payment]);

  // Autosave to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`bm3_order_${order.orderId}`, JSON.stringify(order));
      localStorage.setItem(`bm3_order_latest`, order.orderId);
    } catch {}
  }, [order]);

  // On load, restore latest order if present
  useEffect(() => {
    try {
      const latestId = localStorage.getItem("bm3_order_latest");
      if (!latestId) return;
      const raw = localStorage.getItem(`bm3_order_${latestId}`);
      if (raw) setOrder(JSON.parse(raw));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Basic helpers
  const updateClient = (k, v) => setClient((c) => ({ ...c, [k]: v }));
  const updateSpec = (k, v) => setSpec((s) => ({ ...s, [k]: v }));
  const updatePayment = (k, v) => setPayment((p) => ({ ...p, [k]: v }));

  function log(by, action, detail) {
    setOrder((o) => ({
      ...o,
      updatedAt: nowISO(),
      audit: [...(o.audit || []), { at: nowISO(), by, action, detail }],
    }));
  }

  // ======================= Compliance / Guardrails =======================
  const warnings = useMemo(() => {
    const list = [];
    if (!admin.display.allowedBrands.includes(spec.displayBrand)) {
      list.push(`Display brand must be one of: ${admin.display.allowedBrands.join(", ")}`);
    }
    if (parseInt(spec.brightness || "0", 10) < admin.display.minBrightness) {
      list.push(`Brightness below minimum (${admin.display.minBrightness} nits).`);
    }
    if (parseInt(spec.contrast || "0", 10) < admin.display.minContrast) {
      list.push(`Contrast below minimum (${admin.display.minContrast}:1).`);
    }
    if (spec.hasTouch === "Yes" && !admin.touch.types.includes(spec.touchType)) {
      list.push(`Touch type must be one of: ${admin.touch.types.join(", ")}`);
    }
    if (!client.clientName?.trim()) {
      list.push("Client Name is required (corporate standard).");
    }
    return list;
  }, [spec, admin, client]);

  // ======================= Estimator (Local + Optional Vendor) =======================
  // Very simple local heuristics for demo (replace with your real margin table)
  function localEstimate(spec) {
    const baseDisplay = /55/.test(spec.size) ? 650 : 520; // demo size-based difference
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
    // Optional server call (implement with Alibaba or supplier APIs)
    // Expected server contract:
    // POST /vendor/estimate -> { items:[{sku,qty}], spec:{...} } => { currency, subtotal, shipping, tax, total, vendorNotes }
    try {
      const r = await fetch(`${API_BASE}/vendor/estimate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spec }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return await r.json();
    } catch (e) {
      return null; // fall back to local
    }
  }

  async function generateQuote() {
    if (!client.clientName?.trim()) {
      alert("Client Name is required before quoting.");
      return;
    }
    // try vendor first; fallback to local
    const vendor = await vendorEstimate(spec);
    const base = vendor || localEstimate(spec);
    setOrder((o) => ({ ...o, quote: base, status: "QUOTE_SENT", updatedAt: nowISO() }));
    log("system", "QUOTE_GENERATED", base.estimator);
  }

  function clientAccept(name) {
    if (!order.quote) return alert("Generate a quote first.");
    const acceptedBy = name?.trim() || client.clientName;
    if (!acceptedBy) return alert("Client name is required to accept.");
    setOrder((o) => ({
      ...o,
      status: "CLIENT_ACCEPTED",
      clientAcceptance: { acceptedBy, acceptedAt: nowISO() },
      updatedAt: nowISO(),
    }));
    log(acceptedBy, "CLIENT_ACCEPTED");
  }

  function ceoApprove(ceoName, comment) {
    if (order.status !== "CLIENT_ACCEPTED") {
      return alert("Client must accept the quote before CEO approval.");
    }
    const approvedBy = ceoName?.trim() || "CEO";
    setOrder((o) => ({
      ...o,
      status: "CEO_APPROVED",
      ceoApproval: { approvedBy, approvedAt: nowISO(), comment: comment || "" },
      updatedAt: nowISO(),
    }));
    log(approvedBy, "CEO_APPROVED", comment || "");
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
    }));
    log("operations", "VENDOR_ORDER_PLACED", `${vendor} ${poNumber || ""}`);
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
        tracking: tracking || o.fulfillment?.tracking || "",
        carrier: carrier || o.fulfillment?.carrier || "",
        eta: eta || o.fulfillment?.eta || "",
        deliveredAt: deliveredAt || o.fulfillment?.deliveredAt || null,
      },
      updatedAt: nowISO(),
    }));
    log("operations", deliveredAt ? "DELIVERED" : "FULFILLMENT_UPDATE");
  }

  function resetNewOrder() {
    const fresh = {
      ...blankOrder,
      orderId: uuid(),
      createdAt: nowISO(),
      updatedAt: nowISO(),
      client: initialClient,
      spec: initialSpec,
      payment: initialPayment,
    };
    setClient(initialClient);
    setSpec(initialSpec);
    setPayment(initialPayment);
    setOrder(fresh);
  }

  // ======================= UI Helpers =======================
  const Select = ({ value, onChange, options }) => (
    <div className="relative">
      <select
        value={value}
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

  const Text = ({ value, onChange, type = "text", placeholder }) => (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      type={type}
      placeholder={placeholder}
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

  const MultiSelect = () => {
    const keys = ["mic", "speaker", "webcam", "qr"];
    return (
      <div className="flex flex-wrap gap-2">
        {keys.map((k) => {
          const active = spec.peripherals.includes(k);
          return (
            <button
              key={k}
              type="button"
              onClick={() =>
                updateSpec(
                  "peripherals",
                  active ? spec.peripherals.filter((x) => x !== k) : [...spec.peripherals, k]
                )
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
    );
  };

  // ======================= Export / Import / Print =======================
  const exportOrder = () => {
    const blob = new Blob([JSON.stringify(order, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bm3_order_${order.orderId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importOrder = (raw) => {
    try {
      const parsed = JSON.parse(raw);
      if (!parsed?.orderId) return alert("Invalid order JSON.");
      setOrder(parsed);
      setClient(parsed.client || initialClient);
      setSpec(parsed.spec || initialSpec);
      setPayment(parsed.payment || initialPayment);
      log("system", "ORDER_IMPORTED", parsed.orderId);
    } catch {
      alert("Invalid JSON");
    }
  };

  const printQuote = () => {
    if (!order.quote) return alert("Generate a quote first.");
    const lines = [];
    lines.push(`${admin.orgName} – Quotation`);
    lines.push(`Order ID: ${order.orderId}`);
    lines.push(`Client: ${client.clientName} (${client.company || "-"})`);
    lines.push(`Project: ${client.projectName || "-"}`);
    lines.push(`Date: ${new Date().toLocaleString()}`);
    lines.push("\nSpecification:");
    lines.push(
      `Brand: ${spec.displayBrand}; Size: ${spec.size}; Res: ${spec.resolution}; Brightness: ${spec.brightness}; Contrast: ${spec.contrast}`
    );
    lines.push(`Compute: ${spec.cpuRam}; OS: ${spec.os}; Touch: ${spec.hasTouch} (${spec.touchType})`);
    lines.push(
      `Accessories: Cam=${spec.cameraModel}; Mic=${spec.micModel}; Speaker=${spec.speakerModel}; QR=${spec.qrModel}; Badge=${spec.badgePrinterModel}; WM=${spec.wallMount}`
    );
    lines.push(`Packaging: ${spec.packaging}; Certs: ${spec.certifications}`);
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
  };

  // ======================= Render =======================
  const canAdvanceToQuote = warnings.length === 0 && client.clientName?.trim();
  const canAccept = order.quote && order.status === "QUOTE_SENT";
  const canCEOApprove = order.status === "CLIENT_ACCEPTED";
  const canPlaceVendor = order.status === "CEO_APPROVED";

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{admin.orgName} – Kiosk Orders</h1>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={exportOrder}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Download className="h-4 w-4" /> Export Order
            </button>
            <button
              onClick={printQuote}
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
          </div>
        </header>

        {/* Status ribbon */}
        <div className="rounded-xl border border-gray-200 bg-white p-3 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">Order ID:</span> {order.orderId}
            <span className="mx-2 h-4 w-px bg-gray-300" />
            <span className="font-semibold">Status:</span>{" "}
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-blue-700">
              {order.status}
            </span>
            <span className="mx-2 h-4 w-px bg-gray-300" />
            <span className="text-gray-500">Updated: {new Date(order.updatedAt).toLocaleString()}</span>
          </div>
        </div>

        {/* Client Intake */}
        <Section title="Client Intake" icon={<Building2 className="h-6 w-6 text-gray-800" />}>
          <Field label="Client Name (required)">
            <Text value={client.clientName} onChange={(v) => updateClient("clientName", v)} />
          </Field>
          <Field label="Company">
            <Text value={client.company} onChange={(v) => updateClient("company", v)} />
          </Field>
          <Field label="Email">
            <Text type="email" value={client.email} onChange={(v) => updateClient("email", v)} />
          </Field>
          <Field label="Phone">
            <Text value={client.phone} onChange={(v) => updateClient("phone", v)} />
          </Field>
          <Field label="Billing Address">
            <Text value={client.billingAddress} onChange={(v) => updateClient("billingAddress", v)} />
          </Field>
          <Field label="Shipping Address">
            <Text value={client.shippingAddress} onChange={(v) => updateClient("shippingAddress", v)} />
          </Field>
          <Field label="Project Name">
            <Text value={client.projectName} onChange={(v) => updateClient("projectName", v)} />
          </Field>
          <Field label="Notes">
            <Text value={client.notes} onChange={(v) => updateClient("notes", v)} />
          </Field>
        </Section>

        {/* Specification */}
        <Section title="Specification" icon={<Monitor className="h-6 w-6 text-gray-800" />}>
          <Field label="Brand"><Select value={spec.displayBrand} onChange={(v)=> updateSpec("displayBrand", v)} options={admin.display.allowedBrands} /></Field>
          <Field label="Size"><Select value={spec.size} onChange={(v)=> updateSpec("size", v)} options={admin.display.sizeOptions} /></Field>
          <Field label="Resolution"><Select value={spec.resolution} onChange={(v)=> updateSpec("resolution", v)} options={admin.display.resolutionOptions} /></Field>
          <Field label="Brightness (nits)"><Text type="number" value={spec.brightness} onChange={(v)=> updateSpec("brightness", v)} /></Field>
          <Field label="Contrast"><Text type="number" value={spec.contrast} onChange={(v)=> updateSpec("contrast", v)} /></Field>
          <Field label="Compute Spec"><Select value={spec.cpuRam} onChange={(v)=> updateSpec("cpuRam", v)} options={admin.pc.cpuOptions} /></Field>
          <Field label="Operating System"><Select value={spec.os} onChange={(v)=> updateSpec("os", v)} options={admin.pc.osOptions} /></Field>
          <Field label="Has Touch"><Select value={spec.hasTouch} onChange={(v)=> updateSpec("hasTouch", v)} options={yesNo} /></Field>
          {spec.hasTouch === "Yes" ? (
            <Field label="Touch Type"><Select value={spec.touchType} onChange={(v)=> updateSpec("touchType", v)} options={admin.touch.types} /></Field>
          ) : null}
          <Field label="Enclosure Type"><Text value={spec.enclosureType} onChange={(v)=> updateSpec("enclosureType", v)} /></Field>
          <Field label="Color"><Text value={spec.color} onChange={(v)=> updateSpec("color", v)} /></Field>
          <Field label="Logo Text"><Text value={spec.logoText} onChange={(v)=> updateSpec("logoText", v)} /></Field>

          <Field label="Camera Model"><Select value={spec.cameraModel} onChange={(v)=> updateSpec("cameraModel", v)} options={admin.peripherals.cameras} /></Field>
          <Field label="Microphone Model"><Select value={spec.micModel} onChange={(v)=> updateSpec("micModel", v)} options={admin.peripherals.mics} /></Field>
          <Field label="Speaker Option"><Select value={spec.speakerModel} onChange={(v)=> updateSpec("speakerModel", v)} options={admin.peripherals.speakers} /></Field>
          <Field label="QR Scanner Model"><Select value={spec.qrModel} onChange={(v)=> updateSpec("qrModel", v)} options={admin.peripherals.qrScanners} /></Field>
          <Field label="Badge Printer Model"><Select value={spec.badgePrinterModel} onChange={(v)=> updateSpec("badgePrinterModel", v)} options={admin.peripherals.badgePrinters} /></Field>
          <Field label="Wall Mount"><Select value={spec.wallMount} onChange={(v)=> updateSpec("wallMount", v)} options={admin.peripherals.wallMounts} /></Field>
          <Field label="Grouped Peripherals"><MultiSelect /></Field>

          <Field label="Labels Provided"><Select value={spec.labelsProvided} onChange={(v)=> updateSpec("labelsProvided", v)} options={yesNo} /></Field>
          <Field label="Manual Provided"><Select value={spec.manualProvided} onChange={(v)=> updateSpec("manualProvided", v)} options={yesNo} /></Field>
          <Field label="Proof Before Ship"><Select value={spec.proofBeforeShip} onChange={(v)=> updateSpec("proofBeforeShip", v)} options={yesNo} /></Field>
          <Field label="Visual Proof"><Select value={spec.visualProof} onChange={(v)=> updateSpec("visualProof", v)} options={yesNo} /></Field>
          <Field label="Packaging"><Select value={spec.packaging} onChange={(v)=> updateSpec("packaging", v)} options={admin.docs.packagingOptions} /></Field>
          <Field label="Certifications (comma-separated)"><Text value={spec.certifications} onChange={(v)=> updateSpec("certifications", v)} /></Field>
          <Field label="Origin Country"><Text value={spec.originCountry} onChange={(v)=> updateSpec("originCountry", v)} /></Field>
          <Field label="Canadian Wiring Colors"><Select value={spec.canadIanWireColors} onChange={(v)=> updateSpec("canadIanWireColors", v)} options={yesNo} /></Field>
          <Field label="No Substitutions"><Select value={spec.noSubstitutions} onChange={(v)=> updateSpec("noSubstitutions", v)} options={yesNo} /></Field>
          <Field label="Warranty Years"><Text type="number" value={spec.warrantyYears} onChange={(v)=> updateSpec("warrantyYears", v)} /></Field>
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

        {/* Quote */}
        <Section title="Quote & Estimate" icon={<BadgeCheck className="h-6 w-6 text-gray-800" />}>
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
        </Section>

        {/* Client Acceptance & CEO Approval */}
        <Section title="Approvals" icon={<Cpu className="h-6 w-6 text-gray-800" />}>
          <Field label="Client Acceptance">
            <button
              type="button"
              disabled={!canAccept}
              onClick={() => {
                const name = prompt("Confirm accepting client name:", client.clientName || "");
                if (name) clientAccept(name);
              }}
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
            <button
              type="button"
              disabled={!canCEOApprove}
              onClick={() => {
                const ceo = prompt("CEO name:", "CEO");
                const note = prompt("Approval note (optional):", "");
                if (ceo) ceoApprove(ceo, note || "");
              }}
              className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow hover:bg-gray-50 disabled:opacity-50"
            >
              CEO Approve
            </button>
            {order.ceoApproval ? (
              <p className="mt-2 text-xs text-gray-600">
                Approved by {order.ceoApproval.approvedBy} at{" "}
                {new Date(order.ceoApproval.approvedAt).toLocaleString()}
                {order.ceoApproval.comment ? ` — ${order.ceoApproval.comment}` : ""}
              </p>
            ) : null}
          </Field>
        </Section>

        {/* Vendor Order */}
        <Section title="Vendor Order" icon={<Factory className="h-6 w-6 text-gray-800" />}>
          <Field label="Place Vendor Order" hint="Requires CEO approval.">
            <button
              type="button"
              disabled={!canPlaceVendor}
              onClick={() => {
                const vendor = prompt("Vendor (Alibaba or Other):", "Alibaba");
                const po = prompt("PO Number:", "");
                const link = prompt("Vendor Link (Alibaba URL or portal):", "");
                placeVendorOrder({ vendor, poNumber: po, link });
              }}
              className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow hover:bg-gray-50 disabled:opacity-50"
            >
              Mark Vendor Order Placed
            </button>
            {order.vendorOrder ? (
              <div className="mt-2 text-xs text-gray-600">
                <div>Vendor: {order.vendorOrder.vendor}</div>
                <div>PO: {order.vendorOrder.poNumber || "-"}</div>
                <div>Link: {order.vendorOrder.link || "-"}</div>
                <div>Ordered: {new Date(order.vendorOrder.orderedAt).toLocaleString()}</div>
              </div>
            ) : null}
          </Field>

          <Field label="Fulfillment Updates">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  const tracking = prompt("Tracking #", order.fulfillment?.tracking || "");
                  const carrier = prompt("Carrier", order.fulfillment?.carrier || "DHL");
                  const eta = prompt("ETA (ISO or text)", order.fulfillment?.eta || "");
                  markFulfillment({ tracking, carrier, eta });
                }}
                className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow hover:bg-gray-50"
              >
                Update Tracking/ETA
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

        {/* Payment (record only; do not store secrets in production) */}
        <Section title="Payment (Record)" icon={<CreditCard className="h-6 w-6 text-gray-800" />}>
          <Field label="Method">
            <Select
              value={payment.method}
              onChange={(v) => updatePayment("method", v)}
              options={["Credit Card", "Purchase Order"]}
            />
          </Field>
          {payment.method === "Credit Card" ? (
            <>
              <Field label="Card Number (last 4 OK)">
                <Text
                  value={payment.cardNumber}
                  onChange={(v) => updatePayment("cardNumber", v)}
                  placeholder="•••• •••• •••• 1234"
                />
              </Field>
              <Field label="Expiry (MM/YY)">
                <Text value={payment.expiry} onChange={(v) => updatePayment("expiry", v)} placeholder="MM/YY" />
              </Field>
              <Field label="CVV (optional)">
                <Text value={payment.cvv} onChange={(v) => updatePayment("cvv", v)} placeholder="123" />
              </Field>
            </>
          ) : (
            <Field label="PO Number">
              <Text value={payment.poNumber} onChange={(v) => updatePayment("poNumber", v)} placeholder="PO-12345" />
            </Field>
          )}
        </Section>

        {/* Audit log */}
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

        {/* Admin JSON import/export */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Admin Utilities</h3>
            <button
              type="button"
              onClick={() => {
                const raw = prompt("Paste order JSON here to import:");
                if (raw) importOrder(raw);
              }}
              className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Import Order JSON
            </button>
          </div>
          <p className="text-xs text-gray-600">
            Tip: Export an order after each major step to keep a signed record with the client and the CEO.
          </p>
        </div>

        <footer className="py-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Brand M3dia — Corporate Kiosk Order Workflow
        </footer>
      </div>
    </div>
  );
}
