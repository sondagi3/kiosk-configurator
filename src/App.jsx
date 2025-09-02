import React, { useMemo, useState } from "react";
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
} from "lucide-react";

// Use env var in Vite if provided, else fallback (adjust for production)
const API_BASE = import.meta?.env?.VITE_API_BASE || "http://localhost:3001/api";

/* =========================================================================
   Brand M3dia – One-Stop Kiosk Configurator
   - CEO Mode + Admin Mode (full spec editor)
   - Live compliance warnings
   - Export / Import / Print
   - API stubs for health, pricing, quotes
   =======================================================================*/

export default function App() {
  // ======================= Admin Spec (editable) =======================
  const defaultAdmin = {
    orgName: "Brand M3dia",
    // Procurement constraints
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
      requiredIf: "kiosk", // demo flag: not enforced, used for warning copy
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
    customFields: [], // example: [{ key: "SiteCode", type: "text", defaultValue: "" }]
  };

  const [admin, setAdmin] = useState(defaultAdmin);

  // ======================= CEO Form (user-facing) ======================
  const yesNo = ["Yes", "No"];

  const initial = {
    // Company / contact
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    projectName: "",

    // Display
    displayBrand: "LG",
    size: admin.display.sizeOptions[3], // default 55-inch
    resolution: admin.display.resolutionOptions[0],
    brightness: String(admin.display.minBrightness),
    contrast: String(admin.display.minContrast),

    // Compute / OS
    cpuRam: admin.pc.cpuOptions[0],
    os: admin.pc.osOptions[0],

    // Touch
    hasTouch: "Yes",
    touchType: admin.touch.types[0],

    // Aesthetics / enclosure
    enclosureType: "Wall-mount",
    color: "Black",
    logoText: "Brand M3dia",

    // Docs (derive Yes/No from admin)
    labelsProvided: admin.docs.labels ? "Yes" : "No",
    manualProvided: admin.docs.manual ? "Yes" : "No",
    proofBeforeShip: admin.docs.proofBeforeShip ? "Yes" : "No",
    visualProof: admin.docs.visualProof ? "Yes" : "No",
    packaging: admin.docs.packagingOptions[2] || admin.docs.packagingOptions[0],
    certifications: admin.docs.certifications.join(", "),
    originCountry: "",
    canadIanWireColors: admin.docs.requireCanadianWiringColors ? "Yes" : "No",

    // Warranty
    noSubstitutions: admin.warranty.noSubstitutions ? "Yes" : "No",
    warrantyYears: String(admin.warranty.years),

    // Accessories (detailed)
    cameraModel: admin.peripherals.cameras[0],
    micModel: admin.peripherals.mics[0],
    speakerModel: admin.peripherals.speakers[0],
    qrModel: admin.peripherals.qrScanners[0],
    badgePrinterModel: admin.peripherals.badgePrinters[0],
    wallMount: admin.peripherals.wallMounts[0],

    // Legacy multi-select keys list (for demo presentation only)
    peripherals: ["mic", "speaker", "webcam", "qr"],
  };

  const [form, setForm] = useState(initial);

  // ======================= Payment =======================
  const initialPayment = {
    method: "Credit Card",
    cardNumber: "",
    expiry: "",
    cvv: "",
    poNumber: "",
  };
  const [payment, setPayment] = useState(initialPayment);

  // ======================= UI State =======================
  const [adminOpen, setAdminOpen] = useState(false);
  const [peripheralOpen, setPeripheralOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [summary, setSummary] = useState("");
  const [importText, setImportText] = useState("");

  // API & pricing state
  const [apiHealth, setApiHealth] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [quoteResp, setQuoteResp] = useState(null);
  const [cfgId, setCfgId] = useState(""); // paste a real configuration UUID when you have one
  const [apiError, setApiError] = useState(null);

  // ======================= Helpers =======================
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const updatePayment = (k, v) => setPayment((p) => ({ ...p, [k]: v }));

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

  const Field = ({ label, children }) => (
    <label className="block">
      <div className="mb-1 text-sm font-medium text-gray-700">{label}</div>
      {children}
    </label>
  );

  const MultiSelect = () => {
    const keys = ["mic", "speaker", "webcam", "qr"];
    return (
      <div className="flex flex-wrap gap-2">
        {keys.map((k) => {
          const active = form.peripherals.includes(k);
          return (
            <button
              key={k}
              type="button"
              onClick={() =>
                update(
                  "peripherals",
                  active ? form.peripherals.filter((x) => x !== k) : [...form.peripherals, k]
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

  const selectedPeripheralNames = useMemo(() => {
    const map = {
      mic: form.micModel,
      speaker: form.speakerModel,
      webcam: form.cameraModel,
      qr: form.qrModel,
    };
    return form.peripherals.map((k) => map[k]).filter(Boolean).join(", ");
  }, [form]);

  const warnings = useMemo(() => {
    const w = [];
    if (!admin.display.allowedBrands.includes(form.displayBrand)) {
      w.push(`Display brand must be one of: ${admin.display.allowedBrands.join(", ")}`);
    }
    if (parseInt(form.brightness || "0", 10) < admin.display.minBrightness) {
      w.push(`Brightness below minimum (${admin.display.minBrightness} nits).`);
    }
    if (parseInt(form.contrast || "0", 10) < admin.display.minContrast) {
      w.push(`Contrast below minimum (${admin.display.minContrast}:1).`);
    }
    if (form.hasTouch === "Yes" && !admin.touch.types.includes(form.touchType)) {
      w.push(`Touch type must be one of: ${admin.touch.types.join(", ")}`);
    }
    return w;
  }, [form, admin]);

  const generateSummary = () => {
    const f = form;
    const lines = [];

    // Header
    lines.push(`${admin.orgName} – Kiosk Configuration`);
    lines.push(`Project: ${f.projectName || "(unnamed)"}\n`);

    // Company
    lines.push("1) Company & Contact:");
    lines.push(`• Company: ${f.companyName || "(none)"}; Contact: ${f.contactName || "(none)"}`);
    lines.push(`• Email: ${f.email || "(none)"}; Phone: ${f.phone || "(none)"}\n`);

    // Display
    lines.push("2) Display:");
    lines.push(
      `• Brand: ${f.displayBrand}; Size: ${f.size}; Res: ${f.resolution}; ` +
        `Brightness: ${f.brightness} nits; Contrast: ${f.contrast}:1\n`
    );

    // Compute
    lines.push("3) Compute / OS:");
    lines.push(`• Spec: ${f.cpuRam}; OS: ${f.os}\n`);

    // Touch
    lines.push("4) Touch:");
    lines.push(`• Has Touch: ${f.hasTouch}; Type: ${f.hasTouch === "Yes" ? f.touchType : "-" }\n`);

    // Enclosure
    lines.push("5) Enclosure & Branding:");
    lines.push(`• Enclosure: ${f.enclosureType}; Color: ${f.color}; Logo: ${f.logoText}\n`);

    // Docs
    lines.push("6) Documentation & QA:");
    lines.push(
      `• Labels: ${f.labelsProvided}; Manual: ${f.manualProvided}; Proof before ship: ${f.proofBeforeShip}; Visual proof: ${f.visualProof}`
    );
    lines.push(
      `• Packaging: ${f.packaging}; Certs: ${f.certifications}; Origin: ${f.originCountry || "(TBD)"}; Canadian wiring colors: ${f.canadIanWireColors}\n`
    );

    // Warranty
    lines.push("7) Substitution & Warranty:");
    lines.push(`• No substitutions: ${f.noSubstitutions}; Warranty (years): ${f.warrantyYears}\n`);

    // Accessories
    lines.push("8) Accessories & Integration:");
    lines.push(
      `• Camera: ${f.cameraModel}; Mic: ${f.micModel}; Speakers: ${f.speakerModel}`
    );
    lines.push(
      `• QR Scanner: ${f.qrModel}; Badge Printer: ${f.badgePrinterModel}; Wall Mount: ${f.wallMount}`
    );
    lines.push(`• Grouped: ${selectedPeripheralNames}\n`);

    // Payment (redacted)
    lines.push("9) Payment:");
    lines.push(`• Method: ${payment.method}`);
    if (payment.method === "Credit Card") {
      const last4 = payment.cardNumber ? payment.cardNumber.replace(/\s+/g, "").slice(-4) : "----";
      lines.push(`• Card Ending: ${last4}`);
    } else if (payment.method === "Purchase Order") {
      lines.push(`• PO Number: ${payment.poNumber || "(none)"}`);
    }

    // Pricing
    if (pricing) {
      lines.push("\n10) Pricing:");
      lines.push(`• Subtotal: ${pricing.subtotal}`);
      if ("shipping_total" in pricing) lines.push(`• Shipping: ${pricing.shipping_total}`);
      if ("tax_total" in pricing) lines.push(`• Tax: ${pricing.tax_total}`);
      lines.push(`• Grand Total: ${pricing.grand_total ?? pricing.subtotal}`);
    }

    // Warnings
    if (warnings.length) {
      lines.push("\nCompliance Warnings:");
      warnings.forEach((m) => lines.push(`• ${m}`));
    }

    return lines.join("\n");
  };

  // ======================= API Helpers (optional) ======================
  // Demo SKU mapping for pricing/quotes (matches example seed)
  function buildSelectionJson() {
    const size = String(form.size || "").toLowerCase();
    let displaySku = "DISP-24-TOUCH";
    if (size.includes("32")) displaySku = "DISP-24-TOUCH";
    if (size.includes("43")) displaySku = "DISP-24-TOUCH";
    if (size.includes("49")) displaySku = "DISP-24-TOUCH";
    if (size.includes("55")) displaySku = "DISP-24-TOUCH";

    const pcSku = form.cpuRam.includes("i5") ? "PC-NUC-I5" : "PC-NUC-I5";
    const touchSku = form.hasTouch === "Yes" ? "TOUCH-KIT-PCAP" : null;

    return {
      items: [
        { sku: displaySku, qty: 1 },
        { sku: pcSku, qty: 1 },
        ...(touchSku ? [{ sku: touchSku, qty: 1 }] : []),
      ],
    };
  }

  async function handleHealth() {
    setApiError(null);
    try {
      const r = await fetch(`${API_BASE}/health`);
      const j = await r.json();
      setApiHealth(j);
    } catch (e) {
      setApiHealth(null);
      setApiError(`Health check failed: ${e.message}`);
    }
  }

  async function handleCalculatePrice() {
    setIsSubmitting(true);
    setApiError(null);
    setPricing(null);
    try {
      const sel = buildSelectionJson();
      const r = await fetch(`${API_BASE}/pricing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sel),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      setPricing(j);
    } catch (e) {
      setApiError(`Pricing failed: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCreateQuote() {
    setIsSubmitting(true);
    setApiError(null);
    setQuoteResp(null);
    try {
      if (!cfgId.trim()) throw new Error("Enter a configurationId (UUID)");
      const r = await fetch(`${API_BASE}/quotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configurationId: cfgId.trim() }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = await r.json();
      setQuoteResp(j);
    } catch (e) {
      setApiError(`Create quote failed: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  // ======================= Export / Import / Print =====================
  const exportConfig = () => {
    const payload = { type: "config", admin, form, payment };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "brand-m3dia-kiosk-config.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAdmin = () => {
    const payload = { type: "admin-spec", admin };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "brand-m3dia-admin-spec.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = () => {
    try {
      const parsed = JSON.parse(importText);
      if (parsed.type === "admin-spec" && parsed.admin) setAdmin(parsed.admin);
      if (parsed.type === "config" && parsed.form && parsed.admin) {
        setAdmin(parsed.admin);
        setForm(parsed.form);
        if (parsed.payment) setPayment(parsed.payment);
      }
      alert("Imported successfully.");
    } catch (e) {
      alert("Invalid JSON");
    }
  };

  const printSummary = () => {
    const s = generateSummary();
    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) return;
    const safe = s.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    w.document.write(
      `<!doctype html><html><head><meta charset='utf-8'><title>${admin.orgName} – Kiosk Summary</title><style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif;white-space:pre-wrap;padding:24px;}</style></head><body>${safe}</body></html>`
    );
    w.document.close();
    w.focus();
    w.print();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      setSummary(generateSummary());
      setModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAll = () => {
    setForm({ ...initial });
    setPayment({ ...initialPayment });
  };

  // ======================= Render =======================
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            {admin.orgName} – Kiosk Configurator
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={exportConfig}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Download className="h-4 w-4" /> Export Config
            </button>
            <button
              onClick={printSummary}
              className="inline-flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-2 text-sm font-medium text-white hover:bg-black"
            >
              <Printer className="h-4 w-4" /> Print
            </button>
          </div>
        </header>

        {/* CEO Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Section title="Company & Contact" icon={<ShoppingCart className="h-6 w-6 text-gray-800" />}>
            <Field label="Company Name"><Text value={form.companyName} onChange={(v) => update("companyName", v)} /></Field>
            <Field label="Contact Name"><Text value={form.contactName} onChange={(v) => update("contactName", v)} /></Field>
            <Field label="Email"><Text type="email" value={form.email} onChange={(v) => update("email", v)} /></Field>
            <Field label="Phone"><Text value={form.phone} onChange={(v) => update("phone", v)} /></Field>
            <Field label="Project Name"><Text value={form.projectName} onChange={(v) => update("projectName", v)} /></Field>
          </Section>

          <Section title="Display" icon={<Monitor className="h-6 w-6 text-gray-800" />}>
            <Field label="Brand"><Select value={form.displayBrand} onChange={(v)=> update("displayBrand", v)} options={admin.display.allowedBrands} /></Field>
            <Field label="Size"><Select value={form.size} onChange={(v)=> update("size", v)} options={admin.display.sizeOptions} /></Field>
            <Field label="Resolution"><Select value={form.resolution} onChange={(v)=> update("resolution", v)} options={admin.display.resolutionOptions} /></Field>
            <Field label="Brightness (nits)"><Text type="number" value={form.brightness} onChange={(v)=> update("brightness", v)} /></Field>
            <Field label="Contrast (e.g. 1000)"><Text type="number" value={form.contrast} onChange={(v)=> update("contrast", v)} /></Field>
          </Section>

          <Section title="Compute & OS" icon={<Cpu className="h-6 w-6 text-gray-800" />}>
            <Field label="Spec"><Select value={form.cpuRam} onChange={(v)=> update("cpuRam", v)} options={admin.pc.cpuOptions} /></Field>
            <Field label="OS"><Select value={form.os} onChange={(v)=> update("os", v)} options={admin.pc.osOptions} /></Field>
          </Section>

          <Section title="Touch" icon={<Smartphone className="h-6 w-6 text-gray-800" />}>
            <Field label="Has Touch"><Select value={form.hasTouch} onChange={(v)=> update("hasTouch", v)} options={yesNo} /></Field>
            {form.hasTouch === "Yes" && (
              <Field label="Touch Type"><Select value={form.touchType} onChange={(v)=> update("touchType", v)} options={admin.touch.types} /></Field>
            )}
          </Section>

          <Section title="Enclosure & Branding" icon={<Settings className="h-6 w-6 text-gray-800" />}>
            <Field label="Enclosure Type"><Text value={form.enclosureType} onChange={(v)=> update("enclosureType", v)} /></Field>
            <Field label="Color"><Text value={form.color} onChange={(v)=> update("color", v)} /></Field>
            <Field label="Logo Text"><Text value={form.logoText} onChange={(v)=> update("logoText", v)} /></Field>
          </Section>

          <Section title="Accessories" icon={<Settings className="h-6 w-6 text-gray-800" />}>
            <Field label="Camera Model"><Select value={form.cameraModel} onChange={(v)=> update("cameraModel", v)} options={admin.peripherals.cameras} /></Field>
            <Field label="Microphone Model"><Select value={form.micModel} onChange={(v)=> update("micModel", v)} options={admin.peripherals.mics} /></Field>
            <Field label="Speaker Option"><Select value={form.speakerModel} onChange={(v)=> update("speakerModel", v)} options={admin.peripherals.speakers} /></Field>
            <Field label="QR Scanner Model"><Select value={form.qrModel} onChange={(v)=> update("qrModel", v)} options={admin.peripherals.qrScanners} /></Field>
            <Field label="Badge Printer Model"><Select value={form.badgePrinterModel} onChange={(v)=> update("badgePrinterModel", v)} options={admin.peripherals.badgePrinters} /></Field>
            <Field label="Wall Mount"><Select value={form.wallMount} onChange={(v)=> update("wallMount", v)} options={admin.peripherals.wallMounts} /></Field>
            <Field label="Grouped Peripherals (legacy)"><MultiSelect /></Field>
          </Section>

          {/* Admin Docs derived to CEO form for visibility */}
          <Section title="Documentation & QA" icon={<Settings className="h-6 w-6 text-gray-800" />}>
            <Field label="Labels Provided"><Select value={form.labelsProvided} onChange={(v)=> update("labelsProvided", v)} options={yesNo} /></Field>
            <Field label="Manual Provided"><Select value={form.manualProvided} onChange={(v)=> update("manualProvided", v)} options={yesNo} /></Field>
            <Field label="Proof Before Ship"><Select value={form.proofBeforeShip} onChange={(v)=> update("proofBeforeShip", v)} options={yesNo} /></Field>
            <Field label="Visual Proof"><Select value={form.visualProof} onChange={(v)=> update("visualProof", v)} options={yesNo} /></Field>
            <Field label="Packaging"><Select value={form.packaging} onChange={(v)=> update("packaging", v)} options={admin.docs.packagingOptions} /></Field>
            <Field label="Certifications (comma-sep)"><Text value={form.certifications} onChange={(v)=> update("certifications", v)} /></Field>
            <Field label="Origin Country"><Text value={form.originCountry} onChange={(v)=> update("originCountry", v)} /></Field>
            <Field label="Canadian Wiring Colors"><Select value={form.canadIanWireColors} onChange={(v)=> update("canadIanWireColors", v)} options={yesNo} /></Field>
          </Section>

          {/* Warranty */}
          <Section title="Substitution & Warranty" icon={<Settings className="h-6 w-6 text-gray-800" />}>
            <Field label="No Substitutions"><Select value={form.noSubstitutions} onChange={(v)=> update("noSubstitutions", v)} options={yesNo} /></Field>
            <Field label="Warranty Years"><Text type="number" value={form.warrantyYears} onChange={(v)=> update("warrantyYears", v)} /></Field>
          </Section>

          {/* Payment */}
          <Section title="Payment" icon={<CreditCard className="h-6 w-6 text-gray-800" />}>
            <Field label="Method">
              <Select
                value={payment.method}
                onChange={(v) => updatePayment("method", v)}
                options={["Credit Card", "Purchase Order"]}
              />
            </Field>
            {payment.method === "Credit Card" && (
              <>
                <Field label="Card Number">
                  <Text
                    value={payment.cardNumber}
                    onChange={(v) => updatePayment("cardNumber", v)}
                    placeholder="4111 1111 1111 1111"
                  />
                </Field>
                <Field label="Expiry">
                  <Text
                    value={payment.expiry}
                    onChange={(v) => updatePayment("expiry", v)}
                    placeholder="MM/YY"
                  />
                </Field>
                <Field label="CVV">
                  <Text
                    value={payment.cvv}
                    onChange={(v) => updatePayment("cvv", v)}
                    placeholder="123"
                  />
                </Field>
              </>
            )}
            {payment.method === "Purchase Order" && (
              <Field label="PO Number">
                <Text
                  value={payment.poNumber}
                  onChange={(v) => updatePayment("poNumber", v)}
                  placeholder="PO-12345"
                />
              </Field>
            )}
          </Section>

          {/* Live Summary + Warnings */}
          <div className="space-y-3">
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

            <div className="rounded-2xl border-l-4 border-blue-600 bg-blue-50 p-4">
              <h3 className="mb-2 text-base font-semibold text-gray-900">Summary (live)</h3>
              <div className="whitespace-pre-wrap text-sm text-gray-800">{generateSummary()}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              <Check className="h-4 w-4" /> Review Summary
            </button>
            <button
              type="button"
              onClick={resetAll}
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 font-medium text-gray-800 hover:bg-gray-100"
            >
              <X className="h-4 w-4" /> Reset
            </button>
            <button
              type="button"
              onClick={exportAdmin}
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 font-medium text-gray-800 hover:bg-gray-100"
            >
              <Download className="h-4 w-4" /> Export Admin
            </button>
          </div>

          {/* ===== API Integration: Health / Calculate / Quote ===== */}
          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 shadow-inner">
            <h2 className="mb-3 text-lg font-semibold">API Integration</h2>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <button
                type="button"
                onClick={handleHealth}
                className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow hover:bg-gray-50"
              >
                Check API Health
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleCalculatePrice}
                className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow hover:bg-gray-50 disabled:opacity-50"
              >
                Calculate Price
              </button>
              <div className="flex items-center gap-2">
                <input
                  value={cfgId}
                  onChange={(e) => setCfgId(e.target.value)}
                  placeholder="configurationId (UUID)"
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleCreateQuote}
                  className="rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow hover:bg-gray-50 disabled:opacity-50"
                >
                  Create Quote
                </button>
              </div>
            </div>

            {/* API Results */}
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
              <pre className="rounded-md bg-white p-3 text-xs shadow-sm">
                <strong>Health</strong>
                {"\n"}
                {apiHealth ? JSON.stringify(apiHealth, null, 2) : "(none)"}
              </pre>
              <pre className="rounded-md bg-white p-3 text-xs shadow-sm">
                <strong>Pricing</strong>
                {"\n"}
                {pricing ? JSON.stringify(pricing, null, 2) : "(none)"}
              </pre>
              <pre className="rounded-md bg-white p-3 text-xs shadow-sm">
                <strong>Quote</strong>
                {"\n"}
                {quoteResp ? JSON.stringify(quoteResp, null, 2) : "(none)"}
              </pre>
            </div>

            {apiError ? (
              <div className="mt-3 rounded-md border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800">
                {apiError}
              </div>
            ) : null}
          </div>
        </form>

        {/* Modal */}
        {modalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-4 shadow-xl">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Summary</h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="rounded-lg border px-2 py-1 text-sm hover:bg-gray-100"
                >
                  Close
                </button>
              </div>
              <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap rounded-md bg-gray-50 p-3 text-sm">
                {summary}
              </pre>
            </div>
          </div>
        ) : null}

        {/* Admin toggle */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <button
            type="button"
            onClick={() => setAdminOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"
          >
            <Settings className="h-4 w-4" />
            {adminOpen ? "Hide Admin Panel" : "Show Admin Panel"}
          </button>

          {adminOpen ? (
            <div className="mt-4 space-y-3 text-sm text-gray-700">
              <p>
                Admin panel is simplified in this build. You can export the admin spec, edit the
                JSON externally, and import it below to override defaults.
              </p>
              <div className="flex flex-col gap-2 md:flex-row">
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder='Paste JSON from "Export Admin" or "Export Config"'
                  className="min-h-[140px] flex-1 rounded-lg border border-gray-300 p-2"
                />
                <div className="flex w-full flex-col gap-2 md:w-48">
                  <button
                    type="button"
                    onClick={importJSON}
                    className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Import JSON
                  </button>
                  <button
                    type="button"
                    onClick={exportAdmin}
                    className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"
                  >
                    Export Admin
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <footer className="py-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} Brand M3dia
        </footer>
      </div>
    </div>
  );
}
