// src/lib/pricing.js

/**
 * Heuristic pricing based on order.spec.alibaba.
 * Returns a full breakdown the UI can show/print.
 * Currency: USD (adjust as needed).
 */
export function estimateQuoteFromAlibaba(specAlibaba, adminAlibaba) {
  const A = adminAlibaba || {};
  const s = specAlibaba || {};
  const line = (label, amount, qty = 1, meta = {}) => ({
    label, amount: Number(amount || 0), qty: Number(qty || 1), total: Number(amount || 0) * Number(qty || 1), ...meta,
  });

  const lines = [];

  // ---------- BASE PANEL (size + res) ----------
  const sizeMap = {
    '21.5" FHD': 250, '32" FHD': 320, '43" FHD': 450, '43" 4K': 520, '49" 4K': 650,
    '55" 4K': 800, '65" 4K': 1100, '75" 4K': 1600, '86" 4K': 2400,
  };
  const basePanel = sizeMap[s.screenSize] ?? 500;
  lines.push(line(`Display Panel (${s.screenSize})`, basePanel));

  // Panel brand tier
  if (s.panelBrandTier?.toLowerCase().includes("premium")) {
    lines.push(line(`Premium Panel Tier (LG/Samsung)`, basePanel * 0.15)); // +15%
  }

  // Brightness
  const brightAdj = {
    "300–350": 0,
    "500–550": 50,
    "1000+": 300,
    "1500–2000": 600,
  }[s.brightnessTier] ?? 0;
  if (brightAdj) lines.push(line(`High Brightness (${s.brightnessTier} nits)`, brightAdj));

  // ---------- TOUCH ----------
  const touchAdj = {
    "IR 10-Point": 120,
    "IR 20-Point": 180,
    "PCAP": 350,
  }[s.touchTech] ?? 0;
  if (touchAdj) lines.push(line(`Touch Technology (${s.touchTech})`, touchAdj));

  (s.touchGlass || []).forEach((g) => {
    const add = {
      "4mm Tempered": 0,
      "6mm Thick": 70,
      "Anti-Glare": 40,
      "Anti-Fingerprint": 40,
    }[g] ?? 0;
    if (add) lines.push(line(`Touch Glass Option – ${g}`, add));
  });

  // ---------- COMPUTE ----------
  const osAdj = {
    "Android 12": 0,
    "Android 13": 0,
    "Windows 11 Pro": 120,
    "Dual-Boot (Android + Win)": 180,
    "No OS": -20,
  }[s.os] ?? 0;
  if (osAdj) lines.push(line(`OS (${s.os})`, osAdj));

  const cpuAdj = {
    RK3288: 0, RK3566: 40, RK3588: 180, "Intel Celeron J4125": 120, "Intel i3": 250, "Intel i5": 400,
  }[s.cpu] ?? 0;
  if (cpuAdj) lines.push(line(`CPU (${s.cpu})`, cpuAdj));

  const ramAdj = { "2GB": 0, "4GB": 20, "8GB": 60, "16GB": 140 }[s.ram] ?? 0;
  if (ramAdj) lines.push(line(`RAM (${s.ram})`, ramAdj));

  const storageAdj = {
    "32GB eMMC": 0, "64GB eMMC": 20, "128GB eMMC": 40, "256GB SSD": 80, "512GB SSD": 140, "1TB SSD": 240,
  }[s.storage] ?? 0;
  if (storageAdj) lines.push(line(`Storage (${s.storage})`, storageAdj));

  if (s.gpuRequired) lines.push(line(`Dedicated GPU Requirement`, 220));

  // ---------- PORTS ----------
  const D = (A.portsDefaults || { usb2: 2, usb3: 2, rj45: 1, hdmiIn: 1, hdmiOut: 1, serial: 1, audio: 1 });
  const p = s.ports || {};
  const extra = (key, val, def, unit) => Math.max(0, (Number(val ?? 0) - Number(def ?? 0))) * unit;
  const portsAdd =
    extra("usb2", p.usb2, D.usb2, 5) +
    extra("usb3", p.usb3, D.usb3, 10) +
    extra("rj45", p.rj45, D.rj45, 20) +
    extra("hdmiIn", p.hdmiIn, D.hdmiIn, 15) +
    extra("hdmiOut", p.hdmiOut, D.hdmiOut, 15) +
    extra("serial", p.serial, D.serial, 10) +
    extra("audio", p.audio, D.audio, 5);
  if (portsAdd) lines.push(line(`Extra Ports Above Standard`, portsAdd));
  if (p.addSecondLan) lines.push(line(`Add Second LAN`, 20));
  if (p.addSecondSerial) lines.push(line(`Add Second Serial`, 15));
  if (p.lteModule) lines.push(line(`Internal 4G/LTE Module`, 90));
  if (p.gpioRequired) lines.push(line(`GPIO Interface`, 30));

  // ---------- PERIPHERALS ----------
  const addEach = (items, priceMap, labelPrefix) => {
    (items || []).forEach((it) => {
      const amt = priceMap[it] ?? 0;
      if (amt) lines.push(line(`${labelPrefix} – ${it}`, amt));
    });
  };

  const mapPay = {
    "RFID (125k/13.56MHz)": 45, "NFC Reader": 60, "EMV Credit Card Pin Pad": 350,
    "Bill/Coin Acceptor": 280, "Barcode/QR Scanner": 120, "Face Recognition Camera": 220, "Fingerprint Scanner": 80,
  };
  const mapPrint = { "Thermal 58mm": 120, "Ticket 80mm": 220, "Label Printer": 200 };
  const mapCam = { "Internal 2MP": 20, "External 1080p": 50, "5MP": 80, "8MP": 120 };
  const mapAud = { "Internal Speakers 2x10W": 20, "External Speaker Set": 60, "Noise-Canceling Mic Array": 80 };
  const mapOther = { "VESA Mount": 35, "External Button Kit": 40, "Keyboard Drawer": 70 };

  const per = s.peripherals || {};
  addEach(per.paymentId, mapPay, "Payment/ID");
  addEach(per.printing, mapPrint, "Printing");
  addEach(per.cameras, mapCam, "Camera");
  addEach(per.audio, mapAud, "Audio");
  addEach(per.other, mapOther, "Accessory");

  // ---------- ENCLOSURE ----------
  const e = s.enclosure || {};
  if (e.material === "Stainless Steel") lines.push(line(`Enclosure Material – Stainless`, 180));

  if (e.finish === "Powder-Coated Black" || e.finish === "Powder-Coated White")
    lines.push(line(`Finish – ${e.finish}`, 30));
  if (e.finish === "Custom RAL") lines.push(line(`Finish – Custom RAL (${e.customRal || "TBD"})`, 120));

  if (e.base === "Motorized Height-Adjustable Stand") lines.push(line(`Base – Motorized Stand`, 280));
  if (e.base === "Mobile Base (Castors)") lines.push(line(`Base – Mobile Castors`, 150));
  if (e.base === "Wall Mount") lines.push(line(`Base – Wall Mount Kit`, 40));

  if (e.ipRating === "IP54") lines.push(line(`IP54 Dust/Splash Protection`, 120));
  if (e.ipRating === "IP65") lines.push(line(`IP65 Water Jet Protection`, 260));

  if (e.branding === "Silkscreen Logo") lines.push(line(`Branding – Silkscreen`, 90));
  if (e.branding === "Laser Engraving") lines.push(line(`Branding – Laser Engraving`, 140));

  // ---------- SOFTWARE ----------
  const soft = s.software || {};
  if (soft.cms === "Basic Android Signage App") lines.push(line(`Software – Basic Signage App`, 40));
  if (soft.cms === "1-Year Cloud CMS License") lines.push(line(`Software – 1-Year Cloud CMS`, 180));
  if (soft.cms === "Windows Signage Software") lines.push(line(`Software – Windows Signage`, 120));
  // kioskLockdown included (no charge) unless using Windows requiring config
  if (soft.kioskLockdown && s.os === "Windows 11 Pro") lines.push(line(`Kiosk Lockdown Setup (Windows)`, 45));

  // ---------- WARRANTY ----------
  const war = s.warranty || {};
  // Warranty uplift is % of hardware subtotal (exclude shipping/software)
  const hardwareSubtotal = lines
    .filter((li) => !String(li.label).toLowerCase().includes("software"))
    .reduce((acc, li) => acc + li.total, 0);

  if (Number(war.years) === 2) lines.push(line(`Warranty Extension to 2 Years`, hardwareSubtotal * 0.08));
  if (Number(war.years) === 3) lines.push(line(`Warranty Extension to 3 Years`, hardwareSubtotal * 0.12));
  if (war.onSiteService) lines.push(line(`On-site Service`, 200));
  if (war.spareTouchGlass) lines.push(line(`Spare Touch Glass`, 50, war.spareTouchGlass));
  if (war.sparePowerAdapter) lines.push(line(`Spare Power Adapter`, 30, war.sparePowerAdapter));

  // ---------- LOGISTICS ----------
  const logi = s.logistics || {};
  let shipping = 0;
  if (logi.shipping === "CIF") shipping = 150;
  if (logi.shipping === "DDP") shipping = 350;
  if (logi.shipping === "EXW") shipping = -50; // buyer pickup (discount)
  // sample unit
  if (logi.sampleUnit) lines.push(line(`Sample Unit Handling`, 100));

  const subtotal = lines.reduce((a, li) => a + li.total, 0);
  const tax = 0; // typically supplier quotations are pre-tax for international
  const total = subtotal + shipping + tax;

  return {
    estimator: "local",
    currency: "USD",
    lineItems: lines,
    subtotal: round2(subtotal),
    shipping: round2(shipping),
    tax: round2(tax),
    total: round2(total),
    notes: ["Heuristic estimate based on selected options; vendor quote may vary."],
  };
}

export function round2(n) {
  return Math.round(Number(n || 0) * 100) / 100;
}
