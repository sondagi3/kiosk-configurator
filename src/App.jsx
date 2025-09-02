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
+  CreditCard,
 } from "lucide-react";
 // API base for the Express server
 const API_BASE = "http://localhost:3001/api";
 
 // Brand M3dia – One‑Stop Kiosk Configurator (Plain JS)
 // CEO Mode + Admin Mode (full spec editor), live compliance, export/print
 
 export default function App() {
   // ======================= Admin Spec (editable) =======================
   const defaultAdmin = {
     orgName: "Brand M3dia",
     // Procurement constraints
     display: {
       allowedBrands: ["LG", "Samsung"],
       sizeOptions: [
         "32-inch",
         "43-inch",
         "49-inch",
         "55-inch",
         "65-inch",
         "75-inch",
       ],
       resolutionOptions: ["FHD (1920x1080)", "UHD (3840x2160)"],
       minBrightness: 400,
       minContrast: 1000,
diff --git a/src/App.jsx b/src/App.jsx
index 79876ee60a9db3b6533382cd7282dd02ab2d8ebb..0ebaa6142c6f5dd3c7b604e02a438cac0e75b316 100644
--- a/src/App.jsx
+++ b/src/App.jsx
@@ -192,68 +193,80 @@ export default function App() {
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
 
     // Accessories (detailed with models)
     cameraModel: defaultAdmin.peripherals.cameras[0],
     micModel: defaultAdmin.peripherals.mics[0],
     speakerModel: defaultAdmin.peripherals.speakers[0],
     qrModel: defaultAdmin.peripherals.qrScanners[0],
     badgePrinterModel: defaultAdmin.peripherals.badgePrinters[0],
     wallMount: defaultAdmin.peripherals.wallMounts[0],
 
     // Multi-select group (legacy)
     peripherals: ["mic", "speaker", "webcam", "qr"],
   };
 
+  const initialPayment = {
+    method: "Credit Card",
+    cardNumber: "",
+    expiry: "",
+    cvv: "",
+    poNumber: "",
+  };
+
   const [form, setForm] = useState(initial);
 
   // ======================= UI State =======================
   const [adminOpen, setAdminOpen] = useState(false);
   const [peripheralOpen, setPeripheralOpen] = useState(false);
   const [modalOpen, setModalOpen] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [summary, setSummary] = useState("");
   const [importText, setImportText] = useState("");
 
+  // Payment details
+  const [payment, setPayment] = useState(initialPayment);
+
   // API & pricing state
 const [apiHealth, setApiHealth] = useState(null);
 const [pricing, setPricing] = useState(null);
 const [quoteResp, setQuoteResp] = useState(null);
 const [cfgId, setCfgId] = useState(""); // paste a real configuration UUID when you have one
 const [apiError, setApiError] = useState(null);
 
   const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
+  const updatePayment = (k, v) => setPayment((p) => ({ ...p, [k]: v }));
 
   // ======================= Inputs =======================
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
diff --git a/src/App.jsx b/src/App.jsx
index 79876ee60a9db3b6533382cd7282dd02ab2d8ebb..0ebaa6142c6f5dd3c7b604e02a438cac0e75b316 100644
--- a/src/App.jsx
+++ b/src/App.jsx
@@ -418,50 +431,67 @@ const [apiError, setApiError] = useState(null);
 
     // Docs
     lines.push("\n8) Documentation & QA:");
     lines.push(`• Labels: ${f.labelsProvided}; Manual: ${f.manualProvided}; Proof before ship: ${f.proofBeforeShip}; Visual proof: ${f.visualProof}`);
     lines.push(`• Packaging: ${f.packaging}; Certs: ${f.certifications}; Origin: ${f.originCountry || "(TBD)"}; Canadian wiring colors: ${f.canadIanWireColors}`);
 
     // Warranty
     lines.push("\n9) Substitution & Warranty:");
     lines.push(`• No substitutions without consent: ${f.noSubstitutions}; Warranty (years): ${f.warrantyYears}`);
 
     // Accessories
     lines.push("\n10) Accessories & Integration:");
     lines.push(`• Camera: ${f.cameraModel}; Mic: ${f.micModel}; Speakers: ${f.speakerModel}`);
     lines.push(`• QR Scanner: ${f.qrModel}; Badge Printer: ${f.badgePrinterModel}; Wall Mount: ${f.wallMount}`);
     lines.push(`• Grouped: ${selectedPeripheralNames}`);
 
     // Admin Custom Fields
     if (admin.customFields && admin.customFields.length) {
       lines.push("\nAdmin Custom Fields:");
       admin.customFields.forEach((cf) => {
         const v = form[cf.key] != null ? form[cf.key] : cf.defaultValue;
         lines.push(`• ${cf.key}: ${v}`);
       });
     }
 
+    // Payment
+    lines.push("\nPayment:");
+    lines.push(`• Method: ${payment.method}`);
+    if (payment.method === "Credit Card") {
+      const last4 = payment.cardNumber ? payment.cardNumber.slice(-4) : "----";
+      lines.push(`• Card Ending: ${last4}`);
+    } else if (payment.method === "Purchase Order") {
+      lines.push(`• PO Number: ${payment.poNumber || "(none)"}`);
+    }
+    if (pricing) {
+      lines.push("\nPricing:");
+      lines.push(`• Subtotal: ${pricing.subtotal}`);
+      if ("shipping_total" in pricing) lines.push(`• Shipping: ${pricing.shipping_total}`);
+      if ("tax_total" in pricing) lines.push(`• Tax: ${pricing.tax_total}`);
+      lines.push(`• Grand Total: ${pricing.grand_total ?? pricing.subtotal}`);
+    }
+
     // Warnings
     if (warnings.length) {
       lines.push("\nCompliance Warnings:");
       warnings.forEach((m) => lines.push(`• ${m}`));
     }
 
     return lines.join("\n");
   };
 
   // Map the current form into a selection_json the server understands.
 // These SKUs match the demo SQL seed: DISP-24-TOUCH, PC-NUC-I5, TOUCH-KIT-PCAP
 function buildSelectionJson() {
   // display SKU — simple demo mapping based on size text
   const size = String(form.size || "").toLowerCase();
   let displaySku = "DISP-24-TOUCH";
   if (size.includes("32")) displaySku = "DISP-24-TOUCH";
   if (size.includes("43")) displaySku = "DISP-24-TOUCH";
   if (size.includes("49")) displaySku = "DISP-24-TOUCH";
   if (size.includes("55")) displaySku = "DISP-24-TOUCH";
 
   // pc SKU — demo default maps any i5 option to PC-NUC-I5
   const pcSku = form.cpuRam.includes("i5") ? "PC-NUC-I5" : "PC-NUC-I5";
 
   // touch SKU only if user selected touch
   const touchSku = form.hasTouch === "Yes" ? "TOUCH-KIT-PCAP" : null;
diff --git a/src/App.jsx b/src/App.jsx
index 79876ee60a9db3b6533382cd7282dd02ab2d8ebb..0ebaa6142c6f5dd3c7b604e02a438cac0e75b316 100644
--- a/src/App.jsx
+++ b/src/App.jsx
@@ -504,105 +534,109 @@ async function handleCalculatePrice() {
   } finally {
     setIsSubmitting(false);
   }
 }
 
 async function handleCreateQuote() {
   setIsSubmitting(true); setApiError(null); setQuoteResp(null);
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
 
   const exportConfig = () => {
-    const payload = { type: "config", admin, form };
+    const payload = { type: "config", admin, form, payment };
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
+        if (parsed.payment) setPayment(parsed.payment);
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
     w.document.write(`<!doctype html><html><head><meta charset='utf-8'><title>${admin.orgName} – Kiosk Summary</title><style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Helvetica,Arial,sans-serif;white-space:pre-wrap;padding:24px;}</style></head><body>${safe}</body></html>`);
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
 
-  const resetAll = () => setForm({ ...initial });
+  const resetAll = () => {
+    setForm({ ...initial });
+    setPayment({ ...initialPayment });
+  };
 
   // ======================= Admin Panel Components =======================
   const Chip = ({ text, onRemove }) => (
     <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs">
       {text}
       <button type="button" onClick={onRemove} className="text-gray-500 hover:text-gray-700">
         <Trash2 className="h-3.5 w-3.5" />
       </button>
     </span>
   );
   const AddToList = ({ label, list, onAdd, placeholder }) => {
     const [val, setVal] = useState("");
     return (
       <div className="space-y-1">
         <label className="text-sm font-medium text-gray-700">{label}</label>
         <div className="flex gap-2">
           <input
             value={val}
             onChange={(e) => setVal(e.target.value)}
             placeholder={placeholder || "Add value"}
             className="flex-1 rounded-xl border border-gray-300 px-3 py-2"
           />
           <button type="button" onClick={() => { if (!val) return; onAdd(val); setVal(""); }} className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
             <Plus className="h-4 w-4" /> Add
           </button>
diff --git a/src/App.jsx b/src/App.jsx
index 79876ee60a9db3b6533382cd7282dd02ab2d8ebb..0ebaa6142c6f5dd3c7b604e02a438cac0e75b316 100644
--- a/src/App.jsx
+++ b/src/App.jsx
@@ -914,50 +948,95 @@ async function handleCreateQuote() {
             <Field label="Microphone Model"><Select value={form.micModel} onChange={(v)=> update("micModel", v)} options={admin.peripherals.mics} /></Field>
             <Field label="Speaker Option"><Select value={form.speakerModel} onChange={(v)=> update("speakerModel", v)} options={admin.peripherals.speakers} /></Field>
             <Field label="QR Scanner Model"><Select value={form.qrModel} onChange={(v)=> update("qrModel", v)} options={admin.peripherals.qrScanners} /></Field>
             <Field label="Badge Printer Model"><Select value={form.badgePrinterModel} onChange={(v)=> update("badgePrinterModel", v)} options={admin.peripherals.badgePrinters} /></Field>
             <Field label="Wall Mount"><Select value={form.wallMount} onChange={(v)=> update("wallMount", v)} options={admin.peripherals.wallMounts} /></Field>
             <Field label="Grouped Peripherals (legacy)"><MultiSelect /></Field>
           </Section>
 
           {/* Admin Custom Fields visible on CEO form */}
           {admin.customFields.length ? (
             <Section title="Admin Custom Fields" icon={<Settings className="h-6 w-6 text-gray-800" />}>
               {admin.customFields.map((cf, i) => (
                 <Field key={`${cf.key}-${i}`} label={cf.key || `Custom Field ${i+1}`}>
                   {cf.type === "yesno" ? (
                     <Select value={form[cf.key] || cf.defaultValue || "No"} onChange={(v) => update(cf.key, v)} options={yesNo} />
                   ) : cf.type === "number" ? (
                     <Text type="number" value={form[cf.key] || cf.defaultValue || "0"} onChange={(v) => update(cf.key, v)} />
                   ) : (
                     <Text value={form[cf.key] || cf.defaultValue || ""} onChange={(v) => update(cf.key, v)} />
                   )}
                 </Field>
               ))}
             </Section>
           ) : null}
 
+          {/* Payment */}
+          <Section title="Payment" icon={<CreditCard className="h-6 w-6 text-gray-800" />}>
+            <Field label="Method">
+              <Select
+                value={payment.method}
+                onChange={(v) => updatePayment("method", v)}
+                options={["Credit Card", "Purchase Order"]}
+              />
+            </Field>
+            {payment.method === "Credit Card" && (
+              <>
+                <Field label="Card Number">
+                  <Text
+                    value={payment.cardNumber}
+                    onChange={(v) => updatePayment("cardNumber", v)}
+                    placeholder="4111 1111 1111 1111"
+                  />
+                </Field>
+                <Field label="Expiry">
+                  <Text
+                    value={payment.expiry}
+                    onChange={(v) => updatePayment("expiry", v)}
+                    placeholder="MM/YY"
+                  />
+                </Field>
+                <Field label="CVV">
+                  <Text
+                    value={payment.cvv}
+                    onChange={(v) => updatePayment("cvv", v)}
+                    placeholder="123"
+                  />
+                </Field>
+              </>
+            )}
+            {payment.method === "Purchase Order" && (
+              <Field label="PO Number">
+                <Text
+                  value={payment.poNumber}
+                  onChange={(v) => updatePayment("poNumber", v)}
+                  placeholder="PO-12345"
+                />
+              </Field>
+            )}
+          </Section>
+
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
               <div className="text-sm text-gray-800 whitespace-pre-wrap">{generateSummary()}</div>
             </div>
           </div>
 
           {/* Actions */}
           {/* ===== API Integration: Health / Calculate / Quote ===== */}
 <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 shadow-inner">
   <h2 className="mb-3 text-lg font-semibold">API Integration</h2>
 
   <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
 
EOF
)
