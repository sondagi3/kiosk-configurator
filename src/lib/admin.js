// src/lib/admin.js

/** Corporate defaults (unchanged) */
export const DEFAULT_ADMIN = {
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
  touch: { types: ["PCAP", "IR"] },
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
  warranty: { noSubstitutions: true, years: 2 },
  customFields: [],

  // NEW: Alibaba catalog used by the enhanced spec
  alibaba: {
    screenSizes: [
      '21.5" FHD', '32" FHD', '43" FHD', '43" 4K', '49" 4K', '55" 4K', '65" 4K', '75" 4K', '86" 4K',
    ],
    panelBrandTiers: ["Standard (BOE/Innolux/etc.)", "Premium (LG/Samsung)"],
    brightnessTiers: ["300–350", "500–550", "1000+", "1500–2000"],
    touchTech: ["IR 10-Point", "IR 20-Point", "PCAP"],
    touchGlassOptions: ["4mm Tempered", "6mm Thick", "Anti-Glare", "Anti-Fingerprint"],

    osOptions: ["Android 12", "Android 13", "Windows 11 Pro", "Dual-Boot (Android + Win)", "No OS"],
    cpuOptions: ["RK3288", "RK3566", "RK3588", "Intel Celeron J4125", "Intel i3", "Intel i5"],
    ramOptions: ["2GB", "4GB", "8GB", "16GB"],
    storageOptions: ["32GB eMMC", "64GB eMMC", "128GB eMMC", "256GB SSD", "512GB SSD", "1TB SSD"],

    portsDefaults: {
      usb2: 2, usb3: 2, rj45: 1, hdmiIn: 1, hdmiOut: 1, serial: 1, audio: 1,
      wifi: "Dual-band (2.4/5GHz)", bluetooth: "5.0",
    },

    peripherals: {
      paymentId: [
        "RFID (125k/13.56MHz)", "NFC Reader", "EMV Credit Card Pin Pad",
        "Bill/Coin Acceptor", "Barcode/QR Scanner", "Face Recognition Camera", "Fingerprint Scanner",
      ],
      printing: ["Thermal 58mm", "Ticket 80mm", "Label Printer"],
      cameras: ["Internal 2MP", "External 1080p", "5MP", "8MP"],
      audio: ["Internal Speakers 2x10W", "External Speaker Set", "Noise-Canceling Mic Array"],
      other: ["VESA Mount", "External Button Kit", "Keyboard Drawer"],
    },

    enclosure: {
      materials: ["Aluminum + Steel", "Stainless Steel"],
      finishes: ["Brushed Silver", "Powder-Coated Black", "Powder-Coated White", "Custom RAL"],
      baseOptions: ["Fixed Weighted Base", "Motorized Height-Adjustable Stand", "Mobile Base (Castors)", "Wall Mount"],
      ipRatings: ["IP20", "IP54", "IP65"],
      branding: ["No Logos", "Silkscreen Logo", "Laser Engraving"],
    },

    softwareOptions: ["No software", "Basic Android Signage App", "1-Year Cloud CMS License", "Windows Signage Software"],
    shippingTerms: ["FOB", "CIF", "DDP", "EXW"],
    certifications: ["CE", "FCC", "RoHS", "ISO 9001:2015"],
    warrantyYears: [1, 2, 3],
  },
};

