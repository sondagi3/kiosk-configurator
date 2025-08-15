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
} from "lucide-react";

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
      minColorGamut: 90, // % sRGB
      allowedPanelTypes: ["IPS"],
      maxPanelAgeMonths: 24,
      tempMin: -10,
      tempMax: 60,
    },
    touch: {
      allowed: true,
      structures: ["G+G"],
      tech: ["PCAP"],
      minPoints: 10,
      sensorTypes: ["ITO", "Nanowire"],
      forbiddenSensors: ["Metal mesh (visible)"],
      controllers: ["ILITEK"],
      maxLatencyMs: 15,
      interfaceOptions: ["USB 3.0 HID"],
      minTransparency: 85,
      bonding: ["OCA/OCR", "Air (discouraged)"],
    },
    thermal: {
      coolingOptions: ["Fan", "Passive", "Vented"],
      b2bFanMandatory: true,
      maxSurfaceTempC: 60,
    },
    pc: {
      cpuRamOptions: [
        "i5-11th Gen, 8GB DDR4",
        "i5-12th Gen, 16GB DDR4",
        "i7-11th Gen, 16GB DDR4",
      ],
      storageOptions: ["128GB SSD", "256GB SSD", "512GB SSD", "1TB NVMe SSD"],
      supportWin11: true,
      supportUbuntu: true,
      maxHwAgeMonths: 24,
    },
    iosec: { bottomOnly: true, lockingPlates: true, includeULPDU: true },
    video: {
      internalIf: ["LVDS", "eDP"],
      outputs: ["HDMI 2.0 / DP 1.2+ with EDID emulation"],
      mounting: ["Secured + dust-protected + labeled"],
    },
    firmware: { edid: true, autoscale: true, identicalBoards: true },
    docs: {
      labels: true,
      manual: true,
      proofBeforeShip: true,
      visualProof: true,
      packagingOptions: ["Crate", "Flight Case", "Crate / Flight Case"],
      certifications: ["CE", "FCC", "RoHS", "ISO", "UL"],
      requireCanadianWiringColors: true,
    },
    warranty: { noSubstitutions: true, years: 1 },

    // ===== CEO Extras =====
    cosmetics: {
      colors: ["Black", "White", "Silver", "Brand Blue", "Custom HEX"],
      finishes: ["Matte", "Gloss", "Brushed"],
      allowLogo: true,
      logoPositions: ["Top", "Bottom", "Center"],
      maxLogoWidthCm: 10,
      wheels: ["No wheels", "Lockable casters"],
    },
    peripherals: {
      cameras: ["Logitech C920", "Logitech C930e", "Industrial 4K (M12 lens)"],
      mics: ["USB Array Mic", "Gooseneck Mic (XLR via USB interface)"],
      speakers: ["5W stereo", "10W stereo"],
      qrScanners: ["Zebra DS2208", "Honeywell Xenon 1950"],
      badgePrinters: ["Evolis Zenius", "Zebra ZD421"],
      wallMounts: ["VESA 400x400", "Custom Plate"],
    },

    // Dynamic, admin-addable configuration items
    customFields: [
      // { key: "Seismic Anchoring", type: "yesno", defaultValue: "No" }
    ],
  };

  const [admin, setAdmin] = useState(defaultAdmin);

  // ======================= CEO Config (user-facing) =======================
  const yesNo = ["Yes", "No"];
  const initial = {
    formFactor: "floor",
    // Cosmetics
    kioskColor: "Black",
    colorHex: "#000000",
    finish: "Matte",
    wheels: "No wheels",
    logoText: "",
    logoPosition: "Top",
    logoUrl: "",

    // Display
    brand: defaultAdmin.display.allowedBrands[0],
    model: "",
    size: defaultAdmin.display.sizeOptions[1] || "43-inch",
    resolution: defaultAdmin.display.resolutionOptions[0],
    brightness: String(defaultAdmin.display.minBrightness),
    contrast: String(defaultAdmin.display.minContrast),
    colorGamut: String(defaultAdmin.display.minColorGamut),
    panelType: defaultAdmin.display.allowedPanelTypes[0],
    panelAgeMonths: String(defaultAdmin.display.maxPanelAgeMonths),
    opTempMin: String(defaultAdmin.display.tempMin),
    opTempMax: String(defaultAdmin.display.tempMax),
    poweredByULPDU: "Yes",
    cableHidden: "Yes",

    // Touch
    hasTouch: defaultAdmin.touch.allowed ? "No" : "No",
    touchStructure: "G+G",
    touchTech: "PCAP",
    touchPoints: String(defaultAdmin.touch.minPoints),
    sensorType: "ITO",
    controller: "ILITEK",
    latencyMs: String(defaultAdmin.touch.maxLatencyMs),
    touchInterface: "USB 3.0 HID",
    transparencyPct: String(defaultAdmin.touch.minTransparency || 85),
    opticalBonding: "OCA/OCR",
    coverGlassMm: "2.0",
    coatings: "AG/AR/AF",
    visibleMesh: "No",

    // Thermal
    coolingType: defaultAdmin.thermal.coolingOptions[0],
    b2bFanMandatory: defaultAdmin.thermal.b2bFanMandatory ? "Yes" : "No",
    surfaceTempMax: String(defaultAdmin.thermal.maxSurfaceTempC),

    // PC
    cpuRam: defaultAdmin.pc.cpuRamOptions[0],
    storage: defaultAdmin.pc.storageOptions[0],
    osWin11: defaultAdmin.pc.supportWin11 ? "Yes" : "No",
    osUbuntu: defaultAdmin.pc.supportUbuntu ? "Yes" : "No",
    hwAgeMonths: String(defaultAdmin.pc.maxHwAgeMonths),
    pcPowerFromULPDU: "Yes",
    miniPCCompartment: "Yes",

    // I/O Security
    portsBottomOnly: defaultAdmin.iosec.bottomOnly ? "Yes" : "No",
    portsProtected: defaultAdmin.iosec.lockingPlates ? "Yes" : "No",
    includeULPDU: defaultAdmin.iosec.includeULPDU ? "Yes" : "No",

    // Video/Signal
    internalInterface: defaultAdmin.video.internalIf[1] || defaultAdmin.video.internalIf[0],
    tconOutput: defaultAdmin.video.outputs[0],
    tconMounting: defaultAdmin.video.mounting[0],

    // Firmware
    edidSupport: defaultAdmin.firmware.edid ? "Yes" : "No",
    autoScaling: defaultAdmin.firmware.autoscale ? "Yes" : "No",
    boardsIdentical: defaultAdmin.firmware.identicalBoards ? "Yes" : "No",

    // Docs
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

  const [form, setForm] = useState(initial);

  // ======================= UI State =======================
  const [adminOpen, setAdminOpen] = useState(false);
  const [peripheralOpen, setPeripheralOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [summary, setSummary] = useState("");
  const [importText, setImportText] = useState("");

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

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
    />
  );
  const Color = ({ value, onChange }) => (
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 w-full cursor-pointer rounded-xl border border-gray-300"
    />
  );
  const Field = ({ label, children, help }) => (
    <div className="space-y-1 w-full">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {help ? <p className="text-xs text-gray-500">{help}</p> : null}
      {children}
    </div>
  );

  // ======================= Multi-Select =======================
  const peripheralOptions = [
    { id: "qr", name: "QR Code Scanner" },
    { id: "badge-printer", name: "Badge Printer" },
    { id: "webcam", name: "USB Webcam (internal)" },
    { id: "mic", name: "Microphone" },
    { id: "speaker", name: "Speaker" },
    { id: "wall-mount", name: "Wall Mount Kit" },
  ];
  const selectedPeripheralNames = useMemo(() => {
    const names = form.peripherals
      .map((id) => peripheralOptions.find((p) => p.id === id)?.name)
      .filter(Boolean);
    return names.length ? names.join(", ") : "None";
  }, [form.peripherals]);

  const MultiSelect = () => (
    <div className="relative">
      <button
        type="button"
        onClick={() => setPeripheralOpen((s) => !s)}
        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-gray-800">{selectedPeripheralNames}</span>
          <ChevronDown className="h-5 w-5 text-gray-500" />
        </div>
      </button>
      {peripheralOpen && (
        <div className="absolute z-20 mt-2 w-full rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
          <div className="max-h-56 overflow-auto pr-1">
            {peripheralOptions.map((p) => {
              const checked = form.peripherals.includes(p.id);
              return (
                <label key={p.id} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...form.peripherals, p.id]
                        : form.peripherals.filter((id) => id !== p.id);
                      update("peripherals", next);
                    }}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-800">{p.name}</span>
                  {checked ? <Check className="ml-auto h-4 w-4 text-blue-600" /> : null}
                </label>
              );
            })}
          </div>
          <div className="mt-2 flex items-center justify-end gap-2">
            <button type="button" onClick={() => update("peripherals", [])} className="rounded-lg px-2 py-1 text-sm text-gray-600 hover:bg-gray-100">Clear</button>
            <button type="button" onClick={() => setPeripheralOpen(false)} className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">Done</button>
          </div>
        </div>
      )}
    </div>
  );

  // ======================= Compliance =======================
  const warnings = useMemo(() => {
    const w = [];
    const num = (v) => Number(String(v).replace(/[^0-9.-]/g, "")) || 0;
    if (!admin.display.allowedBrands.includes(form.brand))
      w.push("Panel brand must be LG or Samsung.");
    if (num(form.brightness) < admin.display.minBrightness)
      w.push(`Brightness must be ≥ ${admin.display.minBrightness} cd/m².`);
    if (num(form.contrast) < admin.display.minContrast)
      w.push(`Contrast must be ≥ ${admin.display.minContrast}:1.`);
    if (num(form.colorGamut) < admin.display.minColorGamut)
      w.push(`Color gamut must be ≥ ${admin.display.minColorGamut}% sRGB.`);
    if (!admin.display.allowedPanelTypes.includes(form.panelType))
      w.push("Panel type must be IPS only.");
    if (num(form.panelAgeMonths) > admin.display.maxPanelAgeMonths)
      w.push(`Panel age must be ≤ ${admin.display.maxPanelAgeMonths} months.`);
    if (num(form.opTempMin) > admin.display.tempMin || num(form.opTempMax) < admin.display.tempMax)
      w.push(`Operating temperature must cover ${admin.display.tempMin}°C to ${admin.display.tempMax}°C.`);
    if (form.hasTouch === "Yes") {
      if (num(form.touchPoints) < admin.touch.minPoints) w.push(`Touch points must be ≥ ${admin.touch.minPoints}.`);
      if (num(form.latencyMs) > admin.touch.maxLatencyMs) w.push(`Touch latency must be < ${admin.touch.maxLatencyMs} ms.`);
      if (!(admin.touch.controllers || []).includes(form.controller)) w.push("Touch controller must be ILITEK.");
      if (num(form.transparencyPct) < (admin.touch.minTransparency || 85)) w.push(`Touch transparency ≥ ${admin.touch.minTransparency || 85}%.`);
    }
    return w;
  }, [form, admin]);

  // ======================= Summary / Export / Print =======================
  const generateSummary = () => {
    const A = admin, f = form;
    const lines = [];
    lines.push(`${A.orgName} – Kiosk Configuration Summary\n`);
    lines.push("CEO Options:");
    lines.push(`• Color/Finish: ${f.kioskColor}${f.kioskColor === "Custom HEX" ? ` (${f.colorHex})` : ""}, ${f.finish}`);
    lines.push(`• Wheels: ${f.wheels}; Logo: ${f.logoText || "(none)"} @ ${f.logoPosition}${f.logoUrl ? ` [${f.logoUrl}]` : ""}`);

    // Display
    lines.push("\n1) Display Panel:");
    lines.push(`• Brand/Model: ${f.brand} ${f.model || "(model TBD)"}`);
    lines.push(`• Size/Resolution: ${f.size}, ${f.resolution}`);
    lines.push(`• Brightness/Contrast: ≥ ${f.brightness} cd/m², ≥ ${f.contrast}:1`);
    lines.push(`• Color Gamut / Panel: ≥ ${f.colorGamut}% sRGB / ${f.panelType}`);
    lines.push(`• Age/Temp: ≤ ${f.panelAgeMonths} months; ${f.opTempMin}°C..${f.opTempMax}°C`);
    lines.push(`• Power via UL PDU: ${f.poweredByULPDU}; Visible cabling: ${f.cableHidden === "Yes" ? "No" : "Yes"}`);

    // Touch
    lines.push("\n2) Touchscreen:");
    lines.push(`• Present: ${f.hasTouch}`);
    if (f.hasTouch === "Yes") {
      lines.push(`• ${f.touchStructure} ${f.touchTech}, ${f.touchPoints}-point; Sensor: ${f.sensorType}`);
      lines.push(`• Controller: ${f.controller}; Latency < ${f.latencyMs}ms; Interface: ${f.touchInterface}`);
      lines.push(`• Transparency ≥ ${f.transparencyPct}%; Bonding: ${f.opticalBonding}; Cover glass ${f.coverGlassMm}mm; Coatings: ${f.coatings}`);
      lines.push(`• Visible Mesh: ${f.visibleMesh}`);
    }

    // Thermal
    lines.push("\n3) Thermal & Cooling:");
    lines.push(`• Cooling: ${f.coolingType}; Back-to-back internal fan: ${f.b2bFanMandatory}`);
    lines.push(`• Surface temp < ${f.surfaceTempMax}°C`);

    // PC
    lines.push("\n4) Internal PC/Media Player:");
    lines.push(`• CPU/RAM: ${f.cpuRam}; Storage: ${f.storage}`);
    lines.push(`• OS: Windows 11 (${f.osWin11}), Ubuntu 22.04+ (${f.osUbuntu})`);
    lines.push(`• HW age ≤ ${f.hwAgeMonths} months; Power via UL PDU: ${f.pcPowerFromULPDU}; Mini PC compartment: ${f.miniPCCompartment}`);

    // I/O Security
    lines.push("\n5) External I/O Security:");
    lines.push(`• Ports bottom-only: ${f.portsBottomOnly}; Locking plates: ${f.portsProtected}; UL PDU included: ${f.includeULPDU}`);

    // Video/Signal
    lines.push("\n6) Video & Signal Integration:");
    lines.push(`• Internal interface: ${f.internalInterface}; Output: ${f.tconOutput}`);
    lines.push(`• T-CON mounting: ${f.tconMounting}`);

    // Firmware
    lines.push("\n7) Firmware & Compatibility:");
    lines.push(`• EDID support: ${f.edidSupport}; Auto-scaling: ${f.autoScaling}; Boards identical: ${f.boardsIdentical}`);

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

    // Warnings
    if (warnings.length) {
      lines.push("\nCompliance Warnings:");
      warnings.forEach((m) => lines.push(`• ${m}`));
    }

    return lines.join("\n");
  };

  const exportConfig = () => {
    const payload = { type: "config", admin, form };
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

  const resetAll = () => setForm({ ...initial });

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
        </div>
        <div className="mt-1 flex flex-wrap gap-2">
          {list.map((t, i) => (
            <Chip key={`${t}-${i}`} text={t} onRemove={() => onAdd(null, i)} />
          ))}
        </div>
      </div>
    );
  };

  const AdminPanel = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-5xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold"><span className="text-blue-700">Admin Mode</span> – Specification Editor</h3>
          <button onClick={() => setAdminOpen(false)} className="rounded-full border border-gray-300 px-3 py-1.5 text-sm">Close</button>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Org & Cosmetics */}
          <div className="space-y-4 rounded-xl border border-gray-100 p-4">
            <Field label="Organization Name">
              <Text value={admin.orgName} onChange={(v) => setAdmin({ ...admin, orgName: v })} />
            </Field>
            <AddToList
              label="Kiosk Colors"
              list={admin.cosmetics.colors}
              onAdd={(val, removeIdx) => {
                const list = [...admin.cosmetics.colors];
                if (removeIdx != null) list.splice(removeIdx, 1);
                else list.push(val);
                setAdmin({ ...admin, cosmetics: { ...admin.cosmetics, colors: list } });
              }}
            />
            <AddToList
              label="Finishes"
              list={admin.cosmetics.finishes}
              onAdd={(val, removeIdx) => {
                const list = [...admin.cosmetics.finishes];
                if (removeIdx != null) list.splice(removeIdx, 1);
                else list.push(val);
                setAdmin({ ...admin, cosmetics: { ...admin.cosmetics, finishes: list } });
              }}
            />
            <AddToList
              label="Wheels"
              list={admin.cosmetics.wheels}
              onAdd={(val, removeIdx) => {
                const list = [...admin.cosmetics.wheels];
                if (removeIdx != null) list.splice(removeIdx, 1);
                else list.push(val);
                setAdmin({ ...admin, cosmetics: { ...admin.cosmetics, wheels: list } });
              }}
            />
          </div>

          {/* Display */}
          <div className="space-y-4 rounded-xl border border-gray-100 p-4">
            <AddToList
              label="Allowed Panel Brands"
              list={admin.display.allowedBrands}
              onAdd={(val, removeIdx) => {
                const list = [...admin.display.allowedBrands];
                if (removeIdx != null) list.splice(removeIdx, 1);
                else list.push(val);
                setAdmin({ ...admin, display: { ...admin.display, allowedBrands: list } });
              }}
            />
            <AddToList
              label="Panel Sizes"
              list={admin.display.sizeOptions}
              onAdd={(val, removeIdx) => {
                const list = [...admin.display.sizeOptions];
                if (removeIdx != null) list.splice(removeIdx, 1);
                else list.push(val);
                setAdmin({ ...admin, display: { ...admin.display, sizeOptions: list } });
              }}
            />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Min Brightness (cd/m²)"><Text type="number" value={admin.display.minBrightness} onChange={(v) => setAdmin({ ...admin, display: { ...admin.display, minBrightness: Number(v) } })} /></Field>
              <Field label="Min Contrast"><Text type="number" value={admin.display.minContrast} onChange={(v) => setAdmin({ ...admin, display: { ...admin.display, minContrast: Number(v) } })} /></Field>
              <Field label="Min sRGB (%)"><Text type="number" value={admin.display.minColorGamut} onChange={(v) => setAdmin({ ...admin, display: { ...admin.display, minColorGamut: Number(v) } })} /></Field>
              <Field label="Max Age (months)"><Text type="number" value={admin.display.maxPanelAgeMonths} onChange={(v) => setAdmin({ ...admin, display: { ...admin.display, maxPanelAgeMonths: Number(v) } })} /></Field>
              <Field label="Temp Min (°C)"><Text type="number" value={admin.display.tempMin} onChange={(v) => setAdmin({ ...admin, display: { ...admin.display, tempMin: Number(v) } })} /></Field>
              <Field label="Temp Max (°C)"><Text type="number" value={admin.display.tempMax} onChange={(v) => setAdmin({ ...admin, display: { ...admin.display, tempMax: Number(v) } })} /></Field>
            </div>
          </div>

          {/* Peripherals model lists */}
          <div className="space-y-4 rounded-xl border border-gray-100 p-4">
            <AddToList label="Camera Models" list={admin.peripherals.cameras} onAdd={(val, i) => {
              const list = [...admin.peripherals.cameras]; if (i!=null) list.splice(i,1); else list.push(val); setAdmin({ ...admin, peripherals: { ...admin.peripherals, cameras: list } });
            }} />
            <AddToList label="Microphone Models" list={admin.peripherals.mics} onAdd={(val, i) => {
              const list = [...admin.peripherals.mics]; if (i!=null) list.splice(i,1); else list.push(val); setAdmin({ ...admin, peripherals: { ...admin.peripherals, mics: list } });
            }} />
            <AddToList label="Speaker Options" list={admin.peripherals.speakers} onAdd={(val, i) => {
              const list = [...admin.peripherals.speakers]; if (i!=null) list.splice(i,1); else list.push(val); setAdmin({ ...admin, peripherals: { ...admin.peripherals, speakers: list } });
            }} />
            <AddToList label="QR Scanner Models" list={admin.peripherals.qrScanners} onAdd={(val, i) => {
              const list = [...admin.peripherals.qrScanners]; if (i!=null) list.splice(i,1); else list.push(val); setAdmin({ ...admin, peripherals: { ...admin.peripherals, qrScanners: list } });
            }} />
            <AddToList label="Badge Printer Models" list={admin.peripherals.badgePrinters} onAdd={(val, i) => {
              const list = [...admin.peripherals.badgePrinters]; if (i!=null) list.splice(i,1); else list.push(val); setAdmin({ ...admin, peripherals: { ...admin.peripherals, badgePrinters: list } });
            }} />
          </div>

          {/* Custom fields */}
          <div className="space-y-4 rounded-xl border border-gray-100 p-4">
            <label className="text-sm font-semibold text-gray-800">Custom Fields (CEO form)</label>
            <div className="space-y-2">
              {admin.customFields.map((cf, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input value={cf.key} onChange={(e)=>{
                    const list=[...admin.customFields]; list[idx]={...list[idx], key:e.target.value}; setAdmin({...admin, customFields:list});
                  }} className="flex-1 rounded-lg border px-3 py-2" placeholder="Field Label" />
                  <select value={cf.type} onChange={(e)=>{ const list=[...admin.customFields]; list[idx]={...list[idx], type:e.target.value}; setAdmin({...admin, customFields:list}); }} className="rounded-lg border px-2 py-2">
                    <option>text</option>
                    <option>number</option>
                    <option>yesno</option>
                  </select>
                  <input value={cf.defaultValue || ""} onChange={(e)=>{ const list=[...admin.customFields]; list[idx]={...list[idx], defaultValue:e.target.value}; setAdmin({...admin, customFields:list}); }} className="w-40 rounded-lg border px-3 py-2" placeholder="Default" />
                  <button type="button" onClick={()=>{ const list=[...admin.customFields]; list.splice(idx,1); setAdmin({...admin, customFields:list}); }} className="rounded-lg border px-2 py-2"><Trash2 className="h-4 w-4"/></button>
                </div>
              ))}
              <button type="button" onClick={()=> setAdmin({...admin, customFields:[...admin.customFields, {key:"", type:"text", defaultValue:""}]}) } className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white">
                <Plus className="h-4 w-4"/> Add Custom Field
              </button>
            </div>
          </div>
        </div>

        {/* Import/Export Admin */}
        <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-2">
            <button onClick={exportAdmin} type="button" className="inline-flex items-center gap-1 rounded-full border px-4 py-2 text-sm"><Download className="h-4 w-4"/> Export Admin Spec</button>
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-600">Import (paste JSON then click Import)</label>
            <div className="mt-1 flex gap-2">
              <textarea value={importText} onChange={(e)=> setImportText(e.target.value)} className="h-16 flex-1 rounded-lg border px-3 py-2 text-xs" placeholder='{"type":"admin-spec","admin":{...}}'></textarea>
              <button onClick={importJSON} type="button" className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white">Import</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // ======================= Layout Helpers =======================
  const Section = ({ title, icon, children, tone = "default" }) => (
    <div className={`rounded-2xl p-4 ${tone === "blue" ? "border border-blue-100 bg-blue-50/60 shadow-inner" : "border border-gray-100 shadow-sm"}`}>
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 text-gray-900">
      <div className="mx-auto w-full max-w-6xl rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex flex-col items-center justify-between gap-3 md:flex-row">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-extrabold tracking-tight text-blue-700 md:text-4xl">{admin.orgName} – One‑Stop Kiosk Configurator</h1>
            <p className="mt-1 text-gray-600">CEO-friendly configuration with Admin spec enforcement & vendor trust details.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={()=> setAdminOpen(true)} className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium">
              <Settings className="h-4 w-4"/> Admin Mode
            </button>
            <button type="button" onClick={exportAdmin} className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium">
              <Download className="h-4 w-4"/> Export Admin Spec
            </button>
            <button type="button" onClick={exportConfig} className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium">
              <Download className="h-4 w-4"/> Export Config
            </button>
            <button type="button" onClick={printSummary} className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium">
              <Printer className="h-4 w-4"/> Print Summary
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cosmetics */}
          <Section title="CEO – Cosmetics & Branding" icon={<Monitor className="h-6 w-6 text-blue-600" />} tone="blue">
            <Field label="Kiosk Color"><Select value={form.kioskColor} onChange={(v)=> update("kioskColor", v)} options={admin.cosmetics.colors} /></Field>
            {form.kioskColor === "Custom HEX" && (
              <Field label="Custom Color (HEX)"><Color value={form.colorHex} onChange={(v)=> update("colorHex", v)} /></Field>
            )}
            <Field label="Finish"><Select value={form.finish} onChange={(v)=> update("finish", v)} options={admin.cosmetics.finishes} /></Field>
            <Field label="Wheels"><Select value={form.wheels} onChange={(v)=> update("wheels", v)} options={admin.cosmetics.wheels} /></Field>
            {admin.cosmetics.allowLogo && (
              <>
                <Field label="Logo Text"><Text value={form.logoText} onChange={(v)=> update("logoText", v)} placeholder="Brand M3dia"/></Field>
                <Field label="Logo Position"><Select value={form.logoPosition} onChange={(v)=> update("logoPosition", v)} options={admin.cosmetics.logoPositions} /></Field>
                <Field label="Logo URL (optional)"><Text value={form.logoUrl} onChange={(v)=> update("logoUrl", v)} placeholder="https://.../logo.png"/></Field>
              </>
            )}
          </Section>

          {/* Chassis & Display Overview */}
          <Section title="Chassis & Display Overview" icon={<Monitor className="h-6 w-6 text-blue-600" />}>
            <Field label="Form Factor"><Select value={form.formFactor} onChange={(v) => update("formFactor", v)} options={["floor", "wall", "tabletop"]} /></Field>
            <Field label="Display Brand (LG/Samsung only)"><Select value={form.brand} onChange={(v) => update("brand", v)} options={admin.display.allowedBrands} /></Field>
            <Field label="Panel Model (e.g., LM550WF8-SDA1)"><Text value={form.model} onChange={(v) => update("model", v)} placeholder="Enter exact model" /></Field>
            <Field label="Size"><Select value={form.size} onChange={(v) => update("size", v)} options={admin.display.sizeOptions} /></Field>
            <Field label="Resolution"><Select value={form.resolution} onChange={(v) => update("resolution", v)} options={admin.display.resolutionOptions} /></Field>
          </Section>

          {/* Display Requirements */}
          <Section title="1) Display Panel Requirements" icon={<Monitor className="h-6 w-6 text-gray-800" />}>
            <Field label="Brightness (cd/m²)"><Text type="number" value={form.brightness} onChange={(v) => update("brightness", v)} /></Field>
            <Field label="Contrast Ratio (≥)"><Text type="number" value={form.contrast} onChange={(v) => update("contrast", v)} /></Field>
            <Field label="Color Gamut (≥ % sRGB)"><Text type="number" value={form.colorGamut} onChange={(v) => update("colorGamut", v)} /></Field>
            <Field label="Panel Type"><Select value={form.panelType} onChange={(v) => update("panelType", v)} options={[...admin.display.allowedPanelTypes, "TN (Not allowed)", "VA (Not allowed)"]} /></Field>
            <Field label="Panel Age (≤ months)"><Text type="number" value={form.panelAgeMonths} onChange={(v) => update("panelAgeMonths", v)} /></Field>
            <Field label="Operating Temp Min (°C)"><Text type="number" value={form.opTempMin} onChange={(v) => update("opTempMin", v)} /></Field>
            <Field label="Operating Temp Max (°C)"><Text type="number" value={form.opTempMax} onChange={(v) => update("opTempMax", v)} /></Field>
            <Field label="Powered via internal UL PDU"><Select value={form.poweredByULPDU} onChange={(v) => update("poweredByULPDU", v)} options={yesNo} /></Field>
            <Field label="No visible power cabling"><Select value={form.cableHidden} onChange={(v) => update("cableHidden", v)} options={yesNo} /></Field>
          </Section>

          {/* Touchscreen */}
          <Section title="2) Touchscreen Requirements" icon={<Smartphone className="h-6 w-6 text-gray-800" />}>
            <Field label="Touch Present?"><Select value={form.hasTouch} onChange={(v) => update("hasTouch", v)} options={yesNo} /></Field>
            {form.hasTouch === "Yes" && (
              <>
                <Field label="Structure"><Select value={form.touchStructure} onChange={(v) => update("touchStructure", v)} options={admin.touch.structures} /></Field>
                <Field label="Technology"><Select value={form.touchTech} onChange={(v) => update("touchTech", v)} options={admin.touch.tech} /></Field>
                <Field label="Touch Points (≥)"><Text type="number" value={form.touchPoints} onChange={(v) => update("touchPoints", v)} /></Field>
                <Field label="Sensor Type"><Select value={form.sensorType} onChange={(v) => update("sensorType", v)} options={[...admin.touch.sensorTypes, ...admin.touch.forbiddenSensors]} /></Field>
                <Field label="Controller"><Select value={form.controller} onChange={(v) => update("controller", v)} options={admin.touch.controllers} /></Field>
                <Field label="Latency (< ms)"><Text type="number" value={form.latencyMs} onChange={(v) => update("latencyMs", v)} /></Field>
                <Field label="Interface"><Select value={form.touchInterface} onChange={(v) => update("touchInterface", v)} options={admin.touch.interfaceOptions} /></Field>
                <Field label="Transparency (≥ %)"><Text type="number" value={form.transparencyPct} onChange={(v) => update("transparencyPct", v)} /></Field>
                <Field label="Optical Bonding"><Select value={form.opticalBonding} onChange={(v) => update("opticalBonding", v)} options={admin.touch.bonding} /></Field>
                <Field label="Cover Glass Thickness (mm)"><Text type="number" value={form.coverGlassMm} onChange={(v) => update("coverGlassMm", v)} /></Field>
                <Field label="Surface Coatings"><Select value={form.coatings} onChange={(v) => update("coatings", v)} options={["AG/AR/AF"]} /></Field>
                <Field label="Visible Mesh"><Select value={form.visibleMesh} onChange={(v) => update("visibleMesh", v)} options={yesNo} /></Field>
              </>
            )}
          </Section>

          {/* Thermal */}
          <Section title="3) Thermal & Cooling" icon={<Cpu className="h-6 w-6 text-gray-800" />}>
            <Field label="Cooling Type"><Select value={form.coolingType} onChange={(v) => update("coolingType", v)} options={admin.thermal.coolingOptions} /></Field>
            <Field label="Back-to-back displays: internal fan mandatory"><Select value={form.b2bFanMandatory} onChange={(v) => update("b2bFanMandatory", v)} options={yesNo} /></Field>
            <Field label="Surface Temperature Max (°C)"><Text type="number" value={form.surfaceTempMax} onChange={(v) => update("surfaceTempMax", v)} /></Field>
          </Section>

          {/* PC */}
          <Section title="4) Internal PC/Media Player" icon={<Cpu className="h-6 w-6 text-gray-800" />}>
            <Field label="CPU & RAM"><Select value={form.cpuRam} onChange={(v) => update("cpuRam", v)} options={admin.pc.cpuRamOptions} /></Field>
            <Field label="Storage"><Select value={form.storage} onChange={(v) => update("storage", v)} options={admin.pc.storageOptions} /></Field>
            <Field label="Windows 11 Support"><Select value={form.osWin11} onChange={(v) => update("osWin11", v)} options={yesNo} /></Field>
            <Field label="Ubuntu 22.04+ Support"><Select value={form.osUbuntu} onChange={(v) => update("osUbuntu", v)} options={yesNo} /></Field>
            <Field label="Components age (≤ months)"><Text type="number" value={form.hwAgeMonths} onChange={(v) => update("hwAgeMonths", v)} /></Field>
            <Field label="Power via UL PDU"><Select value={form.pcPowerFromULPDU} onChange={(v) => update("pcPowerFromULPDU", v)} options={yesNo} /></Field>
            <Field label="Mini PC Compartment & Brackets"><Select value={form.miniPCCompartment} onChange={(v) => update("miniPCCompartment", v)} options={yesNo} /></Field>
          </Section>

          {/* I/O Security */}
          <Section title="5) External I/O Security" icon={<Cpu className="h-6 w-6 text-gray-800" />}>
            <Field label="Ports at bottom only"><Select value={form.portsBottomOnly} onChange={(v) => update("portsBottomOnly", v)} options={yesNo} /></Field>
            <Field label="Ports protected by plates"><Select value={form.portsProtected} onChange={(v) => update("portsProtected", v)} options={yesNo} /></Field>
            <Field label="UL-certified PDU included"><Select value={form.includeULPDU} onChange={(v) => update("includeULPDU", v)} options={yesNo} /></Field>
          </Section>

          {/* Video & Signal */}
          <Section title="6) Video & Signal Integration" icon={<Cpu className="h-6 w-6 text-gray-800" />}>
            <Field label="Internal Interface"><Select value={form.internalInterface} onChange={(v) => update("internalInterface", v)} options={admin.video.internalIf} /></Field>
            <Field label="T-CON Output"><Select value={form.tconOutput} onChange={(v) => update("tconOutput", v)} options={admin.video.outputs} /></Field>
            <Field label="T-CON Mounting"><Select value={form.tconMounting} onChange={(v) => update("tconMounting", v)} options={admin.video.mounting} /></Field>
          </Section>

          {/* Firmware */}
          <Section title="7) Firmware & Compatibility" icon={<Cpu className="h-6 w-6 text-gray-800" />}>
            <Field label="EDID Support + Emulation"><Select value={form.edidSupport} onChange={(v) => update("edidSupport", v)} options={yesNo} /></Field>
            <Field label="Auto-Scaling"><Select value={form.autoScaling} onChange={(v) => update("autoScaling", v)} options={yesNo} /></Field>
            <Field label="Boards identical across units"><Select value={form.boardsIdentical} onChange={(v) => update("boardsIdentical", v)} options={yesNo} /></Field>
          </Section>

          {/* Docs */}
          <Section title="8) Documentation & QA" icon={<Cpu className="h-6 w-6 text-gray-800" />}>
            <Field label="Component Labels Provided"><Select value={form.labelsProvided} onChange={(v) => update("labelsProvided", v)} options={yesNo} /></Field>
            <Field label="Operation & Maintenance Manual"><Select value={form.manualProvided} onChange={(v) => update("manualProvided", v)} options={yesNo} /></Field>
            <Field label="Proof before Ship (label photo, EDID, controller)"><Select value={form.proofBeforeShip} onChange={(v) => update("proofBeforeShip", v)} options={yesNo} /></Field>
            <Field label="Visual Proof (wiring diagram/photo)"><Select value={form.visualProof} onChange={(v) => update("visualProof", v)} options={yesNo} /></Field>
            <Field label="Packaging"><Select value={form.packaging} onChange={(v) => update("packaging", v)} options={admin.docs.packagingOptions} /></Field>
            <Field label="Certifications"><Text value={form.certifications} onChange={(v) => update("certifications", v)} /></Field>
            <Field label="Country of Assembly"><Text value={form.originCountry} onChange={(v) => update("originCountry", v)} placeholder="China, Korea, Taiwan, ..." /></Field>
            <Field label="Canadian wiring color standard"><Select value={form.canadIanWireColors} onChange={(v) => update("canadIanWireColors", v)} options={yesNo} /></Field>
          </Section>

          {/* Warranty */}
          <Section title="9) Substitution & Warranty" icon={<Cpu className="h-6 w-6 text-gray-800" />}>
            <Field label="No substitutions without consent"><Select value={form.noSubstitutions} onChange={(v) => update("noSubstitutions", v)} options={yesNo} /></Field>
            <Field label="Warranty (years)"><Text type="number" value={form.warrantyYears} onChange={(v) => update("warrantyYears", v)} /></Field>
          </Section>

          {/* Accessories */}
          <Section title="10) Accessories & Integration" icon={<Smartphone className="h-6 w-6 text-gray-800" />}>
            <Field label="Camera Model"><Select value={form.cameraModel} onChange={(v)=> update("cameraModel", v)} options={admin.peripherals.cameras} /></Field>
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
          <div className="flex flex-col items-stretch justify-between gap-3 md:flex-row">
            <button type="button" onClick={resetAll} className="inline-flex items-center justify-center rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <X className="mr-2 h-4 w-4" /> Reset
            </button>
            <div className="flex gap-2">
              <button type="button" onClick={exportAdmin} className="inline-flex items-center justify-center rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Download className="mr-2 h-4 w-4" /> Export Admin Spec
              </button>
              <button type="button" onClick={exportConfig} className="inline-flex items-center justify-center rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Download className="mr-2 h-4 w-4" /> Export Config
              </button>
              <button type="button" onClick={printSummary} className="inline-flex items-center justify-center rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Printer className="mr-2 h-4 w-4" /> Print Summary
              </button>
              <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center rounded-full bg-green-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-green-700 disabled:opacity-70">
                <ShoppingCart className="mr-2 h-5 w-5" /> {isSubmitting ? "Submitting..." : "Submit for Review"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Admin Panel */}
      {adminOpen && <AdminPanel />}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-700">Request Submitted</h3>
                <p className="text-sm text-gray-600">Here is your procurement-style summary.</p>
              </div>
            </div>
            <pre className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm text-gray-800 shadow-inner">{summary}</pre>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setModalOpen(false)} className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Close</button>
              <button onClick={() => { setModalOpen(false); }} className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
