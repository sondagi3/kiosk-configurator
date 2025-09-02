// src/components/SpecForm.jsx
import React, { useEffect } from "react";
import { Monitor, Cpu, Wifi, Layers, Building2, ShieldCheck, Package as PackageIcon } from "lucide-react";
import { Section, Field, Text, Select, Checkbox, CheckGroup } from "./Inputs.jsx";
import { nowISO } from "../lib/utils.js";
import { defaultAlibabaFromAdmin, DEFAULT_ADMIN } from "../lib/admin.js";

export default function SpecForm({ order, setOrder, admin }) {
  // Ensure nested spec exists for older orders
  useEffect(() => {
    if (!order.spec.alibaba) {
      const defaults = defaultAlibabaFromAdmin(admin);
      setOrder((o) => ({ ...o, spec: { ...o.spec, alibaba: defaults }, updatedAt: nowISO() }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const a = order.spec.alibaba || defaultAlibabaFromAdmin(admin);
  const AL = admin.alibaba || DEFAULT_ADMIN.alibaba; // safe options fallback

  const up = (patch) =>
    setOrder((o) => ({ ...o, spec: { ...o.spec, alibaba: { ...a, ...patch } }, updatedAt: nowISO() }));

  // Section 1
  const S1 = (
    <Section title="Core Display & Touchscreen (Alibaba Edition)" icon={<Monitor className="h-6 w-6 text-gray-800" />}>
      <Field label="1.1 Screen Size & Resolution">
        <Select value={a.screenSize} onChange={(v) => up({ screenSize: v })} options={AL.screenSizes} />
      </Field>
      <Field label="1.2 Panel Brand Tier">
        <Select value={a.panelBrandTier} onChange={(v) => up({ panelBrandTier: v })} options={AL.panelBrandTiers} />
      </Field>
      <Field label="1.3 Brightness (nits)">
        <Select value={a.brightnessTier} onChange={(v) => up({ brightnessTier: v })} options={AL.brightnessTiers} />
      </Field>
      <Field label="1.4 Touch Technology">
        <Select value={a.touchTech} onChange={(v) => up({ touchTech: v })} options={AL.touchTech} />
      </Field>
      <Field label="1.5 Touch Glass (multi-select)">
        <CheckGroup value={a.touchGlass} onChange={(arr) => up({ touchGlass: arr })} options={AL.touchGlassOptions} />
      </Field>
    </Section>
  );

  // Section 2
  const S2 = (
    <Section title="Computing Hardware" icon={<Cpu className="h-6 w-6 text-gray-800" />}>
      <Field label="2.1 Operating System">
        <Select value={a.os} onChange={(v) => up({ os: v })} options={AL.osOptions} />
      </Field>
      <Field label="2.2 Processor (CPU)">
        <Select value={a.cpu} onChange={(v) => up({ cpu: v })} options={AL.cpuOptions} />
      </Field>
      <Field label="2.3 Memory (RAM)">
        <Select value={a.ram} onChange={(v) => up({ ram: v })} options={AL.ramOptions} />
      </Field>
      <Field label="2.4 Internal Storage">
        <Select value={a.storage} onChange={(v) => up({ storage: v })} options={AL.storageOptions} />
      </Field>
      <Field label="2.5 Dedicated GPU Required?">
        <Checkbox checked={!!a.gpuRequired} onChange={(b) => up({ gpuRequired: b })} label="Yes, requires dedicated GPU" />
      </Field>
    </Section>
  );

  // Section 3
  const ports = a.ports || AL.portsDefaults;
  const updPorts = (p) => up({ ports: { ...ports, ...p } });

  const S3 = (
    <Section title="Ports & Connectivity" icon={<Wifi className="h-6 w-6 text-gray-800" />}>
      <Field label="USB 2.0 (qty)"><Text type="number" value={String(ports.usb2)} onChange={(v) => updPorts({ usb2: Math.max(0, +v || 0) })} /></Field>
      <Field label="USB 3.0 (qty)"><Text type="number" value={String(ports.usb3)} onChange={(v) => updPorts({ usb3: Math.max(0, +v || 0) })} /></Field>
      <Field label="RJ45 LAN (qty)"><Text type="number" value={String(ports.rj45)} onChange={(v) => updPorts({ rj45: Math.max(0, +v || 0) })} /></Field>
      <Field label="Add second LAN port"><Checkbox checked={!!ports.addSecondLan} onChange={(b) => updPorts({ addSecondLan: b })} label="Yes" /></Field>
      <Field label="HDMI-IN (qty)"><Text type="number" value={String(ports.hdmiIn)} onChange={(v) => updPorts({ hdmiIn: Math.max(0, +v || 0) })} /></Field>
      <Field label="HDMI-OUT (qty)"><Text type="number" value={String(ports.hdmiOut)} onChange={(v) => updPorts({ hdmiOut: Math.max(0, +v || 0) })} /></Field>
      <Field label="Serial (COM/RS232) (qty)"><Text type="number" value={String(ports.serial)} onChange={(v) => updPorts({ serial: Math.max(0, +v || 0) })} /></Field>
      <Field label="Add second serial port"><Checkbox checked={!!ports.addSecondSerial} onChange={(b) => updPorts({ addSecondSerial: b })} label="Yes" /></Field>
      <Field label="Audio Jack (qty)"><Text type="number" value={String(ports.audio)} onChange={(v) => updPorts({ audio: Math.max(0, +v || 0) })} /></Field>
      <Field label="Wi-Fi"><Text value={ports.wifi || ""} onChange={(v) => updPorts({ wifi: v })} placeholder="Dual-band (2.4/5GHz)" /></Field>
      <Field label="Bluetooth"><Text value={ports.bluetooth || ""} onChange={(v) => updPorts({ bluetooth: v })} placeholder="5.0" /></Field>
      <Field label="4G/LTE Module"><Checkbox checked={!!ports.lteModule} onChange={(b) => updPorts({ lteModule: b })} label="Include internal module" /></Field>
      <Field label="GPIO Ports"><Checkbox checked={!!ports.gpioRequired} onChange={(b) => updPorts({ gpioRequired: b })} label="Required for custom triggers/buttons" /></Field>
    </Section>
  );

  // Section 4
  const per = a.peripherals || {};
  const updPer = (p) => up({ peripherals: { ...per, ...p } });

  const S4 = (
    <Section title="Peripherals & Add-Ons" icon={<Layers className="h-6 w-6 text-gray-800" />}>
      <Field label="4.1 Payment & ID"><CheckGroup value={per.paymentId || []} onChange={(arr) => updPer({ paymentId: arr })} options={AL.peripherals.paymentId} /></Field>
      <Field label="4.2 Printing"><CheckGroup value={per.printing || []} onChange={(arr) => updPer({ printing: arr })} options={AL.peripherals.printing} /></Field>
      <Field label="4.3 Cameras"><CheckGroup value={per.cameras || []} onChange={(arr) => updPer({ cameras: arr })} options={AL.peripherals.cameras} /></Field>
      <Field label="4.4 Audio"><CheckGroup value={per.audio || []} onChange={(arr) => updPer({ audio: arr })} options={AL.peripherals.audio} /></Field>
      <Field label="4.5 Other Hardware"><CheckGroup value={per.other || []} onChange={(arr) => updPer({ other: arr })} options={AL.peripherals.other} /></Field>
    </Section>
  );

  // Section 5
  const enc = a.enclosure || {};
  const updEnc = (p) => up({ enclosure: { ...enc, ...p } });

  const S5 = (
    <Section title="Enclosure & Design" icon={<Building2 className="h-6 w-6 text-gray-800" />}>
      <Field label="5.1 Material"><Select value={enc.material || ""} onChange={(v) => updEnc({ material: v })} options={AL.enclosure.materials} /></Field>
      <Field label="5.2 Color / Finish"><Select value={enc.finish || ""} onChange={(v) => updEnc({ finish: v })} options={AL.enclosure.finishes} /></Field>
      {enc.finish === "Custom RAL" ? (
        <Field label="Custom RAL Code"><Text value={enc.customRal || ""} onChange={(v) => updEnc({ customRal: v })} placeholder="e.g., RAL 3020" /></Field>
      ) : null}
      <Field label="5.3 Mounting Base"><Select value={enc.base || ""} onChange={(v) => updEnc({ base: v })} options={AL.enclosure.baseOptions} /></Field>
      <Field label="5.4 IP Rating"><Select value={enc.ipRating || ""} onChange={(v) => updEnc({ ipRating: v })} options={AL.enclosure.ipRatings} /></Field>
      <Field label="5.5 Branding"><Select value={enc.branding || ""} onChange={(v) => updEnc({ branding: v })} options={AL.enclosure.branding} /></Field>
    </Section>
  );

  // Section 6
  const soft = a.software || {};
  const war = a.warranty || {};
  const logi = a.logistics || {};

  const S6 = (
    <Section title="Software, Warranty & Logistics" icon={<PackageIcon className="h-6 w-6 text-gray-800" />}>
      <Field label="6.1 CMS Software"><Select value={soft.cms || ""} onChange={(v) => up({ software: { ...soft, cms: v } })} options={AL.softwareOptions} /></Field>
      <Field label="6.2 Kiosk Lockdown"><Checkbox checked={!!soft.kioskLockdown} onChange={(b) => up({ software: { ...soft, kioskLockdown: b } })} label="Yes, enable kiosk mode" /></Field>
      <Field label="6.3 Warranty (years)"><Select value={String(war.years ?? 1)} onChange={(v) => up({ warranty: { ...war, years: Number(v) || 1 } })} options={AL.warrantyYears.map(String)} /></Field>
      <Field label="On-site service required?"><Checkbox checked={!!war.onSiteService} onChange={(b) => up({ warranty: { ...war, onSiteService: b } })} label="Yes, include on-site service" /></Field>
      <Field label="6.4 Spare Parts – Touch Glass (qty)"><Text type="number" value={String(war.spareTouchGlass ?? 0)} onChange={(v) => up({ warranty: { ...war, spareTouchGlass: Math.max(0, +v || 0) } })} /></Field>
      <Field label="6.4 Spare Parts – Power Adapter (qty)"><Text type="number" value={String(war.sparePowerAdapter ?? 0)} onChange={(v) => up({ warranty: { ...war, sparePowerAdapter: Math.max(0, +v || 0) } })} /></Field>
      <Field label="6.5 Shipping Terms"><Select value={logi.shipping || ""} onChange={(v) => up({ logistics: { ...logi, shipping: v } })} options={AL.shippingTerms} /></Field>
      <Field label="6.6 Sample Unit"><Checkbox checked={!!logi.sampleUnit} onChange={(b) => up({ logistics: { ...logi, sampleUnit: b } })} label="Yes, require a sample unit first" /></Field>
    </Section>
  );

  // Section 7
  const S7 = (
    <Section title="Certification & Compliance" icon={<ShieldCheck className="h-6 w-6 text-gray-800" />}>
      <Field label="Certificates required (attach copies when available)">
        <CheckGroup value={a.certifications || []} onChange={(arr) => up({ certifications: arr })} options={AL.certifications} />
      </Field>
      <div className="md:col-span-2 text-xs text-gray-600">
        CE (EU), FCC (USA), RoHS (EU), and ISO 9001:2015 (factory) are common import requirements.
      </div>
    </Section>
  );

  return (<>{S1}{S2}{S3}{S4}{S5}{S6}{S7}</>);
}