export function defaultAlibabaFromAdmin(admin = DEFAULT_ADMIN) {
  // Robust fallback: if an older admin (from localStorage) lacks .alibaba, use DEFAULT_ADMIN.alibaba
  const a = (admin && admin.alibaba) ? admin.alibaba : DEFAULT_ADMIN.alibaba;

  return {
    screenSize: a.screenSizes[2] || '43" FHD',
    panelBrandTier: a.panelBrandTiers[0],
    brightnessTier: a.brightnessTiers[1] || "500–550",
    touchTech: a.touchTech[0],
    touchGlass: ["4mm Tempered"],

    os: a.osOptions[0],
    cpu: a.cpuOptions[1] || "RK3566",
    ram: a.ramOptions[1] || "4GB",
    storage: a.storageOptions[1] || "64GB eMMC",
    gpuRequired: false,

    ports: {
      usb2: a.portsDefaults.usb2,
      usb3: a.portsDefaults.usb3,
      rj45: a.portsDefaults.rj45,
      addSecondLan: false,
      hdmiIn: a.portsDefaults.hdmiIn,
      hdmiOut: a.portsDefaults.hdmiOut,
      serial: a.portsDefaults.serial,
      addSecondSerial: false,
      audio: a.portsDefaults.audio,
      wifi: a.portsDefaults.wifi,
      bluetooth: a.portsDefaults.bluetooth,
      lteModule: false,
      gpioRequired: false,
    },

    peripherals: {
      paymentId: [],
      printing: [],
      cameras: ["Internal 2MP"],
      audio: ["Internal Speakers 2x10W"],
      other: ["VESA Mount"],
    },

    enclosure: {
      material: "Aluminum + Steel",
      finish: "Brushed Silver",
      customRal: "",
      base: "Fixed Weighted Base",
      ipRating: "IP20",
      branding: "No Logos",
    },

    software: { cms: "No software", kioskLockdown: true },
    warranty: { years: 1, onSiteService: false, spareTouchGlass: 0, sparePowerAdapter: 0 },
    logistics: { shipping: "FOB", sampleUnit: true },
    certifications: ["CE", "FCC", "RoHS"],
  };
}

