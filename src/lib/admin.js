// src/lib/admin.js
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
};

export function defaultSpecFromAdmin(admin) {
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

export function clampSpecToAdmin(spec, admin) {
  const s = { ...spec };
  const clamp = (arr, val) => (arr.includes(val) ? val : (arr[0] || ""));
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
  return s;
}