export function defaultSpecFromAdmin(admin = DEFAULT_ADMIN) {
  const base = {
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

  // Add robust nested spec
  base.alibaba = defaultAlibabaFromAdmin(admin);
  return base;
}

export function clampSpecToAdmin(spec, admin = DEFAULT_ADMIN) {
  const s = { ...spec };
  const clamp = (arr, val) => (arr.includes(val) ? val : (arr[0] || ""));

  // existing clamps...
  if (!admin.display.allowedBrands.includes(s.displayBrand)) s.displayBrand = admin.display.allowedBrands[0] || "";
  if (!admin.display.sizeOptions.includes(s.size)) s.size = admin.display.sizeOptions[0] || "";
  if (!admin.display.resolutionOptions.includes(s.resolution)) s.resolution = admin.display.resolutionOptions[0] || "";
  if (+s.brightness < admin.display.minBrightness) s.brightness = String(admin.display.minBrightness);
  if (+s.contrast < admin.display.minContrast) s.contrast = String(admin.display.minContrast);
  if (!admin.pc.cpuOptions.includes(s.cpuRam)) s.cpuRam = admin.pc.cpuOptions[0] || "";
  if (!admin.pc.osOptions.includes(s.os)) s.os = admin.pc.osOptions[0] || "";
  if (s.hasTouch === "Yes" && !admin.touch.types.includes(s.touchType)) s.touchType = admin.touch.types[0] || "";
  s.cameraModel = clamp(admin.peripherals.cameras, s.cameraModel);
  s.micModel = clamp(admin.peripherals.mics, s.micModel);
  s.speakerModel = clamp(admin.peripherals.speakers, s.speakerModel);
  s.qrModel = clamp(admin.peripherals.qrScanners, s.qrModel);
  s.badgePrinterModel = clamp(admin.peripherals.badgePrinters, s.badgePrinterModel);
  s.wallMount = clamp(admin.peripherals.wallMounts, s.wallMount);
  if (!admin.docs.packagingOptions.includes(s.packaging)) s.packaging = admin.docs.packagingOptions[0] || "";
  s.certifications = admin.docs.certifications.join(", ");
  s.labelsProvided = admin.docs.labels ? "Yes" : "No";
  s.manualProvided = admin.docs.manual ? "Yes" : "No";
  s.proofBeforeShip = admin.docs.proofBeforeShip ? "Yes" : "No";
  s.visualProof = admin.docs.visualProof ? "Yes" : "No";
  s.canadIanWireColors = admin.docs.requireCanadianWiringColors ? "Yes" : "No";
  s.noSubstitutions = admin.warranty.noSubstitutions ? "Yes" : "No";
  s.warrantyYears = String(admin.warranty.years);

  // NEW: clamps with safe fallback when admin.alibaba is missing
  const A = admin.alibaba || DEFAULT_ADMIN.alibaba;
  s.alibaba ||= defaultAlibabaFromAdmin(admin);

  const keepIn = (arr, val) => (arr.includes(val) ? val : arr[0]);
  const keepMany = (arr, vals = []) => vals.filter((v) => arr.includes(v));

  s.alibaba.screenSize       = keepIn(A.screenSizes, s.alibaba.screenSize);
  s.alibaba.panelBrandTier   = keepIn(A.panelBrandTiers, s.alibaba.panelBrandTier);
  s.alibaba.brightnessTier   = keepIn(A.brightnessTiers, s.alibaba.brightnessTier);
  s.alibaba.touchTech        = keepIn(A.touchTech, s.alibaba.touchTech);
  s.alibaba.touchGlass       = keepMany(A.touchGlassOptions, s.alibaba.touchGlass || []);

  s.alibaba.os      = keepIn(A.osOptions, s.alibaba.os);
  s.alibaba.cpu     = keepIn(A.cpuOptions, s.alibaba.cpu);
  s.alibaba.ram     = keepIn(A.ramOptions, s.alibaba.ram);
  s.alibaba.storage = keepIn(A.storageOptions, s.alibaba.storage);
  s.alibaba.gpuRequired = !!s.alibaba.gpuRequired;

  const p = s.alibaba.ports || {};
  s.alibaba.ports = {
    usb2: Math.max(0, Number.isFinite(+p.usb2) ? +p.usb2 : A.portsDefaults.usb2),
    usb3: Math.max(0, Number.isFinite(+p.usb3) ? +p.usb3 : A.portsDefaults.usb3),
    rj45: Math.max(0, Number.isFinite(+p.rj45) ? +p.rj45 : A.portsDefaults.rj45),
    addSecondLan: !!p.addSecondLan,
    hdmiIn: Math.max(0, Number.isFinite(+p.hdmiIn) ? +p.hdmiIn : A.portsDefaults.hdmiIn),
    hdmiOut: Math.max(0, Number.isFinite(+p.hdmiOut) ? +p.hdmiOut : A.portsDefaults.hdmiOut),
    serial: Math.max(0, Number.isFinite(+p.serial) ? +p.serial : A.portsDefaults.serial),
    addSecondSerial: !!p.addSecondSerial,
    audio: Math.max(0, Number.isFinite(+p.audio) ? +p.audio : A.portsDefaults.audio),
    wifi: p.wifi || A.portsDefaults.wifi,
    bluetooth: p.bluetooth || A.portsDefaults.bluetooth,
    lteModule: !!p.lteModule,
    gpioRequired: !!p.gpioRequired,
  };

  s.alibaba.peripherals = {
    paymentId: keepMany(A.peripherals.paymentId, s.alibaba.peripherals?.paymentId),
    printing:  keepMany(A.peripherals.printing,  s.alibaba.peripherals?.printing),
    cameras:   keepMany(A.peripherals.cameras,   s.alibaba.peripherals?.cameras),
    audio:     keepMany(A.peripherals.audio,     s.alibaba.peripherals?.audio),
    other:     keepMany(A.peripherals.other,     s.alibaba.peripherals?.other),
  };

  const e = s.alibaba.enclosure || {};
  s.alibaba.enclosure = {
    material: keepIn(A.enclosure.materials,   e.material || A.enclosure.materials[0]),
    finish:   keepIn(A.enclosure.finishes,    e.finish   || A.enclosure.finishes[0]),
    customRal: e.customRal || "",
    base:     keepIn(A.enclosure.baseOptions, e.base     || A.enclosure.baseOptions[0]),
    ipRating: keepIn(A.enclosure.ipRatings,   e.ipRating || A.enclosure.ipRatings[0]),
    branding: keepIn(A.enclosure.branding,    e.branding || A.enclosure.branding[0]),
  };

  const soft = s.alibaba.software || {};
  s.alibaba.software = {
    cms: (A.softwareOptions.includes(soft.cms) ? soft.cms : A.softwareOptions[0]),
    kioskLockdown: !!(soft.kioskLockdown ?? true),
  };

  const w = s.alibaba.warranty || {};
  s.alibaba.warranty = {
    years: (A.warrantyYears.includes(w.years) ? w.years : A.warrantyYears[0]),
    onSiteService: !!w.onSiteService,
    spareTouchGlass: Math.max(0, +w.spareTouchGlass || 0),
    sparePowerAdapter: Math.max(0, +w.sparePowerAdapter || 0),
  };

  const l = s.alibaba.logistics || {};
  s.alibaba.logistics = {
    shipping: (A.shippingTerms.includes(l.shipping) ? l.shipping : A.shippingTerms[0]),
    sampleUnit: !!(l.sampleUnit ?? true),
  };

  s.alibaba.certifications = keepMany(A.certifications, s.alibaba.certifications || []);
  return s;
}
